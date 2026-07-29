'use client';

import React from 'react';
import Link from 'next/link';
import { Header, Footer } from '@/components/Navigation';
import { ProductCard } from '@/components/ProductCard';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Header />

      <main style={{ flexGrow: 1, padding: '50px 0 90px 0' }}>
        <div className="container">
          {/* Səhifə Başlığı */}
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-serif)', color: 'var(--text-main)', marginBottom: '8px' }}>
              Sevimlilərim ({wishlist.length} məhsul)
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Bəyəndiyiniz və sonradan baxmaq üçün saxladığınız xüsusi mebellər
            </p>
          </div>

          {wishlist.length === 0 ? (
            /* BOŞ SEVİMLİLƏR VƏZİYYƏTİ */
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
                  color: 'var(--error-color)',
                }}
              >
                <Heart size={40} fill="var(--error-color)" />
              </div>
              <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', marginBottom: '12px' }}>
                Sevimlilər siyahınız boşdur
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>
                Bəyəndiyiniz mebel məhsullarını kart üzərindəki ürək ikonuna basaraq bura əlavə edə bilərsiniz.
              </p>
              <Link href="/mehsullar" className="btn btn-primary" style={{ padding: '14px 32px' }}>
                Məhsullara Bax
              </Link>
            </div>
          ) : (
            /* SEVİMLİLƏR GRID (3 cols Desktop, 2 cols Tablet/Mobile) */
            <div className="grid-responsive-products">
              {wishlist.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onAddToCart={(p) => addToCart(p)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
