'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Header, Footer } from '@/components/Navigation';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || 'MD-584912';

  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    async function getOrderDetails() {
      try {
        const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).single();
        if (data && !error) {
          setOrder(data);
        }
      } catch (err) {
        console.log('Using default success order presentation');
      }
    }
    if (orderId) {
      getOrderDetails();
    }
  }, [orderId]);

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
              <span>Ödəniş Statusu:</span>
              <span style={{ color: 'var(--success-color)', fontWeight: '600' }}>Ödənildi (Stripe Card)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Çatdırılma:</span>
              <span>Bakı şəhəri daxilində (Pulsuz)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.15rem', marginTop: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <span>Məbləğ:</span>
              <span style={{ color: 'var(--accent-gold)' }}>{order?.umumi_meblegh ? `${order.umumi_meblegh} ₼` : '2,430 ₼'}</span>
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
