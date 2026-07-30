import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { toDbStatus } from '@/lib/statusHelper';

export const dynamic = 'force-dynamic';
export const preferredRegion = 'fra1';

export async function POST(req: Request) {
  try {
    const { cartItems, customer, email, telefon, catdirilma_unvani } = await req.json();
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Sifariş üçün hesabınıza daxil olun.' }, { status: 401 });
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authData.user) return NextResponse.json({ error: 'Sessiya etibarlı deyil.' }, { status: 401 });
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: 'Səbət boşdur.' }, { status: 400 });
    }
    const total = cartItems.reduce((sum: number, item: any) => sum + Number(item.price) * Number(item.quantity || 1), 0);
    
    let order: any = null;
    let orderError: any = null;

    const baseOrderPayload = {
      user_id: authData.user.id,
      telefon,
      umumi_meblegh: total,
      status: toDbStatus('pending'),
      odenis_usulu: 'Nağd (Kuryerə)',
    };

    try {
      const formattedAddress = `Müştəri: ${customer || 'Müştəri'} (${email || 'E-poçtsuz'}), Ünvan: ${catdirilma_unvani || 'Baku, Azerbaijan'}`;
      const result = await supabaseAdmin.from('orders').insert({
        ...baseOrderPayload,
        catdirilma_unvani: formattedAddress.slice(0, 500),
      }).select().single();
      order = result.data;
      orderError = result.error;
    } catch (err: any) {
      orderError = err;
    }

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
