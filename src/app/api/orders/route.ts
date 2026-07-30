import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Sifarişləri görmək üçün daxil olun.' }, { status: 401 });

    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authData.user) return NextResponse.json({ error: 'Sessiya etibarlı deyil.' }, { status: 401 });
    const userId = authData.user.id;
    const userEmail = authData.user.email?.trim().toLowerCase();

    // New orders use `user_id`. Older orders were created before that field
    // was saved, so their checkout email is stored in the address text.
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

    const orders = (allOrders || []).filter((order: any) => {
      if (order.user_id === userId) return true;
      const addressEmail = String(order.catdirilma_unvani || '').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0]?.toLowerCase();
      return Boolean(userEmail && addressEmail === userEmail);
    });

    return NextResponse.json({ data: orders });
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: error?.message || 'Sifarişlər yüklənə bilmədi.' }, { status: 500 });
  }
}
