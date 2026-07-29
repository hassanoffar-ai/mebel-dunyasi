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

export const MOCK_CATEGORIES: CategoryItem[] = [
  {
    id: '1',
    title: 'Qonaq Otağı',
    description: 'Minimalist və rahat divanlar, kreslolar, TV stendləri və jurnal masaları.',
    count: 42,
    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    title: 'Yataq Otağı',
    description: 'Yumşaq başlıqlı çarpayılar, geniş qarderoblar və komodlar.',
    count: 28,
    image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    title: 'Mətbəx & Yemək',
    description: 'Təbii palıd masalar, stullar və dəbli mətbəx adaları.',
    count: 35,
    image_url: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '4',
    title: 'İş və Ofis',
    description: 'Erqonomik masa və oturacaqlar, arxiv şkafları.',
    count: 19,
    image_url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '5',
    title: 'Uşaq Otağı',
    description: 'Təhlükəsiz, rəngarəng və funksional uşaq mebelləri.',
    count: 15,
    image_url: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '6',
    title: 'Masa və Stullar',
    description: 'Şık yemək masaları, çalışma masaları, rahat stul və oturacaqlar.',
    count: 27,
    image_url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '7',
    title: 'Bağ və Terass',
    description: 'Hava şəraitinə dözümlü rattan və taxta bağ dəstləri.',
    count: 22,
    image_url: 'https://images.unsplash.com/photo-1519974719765-e6559eac2575?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '8',
    title: 'İşıqlandırma & Dekora',
    description: 'Estetik çıraqlar, torşerlər və ev aksesuarları.',
    count: 54,
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '9',
    title: 'Aksesuarlar & Kreslolar',
    description: 'İstirahət üçün fərdi kreslolar və puflar.',
    count: 16,
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
  },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>(MOCK_CATEGORIES);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase.from('categories').select('*');
        if (data && data.length > 0 && !error) {
          setCategories(data as CategoryItem[]);
        }
      } catch (err) {
        console.log('Fallback to mock categories list');
      }
    }
    fetchCategories();
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
