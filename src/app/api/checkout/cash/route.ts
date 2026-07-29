import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const preferredRegion = 'fra1';

export async function POST(req: Request) {
  try {
    const { cartItems, customer, email, telefon, catdirilma_unvani, user_id } = await req.json();
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: 'Səbət boşdur.' }, { status: 400 });
    }
    const total = cartItems.reduce((sum: number, item: any) => sum + Number(item.price) * Number(item.quantity || 1), 0);
    const { data: order, error: orderError } = await supabaseAdmin.from('orders').insert({
      user_id: user_id || null,
      customer,
      email,
      telefon,
      catdirilma_unvani,
      umumi_meblegh: total,
      status: 'pending',
      odenis_usulu: 'Nağd (Kuryerə)',
    }).select().single();
    if (orderError || !order) throw orderError || new Error('Sifariş yaradıla bilmədi.');

    const { error: itemsError } = await supabaseAdmin.from('order_items').insert(cartItems.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      say: item.quantity || 1,
      vahid_qiymet: item.price,
    })));
    if (itemsError) throw itemsError;

    return NextResponse.json({ id: order.id });
  } catch (error: any) {
    console.error('Cash checkout error:', error);
    return NextResponse.json({ error: error?.message || 'Sifariş yaradıla bilmədi.' }, { status: 400 });
  }
}
