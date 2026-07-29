'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header, Footer } from '@/components/Navigation';
import { supabase } from '@/lib/supabase';

export interface CategoryItem {
  id: string;
  title: string;
  description: string;
  count: number;
  image_url: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    async function fetchCategoriesWithCounts() {
      try {
        const [{ data: dbCategories, error: catError }, { data: dbProducts, error: prodError }] = await Promise.all([
          supabase.from('categories').select('*').order('sira', { ascending: true }),
          supabase.from('products').select('*'),
        ]);

        if (dbCategories && !catError) {
          const activeProducts = dbProducts ? dbProducts.filter((p: any) => p.status === 'aktiv' || !p.status) : [];

          const mapped: CategoryItem[] = dbCategories.map((c: any) => {
            const catTitle = c.ad || c.name || c.title || 'Kateqoriya';

            // Match products by categories.id == products.kateqoriya_id or title matching
            const count = activeProducts.filter((p: any) => {
              if (p.kateqoriya_id && c.id) {
                return p.kateqoriya_id === c.id;
              }
              const pCat = p.xususiyyetler?.category || p.category || p.kateqoriya;
              return pCat && pCat.toLowerCase() === catTitle.toLowerCase();
            }).length;

            return {
              id: c.id,
              title: catTitle,
              description: c.description || c.qisa_teswir || 'Evinizin bu hissəsi üçün eksklüziv mebel dəstləri.',
              count: count,
              image_url: c.sekil_url || c.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
            };
          });

          setCategories(mapped);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.log('Error fetching categories:', err);
        setCategories([]);
      }
    }
    fetchCategoriesWithCounts();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Header cartCount={cartCount} />

      <main style={{ flexGrow: 1, padding: '50px 0 90px 0' }}>
        <div className="container">
          {/* Header Title */}
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 50px auto' }}>
            <h1 style={{ fontSize: '2.8rem', fontFamily: 'var(--font-serif)', marginBottom: '12px', color: 'var(--text-main)' }}>
              Kateqoriyalar
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
              Evinizin hər sahəsi üçün zövqlə hazırlanmış mebel və dekor kolleksiyalarımızla tanış olun.
            </p>
          </div>

          {/* Grid: 3 cols Desktop, 2 cols Tablet, 1 col Mobile */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '28px',
            }}
          >
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/mehsullar?kateqoriya=${encodeURIComponent(cat.title)}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    position: 'relative',
                    aspectRatio: '4 / 3',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-diffuse)',
                    transition: 'all 300ms ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
                    const overlay = e.currentTarget.querySelector('.cat-overlay') as HTMLElement;
                    if (overlay) overlay.style.background = 'linear-gradient(180deg, rgba(43,29,20,0.3) 0%, rgba(43,29,20,0.75) 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-diffuse)';
                    const overlay = e.currentTarget.querySelector('.cat-overlay') as HTMLElement;
                    if (overlay) overlay.style.background = 'linear-gradient(180deg, rgba(43,29,20,0.2) 0%, rgba(43,29,20,0.55) 100%)';
                  }}
                >
                  {/* Background Image */}
                  <img
                    src={cat.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'}
                    alt={cat.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'; }}
                  />

                  {/* Dark Transparent Overlay */}
                  <div
                    className="cat-overlay"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(43,29,20,0.2) 0%, rgba(43,29,20,0.55) 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '24px',
                      transition: 'var(--transition)',
                    }}
                  >
                    <h2
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.6rem',
                        color: 'var(--white)',
                        marginBottom: '4px',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      }}
                    >
                      {cat.title}
                    </h2>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: '600', fontSize: '0.9rem' }}>
                      {cat.count} məhsul
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
