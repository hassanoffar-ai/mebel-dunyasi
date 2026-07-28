'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header, Footer } from '@/components/Navigation';
import { ProductCard } from '@/components/ProductCard';
import { MOCK_PRODUCTS, CATEGORIES, REVIEWS, Product } from '@/lib/mockData';
import { supabase } from '@/lib/supabase';
import { Truck, ShieldCheck, Headphones, RotateCcw, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80',
    title: 'Evinizə Zəriflik Gətirin',
    subtitle: 'Minimalist və müasir mebel kolleksiyalarımızla yaşam sahələrinizi yeniləyin.',
  },
  {
    image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1600&q=80',
    title: 'İsti və Təbii Ağac Materialları',
    subtitle: 'Mətbəx və yemək otağınız üçün xüsusi işlənmiş premium palıd masalar.',
  },
  {
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
    title: 'Mükəmməl Yataq Otağı Rahatlığı',
    subtitle: 'Ketan və yumşaq tekstil örtüklü rahat çarpayı dəstləri.',
  },
];

export default function HomePage() {
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto Slider for Hero
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Supabase Fetch (Fallback to Mock if table is empty or error)
  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (data && data.length > 0 && !error) {
          setProducts(data as Product[]);
        }
      } catch (err) {
        console.log('Supabase fetch fallback to mock data');
      }
    }
    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    setCartCount((prev) => prev + 1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <Header cartCount={cartCount} />

      <main style={{ flexGrow: 1 }}>
        {/* 1. HERO BÖLMƏSİ (Slayder) */}
        <section style={{ position: 'relative', height: '540px', overflow: 'hidden', backgroundColor: '#23160F' }}>
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: index === currentSlide ? 1 : 0,
                transition: 'opacity 800ms ease-in-out',
              }}
            >
              <img 
                src={slide.image} 
                alt={slide.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80'; }}
              />
              {/* Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(43,29,20,0.4) 0%, rgba(43,29,20,0.75) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '0 20px',
                }}
              >
                <div style={{ maxWidth: '750px', color: 'var(--white)' }}>
                  <h1
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
                      color: 'var(--white)',
                      marginBottom: '16px',
                      lineHeight: 1.15,
                    }}
                  >
                    {slide.title}
                  </h1>
                  <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#E5D9C7', marginBottom: '32px' }}>
                    {slide.subtitle}
                  </p>
                  <Link href="#products" className="btn btn-gold" style={{ padding: '14px 36px', fontSize: '1rem' }}>
                    Kolleksiyaya Bax
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Slide Controls */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))}
            style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
            style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronRight size={24} />
          </button>
        </section>

        {/* 2. KATEQORİYALAR BÖLMƏSİ (Üfüqi Scroll) */}
        <section id="categories" style={{ padding: '70px 0', backgroundColor: 'var(--bg-main)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>Kateqoriyalara Görə Axtar</h2>
              <p style={{ color: 'var(--text-muted)' }}>Eviniz üçün ehtiyac duyduğunuz hər bir mebel kateqoriyası</p>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '20px',
                overflowX: 'auto',
                paddingBottom: '16px',
                scrollbarWidth: 'thin',
              }}
            >
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    minWidth: '240px',
                    flex: '0 0 auto',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                  className="category-hover-card"
                >
                  <div style={{ height: '180px', overflow: 'hidden' }}>
                    <img 
                      src={cat.image} 
                      alt={cat.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'; }}
                    />
                  </div>
                  <div style={{ padding: '16px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-serif)' }}>{cat.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. SEÇİLMİŞ MƏHSULLAR BÖLMƏSİ */}
        <section id="products" style={{ padding: '50px 0 80px 0', backgroundColor: 'var(--bg-main)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '40px' }}>
              <div>
                <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', marginBottom: '8px' }}>Önə Çıxan Məhsullar</h2>
                <p style={{ color: 'var(--text-muted)' }}>Ən çox üstünlük verilən eksklüziv kolleksiya</p>
              </div>
              <Link href="#" className="btn btn-outline">Bütün Məhsullar</Link>
            </div>

            <div className="grid-responsive-products">
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} onAddToCart={handleAddToCart} />
              ))}
            </div>
          </div>
        </section>

        {/* 4. ÜSTÜNLÜKLƏR BÖLMƏSİ */}
        <section style={{ padding: '60px 0', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px', textAlign: 'center' }}>
              <div style={{ padding: '20px' }}>
                <Truck size={36} color="var(--accent-primary)" style={{ marginBottom: '14px' }} />
                <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Pulsuz Çatdırılma</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Şəhərdaxili bütün sifarişlərə pulsuz çatdırılma</p>
              </div>
              <div style={{ padding: '20px' }}>
                <ShieldCheck size={36} color="var(--accent-primary)" style={{ marginBottom: '14px' }} />
                <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Keyfiyyət Zəmanəti</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Bütün mebel məhsullarına 2 il rəsmi zəmanət</p>
              </div>
              <div style={{ padding: '20px' }}>
                <RotateCcw size={36} color="var(--accent-primary)" style={{ marginBottom: '14px' }} />
                <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Rahat Qaytarma</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>14 gün ərzində şərtsiz qaytarılma imkanı</p>
              </div>
              <div style={{ padding: '20px' }}>
                <Headphones size={36} color="var(--accent-primary)" style={{ marginBottom: '14px' }} />
                <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>24/7 Dəstək</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Operativ müştəri xidmətləri və canlı dəstək</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. MÜŞTƏRİ RƏYLƏRİ BÖLMƏSİ */}
        <section style={{ padding: '80px 0', backgroundColor: 'var(--bg-main)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>Müştərilərimizin Rəyləri</h2>
              <p style={{ color: 'var(--text-muted)' }}>Mebel Dünyasını seçən müştərilərimizin fikirləri</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {REVIEWS.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    backgroundColor: 'var(--white)',
                    padding: '28px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-diffuse)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '4px', color: '#C9A15D', marginBottom: '14px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="#C9A15D" />
                    ))}
                  </div>
                  <p style={{ fontStyle: 'italic', fontSize: '0.95rem', marginBottom: '20px', color: 'var(--text-main)' }}>
                    "{rev.comment}"
                  </p>
                  <h4 style={{ fontSize: '1rem', fontFamily: 'var(--font-sans)', fontWeight: '600', color: 'var(--accent-primary)' }}>
                    {rev.name}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. CTA BÖLMƏSİ */}
        <section style={{ padding: '90px 20px', backgroundColor: '#23160F', color: 'var(--white)', textAlign: 'center' }}>
          <div style={{ maxWidth: '650px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.6rem', color: 'var(--white)', marginBottom: '16px' }}>Evinizi Yerinə Görə Yeniləyin</h2>
            <p style={{ color: '#D4C9BF', fontSize: '1.1rem', marginBottom: '32px' }}>
              Yeni mövsüm kolleksiyalarımızla tanış olun və daxili interyerinizə uyğun mebelləri kəşf edin.
            </p>
            <Link href="#products" className="btn btn-gold" style={{ padding: '16px 40px', fontSize: '1.05rem' }}>
              Bütün Məhsullara Bax
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
