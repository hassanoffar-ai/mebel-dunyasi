import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type Stripe from 'stripe';
import { toDbStatus } from '@/lib/statusHelper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !signature) {
    return NextResponse.json(
      { error: 'Webhook konfiqurasiyası natamamdır' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Naməlum webhook xətası';

    console.error('Webhook imzası təsdiqlənmədi:', message);

    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const orderId = session.metadata?.order_id;
    const userId = session.metadata?.user_id;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Metadata daxilində order_id yoxdur' },
        { status: 400 }
      );
    }

    const { error: orderError } = await supabaseAdmin
      .from('orders')
      .update({ status: toDbStatus('confirmed') })
      .eq('id', orderId);

    if (orderError) {
      console.error('Sifariş yenilənmədi:', orderError);

      return NextResponse.json(
        { error: orderError.message },
        { status: 500 }
      );
    }

    if (userId) {
      const { error: cartError } = await supabaseAdmin
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (cartError) {
        console.error('Səbət təmizlənmədi:', cartError);
      }
    }
  }

  return NextResponse.json({ received: true });
}