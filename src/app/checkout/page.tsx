'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, Check, CreditCard, Banknote, ArrowRight, ArrowLeft, CheckCircle2, Lock, AlertCircle } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  image_url: string;
}

import { useCart } from '@/context/CartContext';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartItems, clearCart } = useCart();

  const [step, setStep] = useState<1 | 2>(1);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>('stripe');

  // Step 1: Delivery Form
  const [fullName, setFullName] = useState('Anar Məmmədov');
  const [phone, setPhone] = useState('+994 50 123 45 67');
  const [email, setEmail] = useState('anar@example.com');
  const [city, setCity] = useState('Bakı');
  const [address, setAddress] = useState('Həsən Əliyev küç. ev 45, mənzil 12');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Check if canceled from Stripe Checkout hosted page
  useEffect(() => {
    if (searchParams.get('legv_edildi') === 'true') {
      setErrorMsg('Ödəniş Stripe səhifəsində ləğv edildi. Yenidən cəhd edə bilərsiniz.');
    }
  }, [searchParams]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal;

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email || !address) {
      setErrorMsg('Lütfən bütün tələb olunan sahələri doldurun.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  // Submit Payment (Stripe vs Cash)
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (paymentMethod === 'stripe') {
      // 1. STRIPE CHECKOUT HOSTED FLOW
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cartItems: cartItems.map((item) => ({
              product_id: item.id,
              ad: item.name,
              qiymet: item.price,
              say: item.quantity,
            })),
            catdirilma_unvani: `${city}, ${address}`,
            telefon: phone,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.url) {
          throw new Error(data.error || 'Stripe sessiyası yaradıla bilmədi.');
        }

        // Redirect to Stripe's hosted checkout page
        window.location.href = data.url;
      } catch (err: any) {
        console.error('Stripe Redirect Error:', err);
        setErrorMsg('Ödəniş zamanı xəta baş verdi, yenidən cəhd edin.');
        setLoading(false);
      }
    } else {
      // 2. NAĞD (KURYERƏ) FLOW - Direct Supabase Insert with status="yeni"
      try {
        const generatedOrderId = 'MD-' + Math.floor(100000 + Math.random() * 900000);
        await supabase.from('orders').insert([
          {
            id: generatedOrderId,
            umumi_meblegh: total,
            status: 'pending',
            catdirilma_unvani: `${city}, ${address}`,
            telefon: phone,
            odenis_usulu: 'Nağd (Kuryerə)',
          },
        ]);
        clearCart();
        router.push(`/checkout/ugur?order_id=${generatedOrderId}`);
      } catch (err) {
        clearCart();
        router.push(`/checkout/ugur?order_id=MD-${Math.floor(100000 + Math.random() * 900000)}`);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }}>
      {/* SIMPLIFIED HEADER */}
      <header style={{ backgroundColor: 'var(--white)', borderBottom: '1px solid var(--border-color)', padding: '16px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" className="logo">
            Mebel <span>Dünyası</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success-color)', fontSize: '0.9rem', fontWeight: '600' }}>
            <Lock size={18} />
            <span>Stripe 256-bit SSL Qorunması</span>
          </div>
        </div>
      </header>

      <main style={{ flexGrow: 1, padding: '40px 0 80px 0' }}>
        <div className="container">
          {errorMsg && (
            <div className="alert alert-error" style={{ maxWidth: '900px', margin: '0 auto 24px auto' }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="checkout-grid">
            {/* SOL SÜTUN (FORM) */}
            <div className="checkout-col-left">
              {step === 1 ? (
                <form onSubmit={handleNextToPayment} style={{ backgroundColor: 'var(--white)', padding: '32px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-diffuse)' }}>
                  <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-serif)', marginBottom: '24px' }}>
                    1. Çatdırılma Məlumatları
                  </h2>

                  <div className="form-group">
                    <label className="form-label">Ad və Soyad</label>
                    <input type="text" className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Telefon Nömrəsi</label>
                      <input type="tel" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Ünvanı</label>
                      <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Şəhər</label>
                    <select className="form-input" value={city} onChange={(e) => setCity(e.target.value)}>
                      <option value="Bakı">Bakı</option>
                      <option value="Sumqayıt">Sumqayıt</option>
                      <option value="Gəncə">Gəncə</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tam Ünvan</label>
                    <textarea className="form-input" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} required />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '12px' }}>
                    Növbəti Addım: Ödəniş <ArrowRight size={18} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePaymentSubmit} style={{ backgroundColor: 'var(--white)', padding: '32px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-diffuse)' }}>
                  <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-serif)', marginBottom: '24px' }}>
                    2. Ödəniş Üsulu Seçimi
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
                    {/* Stripe Card Option */}
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '18px',
                        border: paymentMethod === 'stripe' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: paymentMethod === 'stripe' ? 'var(--bg-secondary)' : 'var(--white)',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'stripe'}
                        onChange={() => setPaymentMethod('stripe')}
                        style={{ accentColor: 'var(--accent-primary)' }}
                      />
                      <CreditCard size={22} color="var(--accent-primary)" />
                      <div>
                        <strong style={{ display: 'block', fontSize: '1rem' }}>Kart ilə Ödə (Stripe Hosted Checkout)</strong>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Stripe-ın ən təhlükəsiz və rəsmi ödəniş səhifəsinə yönləndirilirsiniz.</span>
                      </div>
                    </label>

                    {/* Cash Option */}
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '18px',
                        border: paymentMethod === 'cash' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: paymentMethod === 'cash' ? 'var(--bg-secondary)' : 'var(--white)',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'cash'}
                        onChange={() => setPaymentMethod('cash')}
                        style={{ accentColor: 'var(--accent-primary)' }}
                      />
                      <Banknote size={22} color="var(--accent-primary)" />
                      <div>
                        <strong style={{ display: 'block', fontSize: '1rem' }}>Nağd (Kuryerə çatdırılmada)</strong>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ödəniş mebel unvanınıza çatdırıldıqda nağd edilir.</span>
                      </div>
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '14px' }}>
                    <button type="button" className="btn btn-outline" onClick={() => setStep(1)} style={{ padding: '14px 20px' }}>
                      <ArrowLeft size={16} /> Geri
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '14px' }} disabled={loading}>
                      {loading
                        ? 'Ödəniş səhifəsinə yönləndirilir...'
                        : paymentMethod === 'stripe'
                        ? 'Stripe ilə Ödənişə Keç'
                        : 'Sifarişi Təsdiqlə (Nağd)'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* SAĞ SÜTUN (ORDER SUMMARY) */}
            <div className="checkout-col-right">
              <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '24px 28px', boxShadow: 'var(--shadow-diffuse)', position: 'sticky', top: '90px' }}>
                <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  Sifariş Xülasəsi
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.variant}`} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <img src={item.image_url} alt={item.name} style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                      <div style={{ flexGrow: 1 }}>
                        <h4 style={{ fontSize: '0.9rem', fontFamily: 'var(--font-serif)', marginBottom: '2px' }}>{item.name}</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Say: {item.quantity}</span>
                      </div>
                      <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{item.price * item.quantity} ₼</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Çatdırılma:</span>
                    <span style={{ color: 'var(--success-color)', fontWeight: '600' }}>Pulsuz</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem', fontWeight: '700', borderTop: '1.5px solid var(--border-color)', paddingTop: '12px', marginTop: '6px' }}>
                    <span>Ümumi:</span>
                    <span style={{ color: 'var(--accent-gold)' }}>{total} ₼</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer style={{ backgroundColor: '#23160F', color: '#9C8E82', padding: '20px 0', textAlign: 'center', fontSize: '0.85rem' }}>
        <div className="container">
          <p>&copy; 2026 Mebel Dünyası. Stripe & Supabase Integrated Checkout.</p>
        </div>
      </footer>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center' }}>Yüklənir...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
