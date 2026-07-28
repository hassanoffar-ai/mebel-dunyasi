'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

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

    // Validations
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

    try {
      // Supabase Auth SignUp
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message || 'Qeydiyyat zamanı xəta baş verdi.');
        setLoading(false);
        return;
      }

      // Successful registration -> Navigate to /login with state/query params
      router.push(`/login?email=${encodeURIComponent(email)}&registered=true`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Sistemdə gözlənilməz xəta baş verdi.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Sol tərəf - Şəkil və Breand brending (Header/Footer yoxdur) */}
      <div className="auth-sidebar">
        <img
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80"
          alt="Mebel Dünyası Qeydiyyat"
          className="auth-sidebar-img"
          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'; }}
        />
        <div className="auth-sidebar-overlay">
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: '#FAF7F2', marginBottom: '12px' }}>
            Mebel <span style={{ color: 'var(--accent-gold)' }}>Dünyası</span>
          </h1>
          <p style={{ color: '#E5D9C7', fontSize: '1.05rem', maxWidth: '400px' }}>
            Minimalist və zərif dizayn dünyasına xoş gəlmisiniz. Şəxsi kabinetinizi yaradın və xüsusi fürsətlərdən yararlanın.
          </p>
        </div>
      </div>

      {/* Sağ tərəf - Qeydiyyat Forması */}
      <div className="auth-content-side">
        <div className="auth-card animate-fade-in-up">
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', marginBottom: '8px', color: 'var(--text-main)' }}>
              Yeni Hesab Yaradın
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Qeydiyyatdan keçmək üçün məlumatlarınızı daxil edin
            </p>
          </div>

          {/* Xəta Mesajı */}
          {errorMsg && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister}>
            {/* Ad Soyad */}
            <div className="form-group">
              <label className="form-label">Ad və Soyad</label>
              <input
                type="text"
                className="form-input"
                placeholder="Nümunə: Əli Əliyev"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
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

            {/* Telefon */}
            <div className="form-group">
              <label className="form-label">Telefon Nömrəsi</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+994 50 000 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Parol */}
            <div className="form-group">
              <label className="form-label">Parol (Min. 6 simvol)</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
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

            {/* Parolu təkrarla */}
            <div className="form-group">
              <label className="form-label">Parolu Təkrarlayın</label>
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

            {/* Şərtlərlə razıyam Checkbox */}
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
              <label htmlFor="terms" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <Link href="#" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>
                  İstifadəçi şərtləri
                </Link>{' '}
                və məxfilik siyasəti ilə razıyam.
              </label>
            </div>

            {/* Düymə */}
            <button type="submit" className="btn-full" disabled={loading}>
              {loading ? 'Qeydiyyat aparılır...' : 'Qeydiyyatdan Keç'}
            </button>
          </form>

          {/* Login Linki */}
          <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Artıq hesabınız var?{' '}
            <Link href="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
              Daxil olun
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
