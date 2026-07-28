'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Lock, AlertCircle, ShieldAlert } from 'lucide-react';
import '@/app/admin/admin.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      // Direct Admin Credential Check (Super Admin Fallback)
      if (email.trim().toLowerCase() === 'admin@mebeldunyasi.az' && password === 'admin123') {
        document.cookie = 'admin_session=authenticated; path=/; max-age=86400;';
        router.push('/admin/dashboard');
        return;
      }

      // 1. Supabase Auth Password Login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setErrorMsg(authError.message || 'Email və ya parol yanlışdır.');
        setLoading(false);
        return;
      }

      const user = authData.user;
      if (!user) {
        setErrorMsg('İstifadəçi tapılmadı.');
        setLoading(false);
        return;
      }

      // 2. Strict Admin Role Verification from Supabase DB
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const isAdmin = profileData?.role === 'admin';

      if (!isAdmin) {
        await supabase.auth.signOut();
        setErrorMsg('Bu hesabın admin icazəsi yoxdur. Yalnız təsdiqlənmiş adminlər daxil ola bilər.');
        setLoading(false);
        return;
      }

      document.cookie = 'admin_session=authenticated; path=/; max-age=86400;';
      router.push('/admin/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Daxilolma zamanı sistem xətası baş verdi.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#2B1D14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--admin-radius)',
          padding: '36px 30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        }}
      >
        {/* Loqo & Başlıq */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#2B1D14', marginBottom: '4px' }}>
            Mebel <span style={{ color: '#C9A15D' }}>Dünyası</span>
          </h1>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B5D4F', fontWeight: '600' }}>
            Admin Panel Girişi
          </span>
        </div>

        {/* Xəta Mesajı Alert */}
        {errorMsg && (
          <div
            style={{
              backgroundColor: 'var(--admin-danger-bg)',
              color: 'var(--admin-danger)',
              border: '1px solid rgba(179,65,58,0.2)',
              borderRadius: 'var(--admin-radius)',
              padding: '12px',
              fontSize: '0.88rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <ShieldAlert size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin}>
          {/* Email Input */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#2B1D14' }}>
              Email Ünvanı
            </label>
            <input
              type="email"
              placeholder="admin@mebeldunyasi.az"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--admin-radius)',
                border: '1px solid var(--admin-border)',
                fontSize: '0.92rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Parol Input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#2B1D14' }}>
              Parol
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 14px',
                  borderRadius: 'var(--admin-radius)',
                  border: '1px solid var(--admin-border)',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6B5D4F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  zIndex: 2,
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Daxil Ol Düyməsi */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'var(--admin-accent)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--admin-radius)',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 200ms ease',
            }}
          >
            {loading ? 'Yoxlanılır...' : 'Daxil Ol'}
          </button>
        </form>
      </div>
    </div>
  );
}
