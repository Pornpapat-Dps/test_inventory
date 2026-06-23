import { supabase } from '@/lib/supabase'

// รับค่า Product ID และจำนวนที่ต้องการปรับ (เช่น +10 หรือ -5)
// Logic สำคัญ: ต้องตรวจสอบไม่ให้จำนวนสต็อกติดลบ และต้องบันทึกลง 
// Transaction Table ทุกครั้งที่มีการปรับปรุง

export async function PATCH(request) {
  const body = await request.json()
  const { product_id, quantity, note = '' } = body

  if (product_id == null || quantity == null) {
    return Response.json(
      { error: 'กรุณากรอกข้อมูลให้ครบ รหัสสินค้า และจำนวน' },
      { status: 400 }
    )
  }

  if (!Number.isInteger(Number(quantity)) || Number(quantity) === 0) {
    return Response.json(
      { error: 'จำนวนต้องเป็นจำนวนเต็มที่ไม่ใช่ศูนย์' },
      { status: 400 }
    )
  }

  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('*')
    .eq('id', product_id)
    .single()

  if (fetchError || !product) {
    return Response.json({ error: 'รหัสสินค้าไม่ถูกต้อง' }, { status: 404 })
  }

  const newStock = product.stock_quantity + Number(quantity)
  if (newStock < 0) {
    return Response.json(
      {
        error: 'สต๊อกไม่เพียงพอสำหรับการปรับลดนี้',
        current_stock: product.stock_quantity,
        requested: Number(quantity),
      },
      { status: 422 }
    )
  }

  const { data: updatedProduct, error: updateError } = await supabase
    .from('products')
    .update({ stock_quantity: newStock })
    .eq('id', product_id)
    .select()
    .single()

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 })
  }

  const { data: transaction, error: txError } = await supabase
    .from('stock_transactions')
    .insert({
      product_id: Number(product_id),
      type: Number(quantity) > 0 ? 'IN' : 'OUT',
      quantity: Math.abs(Number(quantity)),
      note,
    })
    .select()
    .single()

  if (txError) {
    return Response.json({ error: txError.message }, { status: 500 })
  }

  return Response.json({ data: { product: updatedProduct, transaction } }, { status: 200 })
}
