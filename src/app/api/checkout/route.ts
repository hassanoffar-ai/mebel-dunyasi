import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { toDbStatus } from '@/lib/statusHelper';

export const dynamic = 'force-dynamic';
export const preferredRegion = 'fra1';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cartItems, user_id, catdirilma_unvani, telefon, customer, email } = body;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Səbət boşdur' }, { status: 400 });
    }

    // Calculate total amount in AZN
    const umumi_meblegh = cartItems.reduce(
      (acc: number, item: any) => acc + Number(item.price || item.qiymet || 0) * Number(item.quantity || item.say || 1),
      0
    );

    // 1. Save order in Supabase using supabaseAdmin (bypasses RLS)
    let order: any = null;
    let orderError: any = null;
    
    const baseOrderPayload = {
      user_id: user_id || null,
      umumi_meblegh,
      status: toDbStatus('pending'),
      telefon: telefon || '+994 50 000 00 00',
      odenis_usulu: 'Stripe Card',
    };

    try {
      const firstAttempt = await supabaseAdmin
        .from('orders')
        .insert([
          {
            ...baseOrderPayload,
            customer: customer || 'Müştəri',
            email: email || '',
            catdirilma_unvani: catdirilma_unvani || 'Baku, Azerbaijan',
          },
        ])
        .select()
        .single();
      
      order = firstAttempt.data;
      orderError = firstAttempt.error;

      // Fallback: If database schema doesn't have customer/email columns, format them into catdirilma_unvani
      if (orderError && (orderError.message?.includes("column") || orderError.code === 'PGRST204' || orderError.code === '42703')) {
        const formattedAddress = `Müştəri: ${customer || 'Müştəri'} (${email || 'E-poçtsuz'}), Ünvan: ${catdirilma_unvani || 'Baku, Azerbaijan'}`;
        const secondAttempt = await supabaseAdmin
          .from('orders')
          .insert([
            {
              ...baseOrderPayload,
              catdirilma_unvani: formattedAddress.slice(0, 500),
            },
          ])
          .select()
          .single();
        
        order = secondAttempt.data;
        orderError = secondAttempt.error;
      }
    } catch (err: any) {
      orderError = err;
    }

    if (orderError || !order) throw orderError || new Error('Sifariş yaradıla bilmədi.');

    let orderId = order?.id;

    // Fallback order ID if Supabase table missing/error
    if (!orderId) {
      orderId = 'MD-' + Math.floor(100000 + Math.random() * 900000);
    } else {
      // Insert order items
      const orderItems = cartItems.map((item: any) => ({
        order_id: orderId,
        product_id: item.product_id || item.id,
        say: item.say || item.quantity || 1,
        vahid_qiymet: item.qiymet || item.price,
      }));
      const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;
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
