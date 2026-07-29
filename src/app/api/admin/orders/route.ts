import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { toDbStatus, toClientStatus } from '@/lib/statusHelper';

export const dynamic = 'force-dynamic';
export const preferredRegion = 'fra1';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*, products(*, product_images(sekil_url, esas_sekil, sira)))')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Map database status back to client English status for frontend compatibility
  const mappedData = data ? data.map((order: any) => ({
    ...order,
    status: toClientStatus(order.status),
  })) : [];

  return NextResponse.json({ data: mappedData });
}

export async function PATCH(req: Request) {
  try {
    const { id, status, notes } = await req.json();
    if (!id || !status) return NextResponse.json({ error: 'Sifariş məlumatı çatışmır.' }, { status: 400 });

    const dbStatus = toDbStatus(status);
    let error = null;
    if (notes) {
      const firstAttempt = await supabaseAdmin.from('orders').update({ status: dbStatus, notes }).eq('id', id);
      error = firstAttempt.error;
      
      // Fallback: If notes column does not exist, update status only
      if (error && (error.message?.includes("column") || error.code === 'PGRST204' || error.code === '42703')) {
        const secondAttempt = await supabaseAdmin.from('orders').update({ status: dbStatus }).eq('id', id);
        error = secondAttempt.error;
      }
    } else {
      const attempt = await supabaseAdmin.from('orders').update({ status: dbStatus }).eq('id', id);
      error = attempt.error;
    }

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Sifariş yenilənə bilmədi.' }, { status: 400 });
  }
}
