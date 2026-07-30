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

    // Fetch only the current account's orders with items and product details.
    const { data: orders, error } = await supabaseAdmin
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: orders || [] });
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: error?.message || 'Sifarişlər yüklənə bilmədi.' }, { status: 500 });
  }
}
