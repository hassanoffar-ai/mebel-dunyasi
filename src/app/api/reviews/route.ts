import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const preferredRegion = 'fra1';

export async function POST(req: Request) {
  try {
    const { product_id, user_name, rating, comment } = await req.json();
    if (!product_id || !user_name?.trim() || !comment?.trim() || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rəy məlumatları düzgün deyil.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('reviews').insert({
      product_id,
      user_name: user_name.trim(),
      ulduz: rating,
      metn: comment.trim(),
      status: 'gozlemede',
    });
    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error('Review create error:', error);
    return NextResponse.json({ error: error?.message || 'Rəy göndərilə bilmədi.' }, { status: 400 });
  }
}
