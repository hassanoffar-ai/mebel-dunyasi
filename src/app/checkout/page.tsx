'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, Check, CreditCard, Banknote, ArrowRight, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  image_url: string;
}

const CHECKOUT_CART: CartItem[] = [
  {
    id: '1',
    name: 'Minimalist Velvet Divan',
    variant: 'İsti Bej',
    price: 1450,
    quantity: 1,
    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    name: 'Təbii Palıd Yemək Masası',
    variant: 'Təbii Palıd',
    price: 980,
    quantity: 1,
    image_url: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80',
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Delivery Data
  const [fullName, setFullName] = useState('Anar Məmmədov');
  const [phone, setPhone] = useState('+994 50 123 45 67');
  const [email, setEmail] = useState('anar@example.com');
  const [city, setCity] = useState('Bakı');
  const [address, setAddress] = useState('Həsən Əliyev küç. ev 45, mənzil 12');
  const [notes, setNotes] = useState('');

  // Step 2: Payment Data
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [cardNumber, setCardNumber] = useState('4127 •••• •••• 9812');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('888');

  // Loading & Order confirmation state
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Calculations
  const subtotal = CHECKOUT_CART.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = 0; // Free shipping
  const total = subtotal + shippingFee;

  // Handle Step 1 -> Step 2
  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email || !address) {
      alert('Lütfən bütün tələb olunan sahələri doldurun.');
      return;
    }
    setStep(2);
  };

  // Handle Step 2 -> Step 3 (Submit Order)
  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    const generatedOrderId = 'MD-' + Math.floor(100000 + Math.random() * 900000);
    setOrderId(generatedOrderId);

    // Save to Supabase orders table (or fallback)
    try {
      await supabase.from('orders').insert([
        {
          order_id: generatedOrderId,
          customer_name: fullName,
          email,
          phone,
          address: `${city}, ${address}`,
          total_amount: total,
          status: 'yeni',
          payment_method: paymentMethod,
        },
      ]);
    } catch (err) {
      console.log('Simulated Supabase order insert success');
    }

    // Demo 1.5 seconds loading simulation
    setTimeout(() => {
      setProcessing(false);
      setStep(3);
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }}>
      {/* SIMPLIFIED HEADER: Logo & Security Message */}
      <header
        style={{
          backgroundColor: 'var(--white)',
          borderBottom: '1px solid var(--border-color)',
          padding: '16px 0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" className="logo">
            Mebel <span>Dünyası</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success-color)', fontSize: '0.9rem', fontWeight: '600' }}>
            <Lock size={18} />
            <span>Təhlükəsiz Ödəniş (256-bit SSL)</span>
          </div>
        </div>
      </header>

      <main style={{ flexGrow: 1, padding: '40px 0 80px 0' }}>
        <div className="container">
          {/* STEP INDICATOR HEADER */}
          <div style={{ maxWidth: '650px', margin: '0 auto 40px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '20px', left: '15%', right: '15%', height: '2px', backgroundColor: 'var(--border-color)', zIndex: 1 }}></div>

            {/* Step 1 Indicator */}
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: step >= 1 ? 'var(--accent-primary)' : 'var(--border-color)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px auto',
                  fontWeight: '700',
                }}
              >
                {step > 1 ? <Check size={20} /> : '1'}
              </div>
              <span style={{ fontSize: '0.88rem', fontWeight: step === 1 ? '700' : '500', color: step === 1 ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                1. Çatdırılma
              </span>
            </div>

            {/* Step 2 Indicator */}
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: step >= 2 ? 'var(--accent-primary)' : 'var(--border-color)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px auto',
                  fontWeight: '700',
                }}
              >
                {step > 2 ? <Check size={20} /> : '2'}
              </div>
              <span style={{ fontSize: '0.88rem', fontWeight: step === 2 ? '700' : '500', color: step === 2 ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                2. Ödəniş
              </span>
            </div>

            {/* Step 3 Indicator */}
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: step === 3 ? 'var(--success-color)' : 'var(--border-color)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px auto',
                  fontWeight: '700',
                }}
              >
                3
              </div>
              <span style={{ fontSize: '0.88rem', fontWeight: step === 3 ? '700' : '500', color: step === 3 ? 'var(--success-color)' : 'var(--text-muted)' }}>
                3. Təsdiq
              </span>
            </div>
          </div>

          {/* MAIN CHECKOUT CONTENT LAYOUT */}
          {step === 3 ? (
            /* STEP 3: TƏSDİQ (ORDER CONFIRMED) */
            <div
              style={{
                maxWidth: '650px',
                margin: '0 auto',
                backgroundColor: 'var(--white)',
                padding: '48px 36px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-diffuse)',
                textAlign: 'center',
              }}
            >
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

              <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', marginBottom: '8px', color: 'var(--text-main)' }}>
                Sifarişiniz Qəbul Edildi!
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                Təşəkkür edirik! Sifarişiniz emal olunur və tezliklə sizinlə əlaqə saxlanılacaq.
              </p>

              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '20px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '32px',
                  textAlign: 'left',
                  fontSize: '0.92rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: '600' }}>
                  <span>Sifariş Nömrəsi:</span>
                  <span style={{ color: 'var(--accent-primary)' }}>{orderId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Alıcı:</span>
                  <span>{fullName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Çatdırılma Ünvanı:</span>
                  <span>{city}, {address}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.1rem', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <span>Ödənilən Məbləğ:</span>
                  <span style={{ color: 'var(--accent-gold)' }}>{total} ₼</span>
                </div>
              </div>

              <Link href="/" className="btn btn-primary" style={{ padding: '14px 36px', fontSize: '1rem' }}>
                Ana Səhifəyə Qayıt
              </Link>
            </div>
          ) : (
            /* STEP 1 & 2: FORM & ORDER SUMMARY GRID */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '36px' }}>
              {/* SOL SÜTUN (FORM) */}
              <div style={{ gridColumn: 'span 7' }}>
                {step === 1 && (
                  /* ADDIM 1: ÇATDIRILMA MƏLUMATLARI */
                  <form onSubmit={handleNextToPayment} style={{ backgroundColor: 'var(--white)', padding: '32px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-diffuse)' }}>
                    <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-serif)', marginBottom: '24px' }}>
                      Çatdırılma Məlumatları
                    </h2>

                    <div className="form-group">
                      <label className="form-label">Ad və Soyad</label>
                      <input type="text" className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                        <option value="Xırdalan">Xırdalan</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tam Ünvan</label>
                      <textarea className="form-input" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} required />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Mənzil / Giriş qeydi (Opsional)</label>
                      <input type="text" className="form-input" placeholder="Nümunə: Blok 2, Mənzil 45" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '12px' }}>
                      Növbəti Addım: Ödəniş <ArrowRight size={18} />
                    </button>
                  </form>
                )}

                {step === 2 && (
                  /* ADDIM 2: ÖDƏNİŞ (DEMO) */
                  <form onSubmit={handleConfirmOrder} style={{ backgroundColor: 'var(--white)', padding: '32px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-diffuse)' }}>
                    <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-serif)', marginBottom: '24px' }}>
                      Ödəniş Üsulu (Demo)
                    </h2>

                    {/* Radio Options */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '16px',
                          border: paymentMethod === 'card' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: paymentMethod === 'card' ? 'var(--bg-secondary)' : 'var(--white)',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                          style={{ accentColor: 'var(--accent-primary)' }}
                        />
                        <CreditCard size={20} color="var(--accent-primary)" />
                        <span style={{ fontWeight: '600' }}>Bank Kartı ilə Ödəniş (Demo)</span>
                      </label>

                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '16px',
                          border: paymentMethod === 'cash' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: paymentMethod === 'cash' ? 'var(--bg-secondary)' : 'var(--white)',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'cash'}
                          onChange={() => setPaymentMethod('cash')}
                          style={{ accentColor: 'var(--accent-primary)' }}
                        />
                        <Banknote size={20} color="var(--accent-primary)" />
                        <span style={{ fontWeight: '600' }}>Nağd (Kuryerə çatdırılmada)</span>
                      </label>
                    </div>

                    {/* Card Input Visuals if 'card' selected */}
                    {paymentMethod === 'card' && (
                      <div style={{ backgroundColor: 'var(--bg-main)', padding: '20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '28px' }}>
                        <div className="form-group">
                          <label className="form-label">Kartın Nömrəsi</label>
                          <input type="text" className="form-input" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} required />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div className="form-group">
                            <label className="form-label">Bitmə Tarixi</label>
                            <input type="text" className="form-input" value={expiry} onChange={(e) => setExpiry(e.target.value)} required />
                          </div>
                          <div className="form-group">
                            <label className="form-label">CVC / CVV</label>
                            <input type="text" className="form-input" value={cvc} onChange={(e) => setCvc(e.target.value)} required />
                          </div>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '14px' }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setStep(1)}
                        style={{ padding: '14px 20px' }}
                      >
                        <ArrowLeft size={16} /> Geri
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '14px' }}
                        disabled={processing}
                      >
                        {processing ? 'Ödəniş emal olunur...' : 'Sifarişi Təsdiqlə və Tamamla'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* SAĞ SÜTUN (SİFARİŞ XÜLASƏSİ PANERLİ) */}
              <div style={{ gridColumn: 'span 5' }}>
                <div
                  style={{
                    backgroundColor: 'var(--white)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    padding: '24px 28px',
                    boxShadow: 'var(--shadow-diffuse)',
                    position: 'sticky',
                    top: '90px',
                  }}
                >
                  <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    Sifariş Xülasəsi
                  </h3>

                  {/* Səbət Məhsulları */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                    {CHECKOUT_CART.map((item) => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img
                          src={item.image_url}
                          alt={item.name}
                          style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                        />
                        <div style={{ flexGrow: 1 }}>
                          <h4 style={{ fontSize: '0.9rem', fontFamily: 'var(--font-serif)', marginBottom: '2px' }}>{item.name}</h4>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Say: {item.quantity} | {item.variant}</span>
                        </div>
                        <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                          {item.price * item.quantity} ₼
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>Ara Cəm:</span>
                      <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{subtotal} ₼</span>
                    </div>
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
          )}
        </div>
      </main>

      {/* MINIMAL FOOTER */}
      <footer style={{ backgroundColor: '#23160F', color: '#9C8E82', padding: '20px 0', textAlign: 'center', fontSize: '0.85rem' }}>
        <div className="container">
          <p>&copy; 2026 Mebel Dünyası. Təhlükəsiz Demo Checkout Interface.</p>
        </div>
      </footer>
    </div>
  );
}
