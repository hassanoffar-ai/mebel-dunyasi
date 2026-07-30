'use client';

import React from 'react';
import { Header, Footer } from '@/components/Navigation';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';

const contactItems = [
  { icon: MapPin, title: 'Ünvan', content: 'Bakı şəhəri, Həsən Əliyev küçəsi 45' },
  { icon: Phone, title: 'Telefon', content: '+994 12 555 00 11', href: 'tel:+994125550011' },
  { icon: Mail, title: 'Email', content: 'info@mebeldunyasi.az', href: 'mailto:info@mebeldunyasi.az' },
  { icon: Clock, title: 'İş saatları', content: 'Bazar ertəsi - Şənbə: 09:00 - 20:00' },
];

export default function ContactPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Header />
      <main style={{ flexGrow: 1, padding: '50px 0 90px' }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          <section style={{ background: 'var(--white)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'clamp(24px, 5vw, 48px)', boxShadow: 'var(--shadow-diffuse)' }}>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: '10px' }}>Əlaqə</h1>
              <p style={{ color: 'var(--text-muted)' }}>Sual və sifarişləriniz üçün aşağıdakı əlaqə vasitələrindən istifadə edin.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '18px' }}>
              {contactItems.map(({ icon: Icon, title, content, href }) => (
                <div key={title} style={{ display: 'flex', gap: '13px', padding: '18px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)' }}>
                  <Icon size={21} style={{ flexShrink: 0, color: 'var(--accent-primary)' }} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>{title}</strong>
                    {href ? <a href={href} style={{ color: 'var(--accent-primary)' }}>{content}</a> : <span style={{ color: 'var(--text-muted)' }}>{content}</span>}
                  </div>
                </div>
              ))}
            </div>
            <a href="https://wa.me/994500000000" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ display: 'flex', width: 'fit-content', margin: '30px auto 0', gap: '8px' }}>
              <MessageCircle size={18} /> WhatsApp ilə yazın
            </a>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
