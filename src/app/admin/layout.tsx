'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Grid, ShoppingCart, MessageSquare, Mail, Settings, LogOut, User } from 'lucide-react';
import '@/app/admin/admin.css';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Məhsullar', icon: Package },
  { href: '/admin/categories', label: 'Kateqoriyalar', icon: Grid },
  { href: '/admin/orders', label: 'Sifarişlər', icon: ShoppingCart },
  { href: '/admin/reviews', label: 'Rəylər', icon: MessageSquare },
  { href: '/admin/messages', label: 'Mesajlar', icon: Mail },
  { href: '/admin/settings', label: 'Ayarlar', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div class="admin-layout">
      {/* Sol Sidebar (240px Fixed) */}
      <aside class="admin-sidebar">
        <div class="admin-sidebar-logo">
          Mebel <span>Admin</span>
        </div>

        <nav class="admin-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
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

        <Link href="/" class="admin-logout-btn">
          <LogOut size={20} />
          <span>Çıxış Et</span>
        </Link>
      </aside>

      {/* Sağ Əsas Məzmun Sahəsi */}
      <div class="admin-main">
        {/* Üst Bar */}
        <header class="admin-header">
          <h1 class="admin-header-title">Admin İdarəetmə Paneli</h1>
          <div class="admin-profile">
            <div class="admin-avatar">AD</div>
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Admin İstifadəçi</span>
          </div>
        </header>

        {/* Dynamic Body Content */}
        <main class="admin-body">{children}</main>
      </div>
    </div>
  );
}
