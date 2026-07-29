'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header, Footer } from '@/components/Navigation';
import { ProductCard } from '@/components/ProductCard';
import { MOCK_PRODUCTS, CATEGORIES, Product } from '@/lib/mockData';
import { supabase } from '@/lib/supabase';
import { Truck, ShieldCheck, Headphones, RotateCcw, Star, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  avatar_url?: string;
  comment: string;
  rating: number;
  is_active: boolean;
}

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

import { useCart } from '@/context/CartContext';

export default function HomePage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto Slider for Hero
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Supabase Fetch for Products and Active Testimonials
  useEffect(() => {
    async function fetchData() {
      try {
        let combined: Product[] = [];
        const { data: dbProducts } = await supabase.from('products').select('*').order('created_at', { ascending: false });

        if (dbProducts && dbProducts.length > 0) {
          const { data: dbImages } = await supabase.from('product_images').select('*').order('sira', { ascending: true });

          combined = dbProducts.map((p: any) => {
            const pImgs = dbImages ? dbImages.filter((img: any) => img.product_id === p.id) : [];
            const mainImg =
              pImgs.find((img: any) => img.esas_sekil)?.sekil_url ||
              pImgs[0]?.sekil_url ||
              p.xususiyyetler?.image_url ||
              p.image_url ||
              p.sekil_url ||
              'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=60';

            const allImgs =
              pImgs.length > 0
                ? pImgs.map((img: any) => img.sekil_url)
                : p.xususiyyetler?.images || p.images || [mainImg];

            return {
              id: p.id,
              sku: p.xususiyyetler?.sku || p.sku || `MBL-${p.id.toString().slice(0, 5)}`,
              name: p.ad || p.name || 'Məhsul',
              category: p.xususiyyetler?.category || p.category || p.kateqoriya || 'Qonaq Otağı',
              price: Number(p.qiymet || p.price || 0),
              old_price: p.endirimli_qiymet || p.old_price ? Number(p.endirimli_qiymet || p.old_price) : undefined,
              stock: Number(p.stok || p.stock || 0),
              material: p.xususiyyetler?.material || p.material || 'Təbii Palıd',
              dimensions: p.xususiyyetler?.dimensions || p.dimensions || '',
              color: p.xususiyyetler?.color || p.color || '',
              description: p.etrafli_teswir || p.qisa_teswir || p.description || '',
              image_url: mainImg,
              images: allImgs,
              rating: p.rating || 5.0,
              reviews_count: p.reviews_count || 0,
            };
          });
        }

        // Check local_added_products backup
        try {
          const stored = localStorage.getItem('local_added_products');
          if (stored) {
            const localList: Product[] = JSON.parse(stored);
            const localOnly = localList.filter((lp) => !combined.some((dbP) => dbP.id === lp.id));
            combined = [...localOnly, ...combined];
          }
        } catch (e) {}

        setProducts(combined);
      } catch (err) {}

      try {
        const { data: testData } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (testData) {
          setTestimonials(testData as Testimonial[]);
        }
      } catch (err) {
        console.log('Failed to fetch active testimonials');
      }
    }
    fetchData();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <Header />

      <main style={{ flexGrow: 1 }}>
        {/* 1. HERO BÖLMƏSİ (Slayder) */}
        <section style={{ position: 'relative', height: 'clamp(480px, 95vh, 680px)', overflow: 'hidden', backgroundColor: '#23160F' }}>
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
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} 
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
                  <Link href="/kateqoriyalar" className="btn btn-gold" style={{ padding: '14px 36px', fontSize: '1rem' }}>
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

        {/* 5. MÜŞTƏRİ RƏYLƏRİ BÖLMƏSİ (Testimonials) */}
        {testimonials.length > 0 && (
          <section style={{ padding: '80px 0', backgroundColor: 'var(--bg-main)' }}>
            <div className="container">
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <h2 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>Müştərilərimizin Rəyləri</h2>
                <p style={{ color: 'var(--text-muted)' }}>Mebel Dünyasını seçən müştərilərimizin fikirləri</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {testimonials.map((rev) => (
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
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} size={16} fill="#C9A15D" />
                      ))}
                    </div>
                    <p style={{ fontStyle: 'italic', fontSize: '0.95rem', marginBottom: '20px', color: 'var(--text-main)' }}>
                      "{rev.comment}"
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {rev.avatar_url && (
                        <img src={rev.avatar_url} alt={rev.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      )}
                      <div>
                        <h4 style={{ fontSize: '1rem', fontFamily: 'var(--font-sans)', fontWeight: '600', color: 'var(--accent-primary)' }}>
                          {rev.name}
                        </h4>
                        {rev.role && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rev.role}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

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
