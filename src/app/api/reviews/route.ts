import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const preferredRegion = 'fra1';

export async function GET(req: Request) {
  try {
    const productId = new URL(req.url).searchParams.get('product_id');
    if (!productId) return NextResponse.json({ error: 'Məhsul məlumatı çatışmır.' }, { status: 400 });

    const [approvedResult, countResult] = await Promise.all([
      supabaseAdmin
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .in('status', ['tesdiqlendi', 'confirmed'])
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId)
        .in('status', ['gozlemede', 'pending', 'tesdiqlendi', 'confirmed']),
    ]);

    if (approvedResult.error) throw approvedResult.error;
    if (countResult.error) throw countResult.error;
    return NextResponse.json({ data: approvedResult.data || [], count: countResult.count || 0 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Rəylər yüklənə bilmədi.' }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const { product_id, user_id, user_name, user_email, rating, comment } = await req.json();
    if (!product_id || !user_name?.trim() || !comment?.trim() || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rəy məlumatları düzgün deyil.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('reviews').insert({
      product_id,
      user_id: user_id || null,
      ulduz: rating,
      metn: JSON.stringify({
        user_name: user_name.trim(),
        user_email: user_email ? user_email.trim() : null,
        comment: comment.trim()
      }),
      status: 'gozlemede',
    });
    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error('Review create error:', error);
    return NextResponse.json({ error: error?.message || 'Rəy göndərilə bilmədi.' }, { status: 400 });
  }
}
