'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Heart, ShoppingBag, User, LogOut, Menu, X, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

import { useCart } from '@/context/CartContext';

interface HeaderProps {
  cartCount?: number;
}

export function Header({ cartCount: propCartCount }: HeaderProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSession, setUserSession] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount: contextCartCount } = useCart();

  const cartCount = propCartCount !== undefined ? propCartCount : contextCartCount;

  React.useEffect(() => {
    // Check localStorage session
    const localSession = localStorage.getItem('mebel_user_session');
    if (localSession) {
      try {
        setUserSession(JSON.parse(localSession));
      } catch (e) {
        setUserSession({ email: 'user' });
      }
    }

    // Check Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserSession(session.user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUserSession(session.user);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('mebel_user_session');
    setUserSession(null);
    router.push('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/mehsullar?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navItems = [
    { name: 'Ana Səhifə', href: '/' },
    { name: 'Məhsullar', href: '/mehsullar' },
    { name: 'Materiallar', href: '/materiallar' },
    { name: 'Haqqımızda', href: '/haqqimizda' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Əlaqə', href: '/elaqe' },
  ];

  return (
    <header className="header" style={{ position: 'relative' }}>
      <div className="container">
        <div className="header-wrapper">
          <button
            className="hamburger"
            aria-label={isMobileOpen ? 'Menyunu bağla' : 'Menyunu aç'}
            aria-expanded={isMobileOpen}
            onClick={() => setIsMobileOpen((open) => !open)}
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className="logo">
            Mebel <span>Dünyası</span>
          </Link>

          {/* Desktop Nav */}
          <nav>
            <ul className="nav-links">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={`nav-link ${isActive ? 'active' : ''}`}>
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Header Actions */}
          <div className="header-actions">
            <button className="icon-btn" title="Axtarış" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search size={20} />
            </button>
            <Link href="/sevimliler" className="icon-btn" title="Sevimlilər"><Heart size={20} /></Link>
            <Link href="/sebet" className="icon-btn" title="Səbət">
              <ShoppingBag size={20} />
              <span className="icon-badge">{cartCount}</span>
            </Link>

            {userSession ? (
              <>
                <Link href="/profil" className="icon-btn" title="Profilim"><User size={20} /></Link>
                <button
                  className="icon-btn"
                  title="Çıxış Et"
                  onClick={handleLogout}
                  style={{ color: '#D9534F' }}
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <Link href="/login" className="icon-btn" title="Hesabım"><User size={20} /></Link>
            )}

          </div>
        </div>
      </div>

      {/* Dynamic Search Modal Bar */}
      {isSearchOpen && (
        <div
          style={{
            backgroundColor: 'var(--white)',
            borderBottom: '1px solid var(--border-color)',
            padding: '16px 0',
            boxShadow: 'var(--shadow-hover)',
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 99,
          }}
        >
          <div className="container">
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Search size={20} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Axtarmaq istədiyiniz mebelin adını yazın və Enter sıxın..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '1rem',
                  fontFamily: 'var(--font-sans)',
                  backgroundColor: 'transparent',
                }}
              />
              <button type="submit" className="btn btn-gold" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
                Axtar
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={22} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <>
          <button className="mobile-nav-backdrop" aria-label="Menyunu bağla" onClick={() => setIsMobileOpen(false)} />
          <nav className="mobile-nav-drawer open" aria-label="Mobil menyu">
            <div className="mobile-nav-title">Menyu</div>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', marginBottom: '40px' }}>
          {/* Column 1: Naviqasiya */}
          <div className="footer-col" style={{ gridColumn: 'span 1' }}>
            <h4 className="footer-title">Naviqasiya</h4>
            <ul className="footer-links">
              <li><Link href="/">Ana Səhifə</Link></li>
              <li><Link href="/mehsullar">Məhsullar</Link></li>
              <li><Link href="/materiallar">Materiallar</Link></li>
              <li><Link href="/haqqimizda">Haqqımızda</Link></li>
            </ul>
          </div>

          {/* Column 2: Müştəri Xidməti */}
          <div className="footer-col" style={{ gridColumn: 'span 1' }}>
            <h4 className="footer-title">Müştəri Xidməti</h4>
            <ul className="footer-links">
              <li><Link href="/elaqe">Əlaqə & Dəstək</Link></li>
              <li><Link href="/faq">Çatdırılma Şərtləri</Link></li>
              <li><Link href="/faq">Qaytarma və Dəyişdirilmə</Link></li>
            </ul>
          </div>

          {/* Column 3: Bizimlə Əlaqə */}
          <div className="footer-col" style={{ gridColumn: 'span 1' }}>
            <h4 className="footer-title">Bizimlə Əlaqə</h4>
            <p className="footer-desc" style={{ marginBottom: '8px', color: '#D4C9BF' }}>Bakı şəh., Həsən Əliyev küç. 45</p>
            <p className="footer-desc" style={{ color: '#D4C9BF' }}>Tel: +994 12 555 00 11</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Mebel Dünyası. Bütün hüquqlar qorunur.</p>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <a href="https://wa.me/994500000000" target="_blank" rel="noreferrer" className="whatsapp-float" title="WhatsApp ilə əlaqə">
        <MessageCircle size={28} />
      </a>
    </footer>
  );
}
