import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { toDbStatus } from '@/lib/statusHelper';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { orderId, sessionId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Sifariş nömrəsi çatışmır' }, { status: 400 });
    }

    // Verify session with Stripe if sessionId exists
    let isPaid = true;
    if (sessionId && sessionId.startsWith('cs_')) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === 'paid') {
          isPaid = true;
        }
      } catch (e) {
        console.error('Stripe session retrieval error:', e);
      }
    }

    if (isPaid) {
      // Keep order status as pending in Supabase as requested
      const { error } = await supabaseAdmin
        .from('orders')
        .update({ status: toDbStatus('pending') })
        .eq('id', orderId);

      if (error) {
        console.error('Order status update error in Supabase:', error);
      }
    }

    return NextResponse.json({ success: true, status: isPaid ? 'confirmed' : 'pending' });
  } catch (error: any) {
    console.error('Confirm Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Xəta baş verdi' }, { status: 500 });
  }
}
