'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Grid, ShoppingCart, MessageSquare, Mail, Settings, LogOut, User, Quote } from 'lucide-react';
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

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="admin-layout">
      {/* Sol Sidebar (240px Fixed) */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          Mebel <span>Admin</span>
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
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          href="/admin/login"
          className="admin-logout-btn"
          onClick={() => {
            document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
          }}
        >
          <LogOut size={20} />
          <span>Çıxış Et</span>
        </Link>
      </aside>

      {/* Sağ Əsas Məzmun Sahəsi */}
      <div className="admin-main">
        {/* Üst Bar */}
        <header className="admin-header">
          <h1 className="admin-header-title">Admin İdarəetmə Paneli</h1>
          <div className="admin-profile">
            <div className="admin-avatar">AD</div>
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Admin İstifadəçi</span>
          </div>
        </header>

        {/* Dynamic Body Content */}
        <main className="admin-body">{children}</main>
      </div>
    </div>
  );
}
