import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cartItems, user_id, catdirilma_unvani, telefon } = body;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Səbət boşdur' }, { status: 400 });
    }

    // Calculate total amount in AZN
    const umumi_meblegh = cartItems.reduce(
      (acc: number, item: any) => acc + item.qiymet * (item.say || item.quantity || 1),
      0
    );

    // 1. Save order in Supabase with status = 'gozleyir_odenis'
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: user_id || null,
          umumi_meblegh,
          status: 'gozleyir_odenis',
          catdirilma_unvani: catdirilma_unvani || 'Baku, Azerbaijan',
          telefon: telefon || '+994 50 000 00 00',
          odenis_usulu: 'Stripe Card',
        },
      ])
      .select()
      .single();

    let orderId = order?.id;

    // Fallback order ID if Supabase table is mock or pending
    if (orderError || !orderId) {
      orderId = 'MD-' + Math.floor(100000 + Math.random() * 900000);
    } else {
      // Insert order items
      const orderItems = cartItems.map((item: any) => ({
        order_id: orderId,
        product_id: item.product_id || item.id,
        say: item.say || item.quantity || 1,
        vahid_qiymet: item.qiymet || item.price,
      }));
      await supabase.from('order_items').insert(orderItems);
    }

    // Origin URL
    const origin = req.headers.get('origin') || 'http://localhost:5500';

    // 2. Create Stripe Checkout Session
    const line_items = cartItems.map((item: any) => ({
      price_data: {
        currency: 'azn',
        product_data: {
          name: item.ad || item.name || 'Mebel Məhsulu',
        },
        unit_amount: Math.round((item.qiymet || item.price) * 100), // convert to qəpik/cents
      },
      quantity: item.say || item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: `${origin}/checkout/ugur?order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?legv_edildi=true`,
      metadata: {
        order_id: orderId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Session Error:', error);
    return NextResponse.json(
      { error: error.message || 'Ödəniş zamanı xəta baş verdi, yenidən cəhd edin' },
      { status: 500 }
    );
  }
}
