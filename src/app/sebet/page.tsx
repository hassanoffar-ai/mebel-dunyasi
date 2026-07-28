'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header, Footer } from '@/components/Navigation';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Check, Tag } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  category: string;
  variant: string;
  price: number;
  quantity: number;
  image_url: string;
}

const INITIAL_CART: CartItem[] = [
  {
    id: '1',
    name: 'Minimalist Velvet Divan',
    category: 'Qonaq Otağı',
    variant: 'İsti Bej',
    price: 1450,
    quantity: 1,
    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    name: 'Təbii Palıd Yemək Masası',
    category: 'Mətbəx',
    variant: 'Təbii Palıd',
    price: 980,
    quantity: 1,
    image_url: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '4',
    name: 'Qəhvəyi Dəri Aksent Kreslo',
    category: 'Qonaq Otağı',
    variant: 'Tünd Qəhvəyi',
    price: 750,
    quantity: 2,
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
  },
];

import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Cart Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = discountApplied ? Math.round(subtotal * 0.1) : 0; // 10% discount
  const shippingFee = subtotal > 1500 || subtotal === 0 ? 0 : 30;
  const totalPrice = subtotal - discountAmount + shippingFee;

  const removeItem = (id: string, variant: string) => {
    removeFromCart(id, variant);
    setConfirmDeleteId(null);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'MEBEL10') {
      setDiscountApplied(true);
    } else {
      alert('Yanlış promosyon kodu. Nümunə kod: MEBEL10');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Header cartCount={cartItems.length} />

      <main style={{ flexGrow: 1, padding: '50px 0 90px 0' }}>
        <div className="container">
          {/* Header Title */}
          <h1 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-serif)', marginBottom: '32px', color: 'var(--text-main)' }}>
            Səbətim ({cartItems.length} məhsul)
          </h1>

          {cartItems.length === 0 ? (
            /* BOŞ SƏBƏT GÖRÜNÜŞÜ */
            <div
              style={{
                textAlign: 'center',
                padding: '80px 20px',
                backgroundColor: 'var(--white)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-diffuse)',
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px auto',
                  color: 'var(--accent-primary)',
                }}
              >
                <ShoppingBag size={40} />
              </div>
              <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', marginBottom: '12px' }}>
                Səbətiniz boşdur
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>
                Hələ ki səbətinizə heç bir mebel əlavə etməmisiniz. Kataloqumuza nəzər salaraq bəyəndiyiniz məhsulları seçə bilərsiniz.
              </p>
              <Link href="/#products" className="btn btn-primary" style={{ padding: '14px 32px' }}>
                Alış-verişə Başla
              </Link>
            </div>
          ) : (
            /* SƏBƏT DOLU: 2 SÜTUNLU LAYOUT */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '32px' }}>
              {/* SOL SÜTUN (70%): Məhsullar Siyahısı */}
              <div style={{ gridColumn: 'span 8', backgroundColor: 'var(--white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '24px 28px', boxShadow: 'var(--shadow-diffuse)' }}>
                {cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px',
                      padding: '20px 0',
                      borderBottom: index !== cartItems.length - 1 ? '1px solid var(--border-color)' : 'none',
                    }}
                  >
                    {/* Kiçik Şəkil */}
                    <div
                      style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        backgroundColor: 'var(--bg-secondary)',
                        flexShrink: 0,
                      }}
                    >
                      <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    {/* Məhsul Adı & Variant */}
                    <div style={{ flexGrow: 1 }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{item.category}</span>
                      <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-serif)', color: 'var(--text-main)', marginBottom: '4px' }}>
                        {item.name}
                      </h3>
                      <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: '500' }}>
                        Variant: {item.variant}
                      </span>
                    </div>

                    {/* Vahid Qiymət */}
                    <div style={{ width: '100px', textAlign: 'right', fontWeight: '600' }}>
                      {item.price} ₼
                    </div>

                    {/* Say Seçici */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-main)',
                      }}
                    >
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                        style={{ padding: '6px 10px', border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ width: '32px', textAlign: 'center', fontWeight: '600', fontSize: '0.9rem' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                        style={{ padding: '6px 10px', border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Sətir Cəmi */}
                    <div style={{ width: '110px', textAlign: 'right', fontWeight: '700', fontSize: '1.1rem', color: 'var(--accent-gold)' }}>
                      {item.price * item.quantity} ₼
                    </div>

                    {/* Silmə Düyməsi & Tooltip Confirm */}
                    <div style={{ position: 'relative' }}>
                      {confirmDeleteId === `${item.id}-${item.variant}` ? (
                        <div
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: '-36px',
                            backgroundColor: 'var(--text-main)',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center',
                            whiteSpace: 'nowrap',
                            zIndex: 10,
                          }}
                        >
                          <span>Silinsin?</span>
                          <button onClick={() => removeItem(item.id, item.variant)} style={{ color: '#FF6B6B', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer' }}>Bəli</button>
                          <button onClick={() => setConfirmDeleteId(null)} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>Xeyr</button>
                        </div>
                      ) : null}

                      <button
                        onClick={() => setConfirmDeleteId(`${item.id}-${item.variant}`)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
                        title="Səbətdən Sil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* SAĞ SÜTUN (30%): Sifariş Xülasəsi (Sticky) */}
              <div style={{ gridColumn: 'span 4' }}>
                <div
                  style={{
                    backgroundColor: 'var(--white)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    padding: '28px',
                    boxShadow: 'var(--shadow-diffuse)',
                    position: 'sticky',
                    top: '100px',
                  }}
                >
                  <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    Sifariş Xülasəsi
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.95rem', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>Ara Cəm:</span>
                      <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{subtotal} ₼</span>
                    </div>

                    {discountApplied && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success-color)' }}>
                        <span>Promosyon Endirimi (10%):</span>
                        <span style={{ fontWeight: '600' }}>-{discountAmount} ₼</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>Çatdırılma:</span>
                      <span style={{ color: shippingFee === 0 ? 'var(--success-color)' : 'var(--text-main)', fontWeight: '600' }}>
                        {shippingFee === 0 ? 'Pulsuz' : `${shippingFee} ₼`}
                      </span>
                    </div>
                  </div>

                  {/* Endirim Kodu Input */}
                  <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    <div style={{ position: 'relative', flexGrow: 1 }}>
                      <input
                        type="text"
                        placeholder="Promosyon kodu"
                        className="form-input"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        style={{ paddingLeft: '34px', fontSize: '0.85rem' }}
                      />
                      <Tag size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    </div>
                    <button type="submit" className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                      Tətbiq Et
                    </button>
                  </form>

                  <div style={{ borderTop: '1.5px solid var(--border-color)', paddingTop: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Ümumi Məbləğ:</span>
                    <span style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--accent-gold)' }}>
                      {totalPrice} ₼
                    </span>
                  </div>

                  <Link href="/checkout" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    Sifarişi Tamamla <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
