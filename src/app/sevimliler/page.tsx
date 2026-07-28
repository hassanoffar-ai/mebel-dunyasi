'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header, Footer } from '@/components/Navigation';
import { ProductCard } from '@/components/ProductCard';
import { MOCK_PRODUCTS, Product } from '@/lib/mockData';
import { supabase } from '@/lib/supabase';
import { Heart, ShoppingBag } from 'lucide-react';

export default function WishlistPage() {
  const router = useRouter();
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Auth Check & Supabase Fetch
  useEffect(() => {
    async function checkAuthAndFetch() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase.from('favorites').select('products(*)');
          if (data && !error) {
            const prods = data.map((item: any) => item.products).filter(Boolean);
            setFavoriteProducts(prods);
          }
        }
      } catch (err) {
        console.log('Error fetching favorites');
      } finally {
        setLoading(false);
      }
    }
    checkAuthAndFetch();
  }, [router]);

  const handleRemoveFavorite = (productId: string) => {
    // Soft fade-out removal from list
    setFavoriteProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleAddToCart = (product: Product) => {
    setCartCount((prev) => prev + 1);
  };

  if (loading) {
    return <div style={{ padding: '80px', textAlign: 'center' }}>Yüklənir...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Header cartCount={cartCount} />

      <main style={{ flexGrow: 1, padding: '50px 0 90px 0' }}>
        <div className="container">
          {/* Səhifə Başlığı */}
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-serif)', color: 'var(--text-main)', marginBottom: '8px' }}>
              Sevimlilərim ({favoriteProducts.length} məhsul)
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Bəyəndiyiniz və sonradan baxmaq üçün saxladığınız xüsusi mebellər
            </p>
          </div>

          {favoriteProducts.length === 0 ? (
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
              <Link href="/#products" className="btn btn-primary" style={{ padding: '14px 32px' }}>
                Məhsullara Bax
              </Link>
            </div>
          ) : (
            /* SEVİMLİLƏR GRID (3 cols Desktop, 2 cols Tablet/Mobile) */
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px',
              }}
            >
              {favoriteProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleRemoveFavorite}
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
