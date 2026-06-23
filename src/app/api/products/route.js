
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  const body = await request.json()
  const { name, sku, cost_price, category_id, stock_quantity = 0 } = body

  if (!name || !sku || cost_price == null) {
    return Response.json(
      { error: 'กรุณากรอกข้อมูลให้ครบ ชื่อ รหัสสินค้า และราคาทุน' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('products')
    .insert({ name, sku, cost_price: Number(cost_price), stock_quantity: Number(stock_quantity), category_id: category_id ?? null })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return Response.json({ error: `รหัสสินค้า "${sku}" ซ้ำ` }, { status: 409 })
    }
    if (error.code === '23503') {
      return Response.json({ error: 'หมวดหมู่สินค้าไม่ถูกต้อง' }, { status: 404 })
    }
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ data }, { status: 201 })
}
