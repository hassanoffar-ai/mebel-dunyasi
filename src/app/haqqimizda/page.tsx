'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header, Footer } from '@/components/Navigation';
import { Award, Hammer, Leaf, Smile, ArrowRight } from 'lucide-react';

const VALUES = [
  {
    icon: <Award size={36} color="var(--accent-primary)" />,
    title: 'Yüksək Keyfiyyət',
    text: 'Hər bir mebel parçası ən dözümlü təbii ağac və yüksək standartlı tekstil materiallarından hazırlanır.',
  },
  {
    icon: <Hammer size={36} color="var(--accent-primary)" />,
    title: 'Ənənəvi Sənətkarlıq',
    text: 'Usta sənətkarlarımızın təcrübəsi və modern texnologiyaların sintezi ilə unikal dizaynlar yaradırıq.',
  },
  {
    icon: <Leaf size={36} color="var(--accent-primary)" />,
    title: 'Davamlılıq & Ekologiya',
    text: 'Ətraf mühitə zərər verməyən, eko-standartlara cavab verən təbii cilalama və təbii xammaldan istifadə edirik.',
  },
  {
    icon: <Smile size={36} color="var(--accent-primary)" />,
    title: 'Müştəri Məmnuniyyəti',
    text: 'Müştərilərimizin istəkləri bizim üçün prioritetdir. Satışdan sonra 2 illik tam zəmanət dəstəyi təqdim edirik.',
  },
];

export default function AboutPage() {
  const [cartCount, setCartCount] = useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Header cartCount={cartCount} />

      <main style={{ flexGrow: 1 }}>
        {/* 1. HERO BÖLMƏSİ */}
        <section style={{ position: 'relative', height: '600px', backgroundColor: '#23160F', overflow: 'hidden' }}>
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80"
            alt="Mebel Dünyası Hekayəmiz"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(43,29,20,0.5) 0%, rgba(43,29,20,0.8) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '0 20px',
            }}
          >
            <div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3.2rem', color: 'var(--white)', marginBottom: '12px' }}>
                Hekayəmiz
              </h1>
              <p style={{ color: '#E5D9C7', fontSize: '1.1rem', maxWidth: '600px' }}>
                Minimalist estetika, yüksək keyfiyyət və sənətkarlıq ruhunu evlərinizə gətiririk.
              </p>
            </div>
          </div>
        </section>

        {/* 2. ZIG-ZAG MƏTN BÖLMƏSİ */}
        <section style={{ padding: '80px 0', backgroundColor: 'var(--bg-main)' }}>
          <div className="container">
            {/* Blok 1: Sol mətn, Sağ şəkil */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center', marginBottom: '80px' }}>
              <div>
                <span style={{ color: 'var(--accent-gold)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.85rem' }}>Biz Kimik?</span>
                <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', margin: '12px 0 20px 0' }}>
                  Zəriflik və Komfortun Qovuşduğu Ünvan
                </h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '16px' }}>
                  2010-cu ildən fəaliyyətə başlayan "Mebel Dünyası" təbii ağac materialları və minimalist dizayn konsepsiyası ilə Azərbaycan mebel sektorunda unikal bir dəst-xətt yaratmışdır.
                </p>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '16px' }}>
                  Biz yalnız mebel istehsal etmirik; yaşayış sahələrinizə estetika, isti abu-hava və uzunömürlü rahatlıq qatırıq. Avropa istehsalı texnologiyalar və milli sənətkarlığın sintezi ilə məkanlarınıza xüsusi dəyər qatırıq.
                </p>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
                  Hər il 10,000-dən çox ailənin evini yeniləyərək modern dizayn və zəmanətli dözümlülük prinsipinə sadiq qalırıq.
                </p>
              </div>
              <div>
                <img
                  src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"
                  alt="Mebel Dünyası İnteryer"
                  style={{ width: '100%', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-diffuse)' }}
                />
              </div>
            </div>

            {/* Blok 2: Sol şəkil, Sağ mətn (Zig-zag) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
              <div>
                <img
                  src="https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80"
                  alt="Sənətkarlıq İş prosesi"
                  style={{ width: '100%', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-diffuse)' }}
                />
              </div>
              <div>
                <span style={{ color: 'var(--accent-gold)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.85rem' }}>İstehsalat Fəlsəfəmiz</span>
                <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', margin: '12px 0 20px 0' }}>
                  Hər Bir Detalda Əl Əməyi və İncəlik
                </h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '16px' }}>
                  Mebellərimizin istehsalında istifadə olunan hər bir ağac lövhəsi xüsusi diqqətlə seçilir və təcrübəli sənətkarlarımız tərəfindən işlənir.
                </p>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '16px' }}>
                  Təbii palıd, qoz və bej tonlarında keyfiyyətli parçalarla hazırladığımız məhsullar evinizin hər küncündə fərq yaradır. Ekoloji təmiz örtüklər uşaqlarınız və ailəniz üçün 100% təhlükəsizdir.
                </p>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
                  Dizaynlarımızın unikallığı və ən son interyer trendlərinə uyğunluğu ilə həm klassik, həm də müasir üslub həvəskarlarının zövqünü oxşayırıq.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. DƏYƏRLƏRİMİZ BÖLMƏSİ */}
        <section style={{ padding: '80px 0', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', marginBottom: '12px' }}>Dəyərlərimiz</h2>
              <p style={{ color: 'var(--text-muted)' }}>İşimizin təməlində duran əsas prinsiplər</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
              {VALUES.map((val, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'var(--white)',
                    padding: '32px 24px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-diffuse)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ marginBottom: '16px' }}>{val.icon}</div>
                  <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', marginBottom: '10px' }}>{val.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{val.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. RƏQƏMLƏRLƏ BİZ BÖLMƏSİ (Tünd fon, Qızılı rəqəmlər) */}
        <section style={{ padding: '80px 0', backgroundColor: '#23160F', color: 'var(--white)', textAlign: 'center' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
              <div>
                <span style={{ fontSize: '3.2rem', fontFamily: 'var(--font-serif)', fontWeight: '700', color: 'var(--accent-gold)', display: 'block', marginBottom: '8px' }}>
                  15+
                </span>
                <span style={{ color: '#D4C9BF', fontSize: '1.05rem' }}>İllik Sənaye Təcrübəsi</span>
              </div>
              <div>
                <span style={{ fontSize: '3.2rem', fontFamily: 'var(--font-serif)', fontWeight: '700', color: 'var(--accent-gold)', display: 'block', marginBottom: '8px' }}>
                  10,000+
                </span>
                <span style={{ color: '#D4C9BF', fontSize: '1.05rem' }}>Məmnun Müştəri</span>
              </div>
              <div>
                <span style={{ fontSize: '3.2rem', fontFamily: 'var(--font-serif)', fontWeight: '700', color: 'var(--accent-gold)', display: 'block', marginBottom: '8px' }}>
                  500+
                </span>
                <span style={{ color: '#D4C9BF', fontSize: '1.05rem' }}>Eksklüziv Mebel Çeşidi</span>
              </div>
              <div>
                <span style={{ fontSize: '3.2rem', fontFamily: 'var(--font-serif)', fontWeight: '700', color: 'var(--accent-gold)', display: 'block', marginBottom: '8px' }}>
                  100%
                </span>
                <span style={{ color: '#D4C9BF', fontSize: '1.05rem' }}>Rəsmi Keyfiyyət Zəmanəti</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. CTA BÖLMƏSİ */}
        <section style={{ padding: '80px 20px', backgroundColor: 'var(--bg-secondary)', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-serif)', marginBottom: '16px' }}>
              Evinizi Bizimlə Bəzəyin
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '32px' }}>
              Bütün kolleksiyalarımızı onlayn araşdırın və ya mağazamıza baş çəkərək mebellərimizi canlı kəşf edin.
            </p>
            <Link href="/elaqe" className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1rem' }}>
              Bizimlə Əlaqə Saxlayın <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
