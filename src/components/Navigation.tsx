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
    { name: 'Kateqoriyalar', href: '/kateqoriyalar' },
    { name: 'Haqqımızda', href: '/haqqimizda' },
    { name: 'Əlaqə', href: '/elaqe' },
  ];

  return (
    <header className="header" style={{ position: 'relative' }}>
      <div className="container">
        <div className="header-wrapper">
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
              <button
                className="icon-btn"
                title="Çıxış Et"
                onClick={handleLogout}
                style={{ color: '#D9534F' }}
              >
                <LogOut size={20} />
              </button>
            ) : (
              <Link href="/login" className="icon-btn" title="Hesabım"><User size={20} /></Link>
            )}

            {/* Mobile Hamburger */}
            <button
              className="hamburger"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
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
        <div className="mobile-nav-drawer open">
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
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-logo">Mebel <span>Dünyası</span></div>
            <p className="footer-desc">
              Mebel Dünyası evinizin rahatlığı və estetik gözəlliyi üçün yüksək keyfiyyətli, modern və minimalist mebellər təqdim edir.
            </p>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Naviqasiya</h4>
            <ul className="footer-links">
              <li><Link href="/">Ana Səhifə</Link></li>
              <li><Link href="#products">Məhsullar</Link></li>
              <li><Link href="#categories">Kateqoriyalar</Link></li>
              <li><Link href="#about">Haqqımızda</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Müştəri Xidməti</h4>
            <ul className="footer-links">
              <li><Link href="#">Əlaqə & Dəstək</Link></li>
              <li><Link href="#">Çatdırılma Şərtləri</Link></li>
              <li><Link href="#">Qaytarma vı Dəyişdirilmə</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Bizimlə Əlaqə</h4>
            <p className="footer-desc" style={{ marginBottom: '8px' }}>Bakı şəh., Həsən Əliyev küç. 45</p>
            <p className="footer-desc">Tel: +994 12 555 00 11</p>
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
