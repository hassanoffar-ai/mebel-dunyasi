'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header, Footer } from '@/components/Navigation';
import { ProductCard } from '@/components/ProductCard';
import { MOCK_PRODUCTS, CATEGORIES, Product } from '@/lib/mockData';
import { supabase } from '@/lib/supabase';
import { Truck, ShieldCheck, Headphones, RotateCcw, Star, ChevronLeft, ChevronRight, ChevronDown, HelpCircle } from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: 'Çatdırılma və quraşdırılma pulsuzdurmu?',
    a: 'Bəli, Bakı və Sumqayıt şəhərləri daxilində bütün mebel sifarişlərinə çatdırılma və peşəkar ustalarımız tərəfindən quraşdırılma xidməti tamamilə pulsuzdur.',
  },
  {
    q: 'Məhsullara nə qədər rəsmi zəmanət verilir?',
    a: 'Bütün mebel kolleksiyalarımıza 2 il rəsmi fabriki zəmanəti təqdim olunur. Zəmanət müddəti ərzində yarana biləcək hər hansı istehsalat qüsuru ödənişsiz aradan qaldırılır.',
  },
  {
    q: 'Ödəniş üsulları hansılardır? Hissə-hissə ödəniş var?',
    a: 'Siz ödənişi nağd, kuryerə terminal ilə və ya sayt üzərindən kartla həyata keçirə bilərsiniz. Həmçinin Birkart və Tamkart vasitəsilə faizsiz hissə-hissə ödəniş imkanı mövcuddur.',
  },
  {
    q: 'Xüsusi ölçü və fərdi dizaynla mebel sifarişi mümkündür?',
    a: 'Bəli! Mebel Dünyası olaraq mənzilinizin dəqiq ölçülərinə, istədiyiniz rəng və tekstil materiallarına uyğun xüsusi mebel hazırlayırıq.',
  },
  {
    q: 'Məhsulu qaytarmaq və ya dəyişdirmək şərtləri necədir?',
    a: 'Qanunvericiliyə uyğun olaraq, zədələnməmiş və qablaşdırması pozulmamış məhsulları 14 gün ərzində rahatlıqla dəyişdirə və ya qaytara bilərsiniz.',
  },
];

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
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
        const { data: prodData } = await supabase.from('products').select('*');
        if (prodData) {
          setProducts(prodData as Product[]);
        }
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
        <section style={{ position: 'relative', height: 'clamp(480px, 75vh, 680px)', overflow: 'hidden', backgroundColor: '#23160F' }}>
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

        {/* 3. SEÇİLMİŞ MƏHSULLAR BÖLMƏSİ */}
        <section id="products" style={{ padding: '50px 0 80px 0', backgroundColor: 'var(--bg-main)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '40px' }}>
              <div>
                <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', marginBottom: '8px' }}>Önə Çıxan Məhsullar</h2>
                <p style={{ color: 'var(--text-muted)' }}>Ən çox üstünlük verilən eksklüziv kolleksiya</p>
              </div>
              <Link href="/mehsullar" className="btn btn-outline">Bütün Məhsullar</Link>
            </div>

            {products.length > 0 ? (
              <div className="grid-responsive-products">
                {products.map((prod) => (
                  <ProductCard key={prod.id} product={prod} onAddToCart={handleAddToCart} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <p>Hələ ki məhsul əlavə edilməyib.</p>
              </div>
            )}
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

        {/* 6. TEZ-TEZ VERİLƏN SUALLAR (FAQ) BÖLMƏSİ */}
        <section style={{ padding: '80px 0', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
          <div className="container" style={{ maxWidth: '840px' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--white)', border: '1px solid var(--border-color)', color: 'var(--accent-primary)', fontSize: '0.88rem', fontWeight: '600', marginBottom: '12px' }}>
                <HelpCircle size={16} /> Suallarınız var?
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: '10px' }}>Tez-Tez Verilən Suallar (FAQ)</h2>
              <p style={{ color: 'var(--text-muted)' }}>Müştərilərimizi maraqlandıran ən çox verilən suallar və cavabları</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {FAQ_ITEMS.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    style={{
                      backgroundColor: 'var(--white)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      overflow: 'hidden',
                      boxShadow: 'var(--shadow-diffuse)',
                      transition: 'var(--transition)',
                    }}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      style={{
                        width: '100%',
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1.05rem',
                        color: isOpen ? 'var(--accent-primary)' : 'var(--text-main)',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      <span>{item.q}</span>
                      <div
                        style={{
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 300ms ease',
                          color: isOpen ? 'var(--accent-primary)' : 'var(--text-muted)',
                          flexShrink: 0,
                        }}
                      >
                        <ChevronDown size={20} />
                      </div>
                    </button>
                    {isOpen && (
                      <div
                        style={{
                          padding: '0 24px 22px 24px',
                          fontSize: '0.96rem',
                          color: 'var(--text-muted)',
                          lineHeight: '1.65',
                          borderTop: '1px dashed var(--border-color)',
                          paddingTop: '16px',
                        }}
                      >
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 7. CTA BÖLMƏSİ */}
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
