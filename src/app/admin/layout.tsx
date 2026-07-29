'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, Grid, ShoppingCart, MessageSquare, Mail, LogOut, Quote, Menu, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import '@/app/admin/admin.css';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/sifarisler', label: 'Sifarişlər', icon: ShoppingCart },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Quote },
  { href: '/admin/mehsullar', label: 'Məhsullar', icon: Package },
  { href: '/admin/kateqoriyalar', label: 'Kateqoriyalar', icon: Grid },
  { href: '/admin/reyler', label: 'Rəylər', icon: MessageSquare },
  { href: '/admin/mesajlar', label: 'Mesajlar', icon: Mail },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsAuthenticated(true);
      return;
    }

    const checkSession = () => {
      const cookies = document.cookie.split(';');
      const hasCookie = cookies.some((c) => c.trim().startsWith('admin_session=authenticated'));

      if (!hasCookie) {
        setIsAuthenticated(false);
        window.location.replace('/admin/login');
      } else {
        setIsAuthenticated(true);
      }
    };

    checkSession();
  }, [pathname]);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    // 1. Delete admin_session cookie
    document.cookie = 'admin_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    document.cookie = 'admin_session=; path=/admin; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;';

    // 2. Sign out from Supabase Auth
    try {
      await supabase.auth.signOut();
    } catch (err) {}

    // 3. Clear local storage
    try {
      localStorage.removeItem('admin_session');
      localStorage.removeItem('mebel_admin_session');
    } catch (err) {}

    // 4. Force location replace to /admin/login so browser back button cannot reopen admin pages
    window.location.replace('/admin/login');
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isAuthenticated === false) {
    return null;
  }

  return (
    <div className="admin-layout">
      {/* Sol Sidebar (240px Fixed) */}
      {isMenuOpen && <button className="admin-menu-backdrop" aria-label="Menyunu bağla" onClick={() => setIsMenuOpen(false)} />}
      <aside className={`admin-sidebar ${isMenuOpen ? 'is-open' : ''}`}>
        <div className="admin-sidebar-logo">
          Mebel <span>Admin</span>
          <button className="admin-menu-close" aria-label="Menyunu bağla" onClick={() => setIsMenuOpen(false)}><X size={22} /></button>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href === '/admin/dashboard' && pathname === '/admin') ||
              (pathname.startsWith(item.href) && item.href !== '/admin');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="admin-logout-btn"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          <span>Çıxış Et</span>
        </button>
      </aside>

      {/* Sağ Əsas Məzmun Sahəsi */}
      <div className="admin-main">
        {/* Üst Bar */}
        <header className="admin-header">
          <button className="admin-menu-toggle" aria-label="Menyunu aç" aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen(true)}>
            <Menu size={23} />
          </button>
          <h1 className="admin-header-title">Admin İdarəetmə Paneli</h1>
        </header>

        {/* Dynamic Body Content */}
        <main className="admin-body">{children}</main>
      </div>
    </div>
  );
}
