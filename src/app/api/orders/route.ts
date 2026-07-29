import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const user_id = searchParams.get('user_id');

    if (!email && !user_id) {
      return NextResponse.json({ error: 'Məlumat çatışmır.' }, { status: 400 });
    }

    // Fetch all orders with items and product details
    const { data: allOrders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          say,
          vahid_qiymet,
          product_id,
          products (
            ad,
            qiymet,
            product_images (
              sekil_url,
              esas_sekil
            )
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Filter orders by user_id or if email is stored in catdirilma_unvani
    const filteredOrders = allOrders ? allOrders.filter((order: any) => {
      const matchUserId = user_id && order.user_id === user_id;
      const matchEmail = email && order.catdirilma_unvani && order.catdirilma_unvani.toLowerCase().includes(email.toLowerCase());
      return matchUserId || matchEmail;
    }) : [];

    return NextResponse.json({ data: filteredOrders });
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: error?.message || 'Sifarişlər yüklənə bilmədi.' }, { status: 500 });
  }
}
