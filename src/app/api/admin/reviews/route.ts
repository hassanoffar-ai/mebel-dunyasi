import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const preferredRegion = 'fra1';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('*, products(ad, xususiyyetler, product_images(sekil_url, sira))')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data: data || [] });
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ error: 'Rəy məlumatı çatışmır.' }, { status: 400 });
    const { error } = await supabaseAdmin.from('reviews').update({ status }).eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Rəy yenilənə bilmədi.' }, { status: 400 });
  }
}
