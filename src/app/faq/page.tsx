'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header, Footer } from '@/components/Navigation';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';

export const FAQ_ITEMS = [
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

export default function FAQPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Header />

      <main style={{ flexGrow: 1, padding: '60px 0 90px 0' }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          {/* Header Title */}
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 18px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--white)',
                border: '1px solid var(--border-color)',
                color: 'var(--accent-primary)',
                fontSize: '0.88rem',
                fontWeight: '600',
                marginBottom: '14px',
                boxShadow: 'var(--shadow-diffuse)',
              }}
            >
              <HelpCircle size={17} /> Suallarınız var?
            </div>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3rem)', fontFamily: 'var(--font-serif)', color: 'var(--text-main)', marginBottom: '12px' }}>
              Tez-Tez Verilən Suallar (FAQ)
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '580px', margin: '0 auto' }}>
              Müştərilərimizi ən çox maraqlandıran suallar və onların ətraflı cavabları ilə tanış olun.
            </p>
          </div>

          {/* Accordions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '60px' }}>
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
                    boxShadow: isOpen ? 'var(--shadow-hover)' : 'var(--shadow-diffuse)',
                    transition: 'all 300ms ease',
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    style={{
                      width: '100%',
                      padding: '22px 26px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1.08rem',
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
                      <ChevronDown size={22} />
                    </div>
                  </button>
                  {isOpen && (
                    <div
                      style={{
                        padding: '0 26px 24px 26px',
                        fontSize: '1rem',
                        color: 'var(--text-muted)',
                        lineHeight: '1.7',
                        borderTop: '1px dashed var(--border-color)',
                        paddingTop: '18px',
                      }}
                    >
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Additional Support Banner */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              padding: '36px 30px',
              border: '1px solid var(--border-color)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <MessageSquare size={36} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', color: 'var(--text-main)', margin: 0 }}>
              Axtardığınız sualın cavabını tapmadınız?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, maxWidth: '480px' }}>
              Müştəri xidmətlərimiz həftənin 7 günü sizə kömək etməyə hazırdır. Bizimlə istənilən vaxt əlaqə saxlaya bilərsiniz.
            </p>
            <Link href="/elaqe" className="btn btn-gold" style={{ marginTop: '6px', padding: '12px 32px' }}>
              Bizimlə Əlaqə
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
