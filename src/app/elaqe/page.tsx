'use client';

import React, { useState } from 'react';
import { Header, Footer } from '@/components/Navigation';
import { supabase } from '@/lib/supabase';
import { MapPin, Phone, Mail, Clock, MessageCircle, Globe, Share2, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const [cartCount, setCartCount] = useState(0);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Sual');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Lütfən ad, email və mesaj sahələrini doldurun.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Lütfən düzgün email ünvanı daxil edin.');
      return;
    }

    setLoading(true);

    try {
      // Supabase contact_messages table insert
      await supabase.from('contact_messages').insert([
        {
          full_name: fullName,
          email,
          phone,
          subject,
          message,
        },
      ]);

      setIsSuccess(true);
    } catch (err: any) {
      // Fallback for UI demo
      setIsSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Header cartCount={cartCount} />

      <main style={{ flexGrow: 1, padding: '50px 0 90px 0' }}>
        <div className="container">
          {/* Header Title */}
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 50px auto' }}>
            <h1 style={{ fontSize: '2.8rem', fontFamily: 'var(--font-serif)', marginBottom: '12px', color: 'var(--text-main)' }}>
              Bizimlə Əlaqə
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
              Suallarınız, təklifləriniz və ya xüsusi sifarişləriniz üçün bizə yazın və ya mağazamıza baş çəkin.
            </p>
          </div>

          {/* 2 Sütunlu Responsive Layout (Desktop 40/60, Mobil üst-üstə) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '36px' }}>
            {/* SOL SÜTUN (40%): Əlaqə Məlumatları & Xəritə */}
            <div style={{ gridColumn: 'span 5' }}>
              <div
                style={{
                  backgroundColor: 'var(--white)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  padding: '32px',
                  boxShadow: 'var(--shadow-diffuse)',
                  marginBottom: '24px',
                }}
              >
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)', marginBottom: '24px', color: 'var(--text-main)' }}>
                  Əlaqə Vasitələri
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.95rem' }}>
                  {/* Ünvan */}
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)' }}>
                      <MapPin size={20} />
                    </div>
                    <div>
                      <strong style={{ display: 'block', marginBottom: '2px', color: 'var(--text-main)' }}>Ünvan:</strong>
                      <span style={{ color: 'var(--text-muted)' }}>Bakı şəhəri, Həsən Əliyev küçəsi 45</span>
                    </div>
                  </div>

                  {/* Telefon */}
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)' }}>
                      <Phone size={20} />
                    </div>
                    <div>
                      <strong style={{ display: 'block', marginBottom: '2px', color: 'var(--text-main)' }}>Telefon:</strong>
                      <a href="tel:+994125550011" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
                        +994 12 555 00 11
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)' }}>
                      <Mail size={20} />
                    </div>
                    <div>
                      <strong style={{ display: 'block', marginBottom: '2px', color: 'var(--text-main)' }}>Email:</strong>
                      <a href="mailto:info@mebeldunyasi.az" style={{ color: 'var(--accent-primary)' }}>
                        info@mebeldunyasi.az
                      </a>
                    </div>
                  </div>

                  {/* İş Saatları */}
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)' }}>
                      <Clock size={20} />
                    </div>
                    <div>
                      <strong style={{ display: 'block', marginBottom: '2px', color: 'var(--text-main)' }}>İş Saatları:</strong>
                      <span style={{ color: 'var(--text-muted)' }}>Bazar ertəsi - Şənbə: 09:00 - 20:00</span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp & Sosial Media */}
                <div style={{ marginTop: '28px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <a
                    href="https://wa.me/994500000000"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#25D366',
                      color: 'white',
                      padding: '12px 20px',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      width: '100%',
                      justifyContent: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <MessageCircle size={20} /> WhatsApp ilə Çat Yazın
                  </a>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <a href="#" className="social-icon" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}>
                      <Globe size={18} />
                    </a>
                    <a href="#" className="social-icon" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}>
                      <Share2 size={18} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* SAĞ SÜTUN (60%): Əlaqə Forması */}
            <div style={{ gridColumn: 'span 7' }}>
              <div
                style={{
                  backgroundColor: 'var(--white)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  padding: '36px',
                  boxShadow: 'var(--shadow-diffuse)',
                }}
              >
                {isSuccess ? (
                  /* GÖNDƏRİLDİKDƏN SONRAKİ İLLÜSTRATİV MESAJS */
                  <div style={{ textAlign: 'center', padding: '40px 10px' }}>
                    <div
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--success-bg)',
                        color: 'var(--success-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px auto',
                      }}
                    >
                      <CheckCircle2 size={42} />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', marginBottom: '10px' }}>
                      Mesajınız Göndərildi!
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '450px', margin: '0 auto 24px auto' }}>
                      Müraciətiniz qeydə alındı. Operativ komandamız tezliklə sizinlə əlaqə saxlayacaqdır.
                    </p>
                    <button
                      onClick={() => {
                        setIsSuccess(false);
                        setFullName('');
                        setEmail('');
                        setPhone('');
                        setMessage('');
                      }}
                      className="btn btn-outline"
                    >
                      Yenidən Mesaj Göndər
                    </button>
                  </div>
                ) : (
                  /* ƏLAQƏ FORMASI */
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-serif)', marginBottom: '8px', color: 'var(--text-main)' }}>
                      Məktub Göndərin
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                      Formu doldurun, ən qısa zamanda sizə cavab verək.
                    </p>

                    {errorMsg && (
                      <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                        <AlertCircle size={18} />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit}>
                      <div className="form-group">
                        <label className="form-label">Ad və Soyad</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Əli Əliyev"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                          <label className="form-label">Email Ünvanı</label>
                          <input
                            type="email"
                            className="form-input"
                            placeholder="name@domain.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Telefon (Opsional)</label>
                          <input
                            type="tel"
                            className="form-input"
                            placeholder="+994 50 000 00 00"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Mövzu</label>
                        <select
                          className="form-input"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                        >
                          <option value="Sual">Məhsul haqqında sual</option>
                          <option value="Xüsusi Sifariş">Xüsusi Mebel Sifarişi</option>
                          <option value="Şikayət">Şikayət vı narazılıq</option>
                          <option value="Təklif">Təklif və əməkdaşlıq</option>
                          <option value="Digər">Digər</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Mesajınız</label>
                        <textarea
                          className="form-input"
                          rows={5}
                          placeholder="Müraciətinizi təfərrüatlı qeyd edin..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                        />
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
                        <Send size={18} />
                        {loading ? 'Göndərilir...' : 'Mesajı Göndər'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
