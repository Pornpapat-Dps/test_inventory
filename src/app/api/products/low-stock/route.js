import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .lt('stock_quantity', 5)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ data, count: data.length }, { status: 200 })
}

