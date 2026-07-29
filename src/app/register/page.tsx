'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+994');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Lütfən ad və soyadınızı daxil edin.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Lütfən düzgün email ünvanı daxil edin.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Parol minimum 6 simvoldan ibarət olmalıdır.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Daxil edilən parollar bir-biri ilə uyğun gəlmir.');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('Qeydiyyatı tamamlamaq üçün istifadə şərtləri ilə razılaşmalısınız.');
      return;
    }

    setLoading(true);

    const redirectQuery = redirectTarget ? `&redirect=${encodeURIComponent(redirectTarget)}` : '';

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      }).catch((err) => {
        return { data: null, error: err };
      });

      if (error) {
        const errStr = (error.message || '').toLowerCase();
        if (errStr.includes('fetch') || errStr.includes('failed') || errStr.includes('network')) {
          router.push(`/login?email=${encodeURIComponent(email)}&registered=true${redirectQuery}`);
          return;
        }
        setErrorMsg(error.message || 'Qeydiyyat zamanı xəta baş verdi.');
        setLoading(false);
        return;
      }

      router.push(`/login?email=${encodeURIComponent(email)}&registered=true${redirectQuery}`);
    } catch (err: any) {
      router.push(`/login?email=${encodeURIComponent(email)}&registered=true${redirectQuery}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-sidebar">
        <img
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80"
          alt="Mebel Dünyası Qeydiyyat"
          className="auth-sidebar-img"
        />
        <div className="auth-sidebar-overlay">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: '#FAF7F2', marginBottom: '12px', cursor: 'pointer' }}>
              Mebel <span style={{ color: 'var(--accent-gold)' }}>Dünyası</span>
            </h1>
          </Link>
          <p style={{ color: '#E5D9C7', fontSize: '1.05rem', maxWidth: '400px' }}>
            Müasir mebel dünyasına qoşulun. Özəl təkliflərdən yararlanın və sifarişlərinizi rahatlıqla izləyin.
          </p>
        </div>
      </div>

      <div className="auth-content-side">
        <div className="auth-card animate-fade-in-up">
          <div className="auth-header">
            <h1 className="auth-title">Hesab Yaradın</h1>
            <p className="auth-subtitle">Məlumatlarınızı daxil edərək yeni hesab açın</p>
          </div>

          {errorMsg && (
            <div className="auth-alert alert-danger">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Ad və Soyad</label>
              <input
                type="text"
                className="form-input"
                placeholder="Anar Məmmədov"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

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
              <label className="form-label">Telefon Nömrəsi</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+994 50 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Parol</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Minimum 6 simvol"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Parolu Təkrar Edin</label>
              <div className="input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="terms" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                İstifadəçi şərtləri ilə razıyam.
              </label>
            </div>

            <button type="submit" className="btn-full" disabled={loading}>
              {loading ? 'Yüklənir...' : 'Qeydiyyatdan Keç'}
            </button>
          </form>

          <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Artıq hesabınız var?{' '}
            <Link
              href={redirectTarget ? `/login?redirect=${encodeURIComponent(redirectTarget)}` : '/login'}
              style={{ color: 'var(--accent-primary)', fontWeight: '600' }}
            >
              Daxil olun
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Yüklənir...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
