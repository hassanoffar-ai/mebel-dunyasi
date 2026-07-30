'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Header, Footer } from '@/components/Navigation';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';

import { useCart } from '@/context/CartContext';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || 'MD-584912';
  const sessionId = searchParams.get('session_id') || '';

  const { clearCart } = useCart();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    async function confirmAndFetchOrder() {
      if (clearCart) {
        clearCart();
      }
      try {
        if (orderId) {
          // Confirm order status to confirmed via API
          const response = await fetch('/api/checkout/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, sessionId }),
          });

          const result = await response.json();
          if (response.ok && result.order) {
            setOrder(result.order);
          } else {
            setOrder({ id: orderId, status: 'confirmed', catdirilma_unvani: 'Bakı şəhəri daxilində (Pulsuz)' });
          }
        }
      } catch (err) {
        console.log('Order status update error:', err);
      }
    }
    confirmAndFetchOrder();
  }, [orderId, sessionId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Header cartCount={0} />

      <main style={{ flexGrow: 1, padding: '60px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            maxWidth: '620px',
            width: '100%',
            backgroundColor: 'var(--white)',
            padding: '48px 36px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-diffuse)',
            textAlign: 'center',
          }}
        >
          {/* Böyük Yaşıl Check İkonu */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'var(--success-bg)',
              color: 'var(--success-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto',
            }}
          >
            <CheckCircle2 size={48} />
          </div>

          <h1 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-serif)', marginBottom: '8px', color: 'var(--text-main)' }}>
            Sifarişiniz Qəbul Edildi!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '28px' }}>
            Ödənişiniz Stripe vasitəsilə uğurla təsdiqləndi. Tezliklə kuryerimiz sizinlə əlaqə saxlayacaqdır.
          </p>

          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              padding: '24px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '32px',
              textAlign: 'left',
              fontSize: '0.95rem',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: '600' }}>
              <span>Sifariş Nömrəsi:</span>
              <span style={{ color: 'var(--accent-primary)' }}>{orderId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Sifariş Statusu:</span>
              <span style={{ color: 'var(--success-color)', fontWeight: '600', textTransform: 'capitalize' }}>
                {order?.status === 'confirmed' ? 'Təsdiqləndi (Confirmed)' : order?.status || 'Təsdiqləndi (Confirmed)'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Çatdırılma:</span>
              <span>{order?.catdirilma_unvani || 'Bakı şəhəri daxilində (Pulsuz)'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.15rem', marginTop: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <span>Məbləğ:</span>
              <span style={{ color: 'var(--accent-gold)' }}>{order?.umumi_meblegh ? `${order.umumi_meblegh} ₼` : '---'}</span>
            </div>
          </div>

          <Link href="/" className="btn btn-primary" style={{ padding: '14px 36px', fontSize: '1rem' }}>
            Ana Səhifəyə Qayıt
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function StripeSuccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center' }}>Yüklənir...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
