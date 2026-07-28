'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Heart, ShoppingBag, User, Menu, X, MessageCircle } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
}

export function Header({ cartCount }: HeaderProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: 'Ana Səhifə', href: '/' },
    { name: 'Məhsullar', href: '/mehsullar' },
    { name: 'Kateqoriyalar', href: '/kateqoriyalar' },
    { name: 'Haqqımızda', href: '/haqqimizda' },
    { name: 'Əlaqə', href: '/elaqe' },
  ];

  return (
    <header className="header">
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
            <button className="icon-btn" title="Axtarış"><Search size={20} /></button>
            <button className="icon-btn" title="Sevimlilər"><Heart size={20} /></button>
            <Link href="/sebet" className="icon-btn" title="Səbət">
              <ShoppingBag size={20} />
              <span className="icon-badge">{cartCount}</span>
            </Link>
            <Link href="/login" className="icon-btn" title="Hesabım"><User size={20} /></Link>

            {/* Mobile Hamburger */}
            <button
              className="hamburger"
              style={{ display: 'flex' }}
              onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

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
