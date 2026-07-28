import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // In dev test fallback if secret is not set yet
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle 'checkout.session.completed' event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const orderId = session.metadata?.order_id;

    if (orderId) {
      // 1. Update order status to 'yeni' (Payment confirmed)
      await supabase.from('orders').update({ status: 'yeni' }).eq('id', orderId);

      // 2. Clear user's cart_items if user_id is linked
      if (session.customer_email) {
        await supabase.from('cart_items').delete().eq('user_email', session.customer_email);
      }
    }
  }

  return NextResponse.json({ received: true });
}
