'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, DollarSign, MessageSquare, Package, TrendingUp, Eye, ArrowRight, Star } from 'lucide-react';
import '@/app/admin/admin.css';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingReviewsCount: number;
  activeProductsCount: number;
}

const MOCK_RECENT_ORDERS = [
  { id: 'MD-584912', customer: 'Anar Məmmədov', amount: '2,430 ₼', status: 'confirmed', date: '28 İyul 2026' },
  { id: 'MD-391204', customer: 'Leyla Həsənova', amount: '980 ₼', status: 'pending', date: '28 İyul 2026' },
  { id: 'MD-109283', customer: 'Vüsal Qasımov', amount: '1,450 ₼', status: 'cancelled', date: '27 İyul 2026' },
  { id: 'MD-901244', customer: 'Nərgiz Əliyeva', amount: '2,100 ₼', status: 'shipped', date: '26 İyul 2026' },
  { id: 'MD-748392', customer: 'Elvin Qasımov', amount: '750 ₼', status: 'pending', date: '26 İyul 2026' },
];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Gözləmədə (pending)',
  confirmed: 'Təsdiqləndi (confirmed)',
  processing: 'Hazırlanır (processing)',
  shipped: 'Göndərildi (shipped)',
  delivered: 'Çatdırıldı (delivered)',
  cancelled: 'Ləğv edildi (cancelled)',
};

const MOCK_PENDING_REVIEWS = [
  { id: '1', user: 'Əli Həsənov', rating: 5, comment: 'Çox keyfiyyətli divandır, çatdırılma vaxtında oldu.', date: 'Bu gün' },
  { id: '2', user: 'Günel Quliyeva', rating: 4, comment: 'Palıd masa çox zərifdir, amma quraşdırılması bir az vaxt aldı.', date: 'Dünən' },
  { id: '3', user: 'Rəşad Nəsirov', rating: 5, comment: 'Mükəmməl sənətkarlıq işidir!', date: '26 İyul' },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 142,
    totalRevenue: 48250,
    pendingReviewsCount: 5,
    activeProductsCount: 86,
  });

  // Supabase dynamic stats calculation
  useEffect(() => {
    async function loadStats() {
      try {
        const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
        const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
        const { count: pendingRevCount } = await supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending');

        setStats((prev) => ({
          ...prev,
          totalOrders: ordersCount || prev.totalOrders,
          activeProductsCount: productsCount || prev.activeProductsCount,
          pendingReviewsCount: pendingRevCount || prev.pendingReviewsCount,
        }));
      } catch (err) {
        console.log('Using mock dashboard metrics');
      }
    }
    loadStats();
  }, []);

  return (
    <div>
      {/* 1. 4 STATİSTİKA KARTI (Grid, 4 sütun desktop / 2 sütun tablet) */}
      <div className="admin-metrics-grid">
        {/* Kart 1: Ümumi Sifarişlər */}
        <div className="admin-metric-card">
          <div>
            <div className="admin-metric-label">Ümumi Sifarişlər</div>
            <div className="admin-metric-value">{stats.totalOrders}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--admin-success)', marginTop: '4px' }}>
              <TrendingUp size={14} /> +12% son 7 gün
            </div>
          </div>
          <div className="admin-metric-icon">
            <ShoppingCart size={24} />
          </div>
        </div>

        {/* Kart 2: Ümumi Gəlir */}
        <div className="admin-metric-card">
          <div>
            <div className="admin-metric-label">Ümumi Gəlir</div>
            <div className="admin-metric-value">{stats.totalRevenue.toLocaleString()} ₼</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-sub)', marginTop: '4px' }}>
              Ödənilmiş təsdiqlənmiş sifarişlər
            </div>
          </div>
          <div className="admin-metric-icon">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Kart 3: Gözləyən Rəylər (Qızılı rəngdə vurğulanır, klikdə /admin/reviews-ə keçir) */}
        <Link href="/admin/reviews" style={{ textDecoration: 'none' }}>
          <div
            className="admin-metric-card"
            style={{
              borderColor: 'var(--admin-warning)',
              backgroundColor: 'var(--admin-warning-bg)',
              cursor: 'pointer',
            }}
          >
            <div>
              <div className="admin-metric-label" style={{ color: '#8A6822', fontWeight: '600' }}>Gözləyən Rəylər</div>
              <div className="admin-metric-value" style={{ color: 'var(--admin-warning)' }}>{stats.pendingReviewsCount}</div>
              <div style={{ fontSize: '0.8rem', color: '#8A6822', marginTop: '4px', fontWeight: '500' }}>
                Moderasiya tələb olunur →
              </div>
            </div>
            <div className="admin-metric-icon" style={{ backgroundColor: '#FFF5E5', color: 'var(--admin-warning)' }}>
              <MessageSquare size={24} />
            </div>
          </div>
        </Link>

        {/* Kart 4: Aktiv Məhsullar */}
        <div className="admin-metric-card">
          <div>
            <div className="admin-metric-label">Aktiv Məhsullar</div>
            <div className="admin-metric-value">{stats.activeProductsCount}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-sub)', marginTop: '4px' }}>
              Kataloqda satışda olan
            </div>
          </div>
          <div className="admin-metric-icon">
            <Package size={24} />
          </div>
        </div>
      </div>

      {/* 2. SİFARİŞLƏR QRAFİKİ (Son 30 günün vizual göstəricisi) */}
      <div
        style={{
          backgroundColor: 'var(--admin-card-bg)',
          borderRadius: 'var(--admin-radius)',
          border: '1px solid var(--admin-border)',
          padding: '24px',
          boxShadow: 'var(--admin-shadow)',
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Son 30 Günün Sifariş Qrafiki</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--admin-text-sub)' }}>İyul 2026</span>
        </div>

        {/* CSS Chart Bar Simulyasiyası */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '160px', paddingTop: '20px', borderBottom: '1px solid var(--admin-border)' }}>
          {[40, 65, 30, 85, 95, 60, 75, 90, 100, 70, 80, 110, 130, 90, 85].map((val, idx) => (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div
                style={{
                  width: '100%',
                  height: `${val}%`,
                  backgroundColor: idx === 12 ? 'var(--admin-accent-gold)' : 'var(--admin-accent)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 500ms ease',
                }}
                title={`Gün ${idx + 1}: ${val} Sifariş`}
              ></div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. CƏDVƏL & WIDGET GRID (Son Sifarişlər + Gözləyən Rəylər) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '32px' }}>
        {/* Son Sifarişlər Cədvəli (8 Sütun) */}
        <div style={{ gridColumn: 'span 8' }} className="admin-table-container">
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Son Sifarişlər</h2>
            <Link href="/admin/orders" style={{ fontSize: '0.88rem', color: 'var(--admin-accent)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Hamısına Bax <ArrowRight size={16} />
            </Link>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Sifariş ID</th>
                <th>Müştəri</th>
                <th>Məbləğ</th>
                <th>Status</th>
                <th>Tarix</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_RECENT_ORDERS.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: '600' }}>{order.id}</td>
                  <td>{order.customer}</td>
                  <td style={{ fontWeight: '600', color: 'var(--admin-accent)' }}>{order.amount}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        order.status === 'confirmed' || order.status === 'delivered'
                          ? 'status-success'
                          : order.status === 'pending'
                          ? 'status-warning'
                          : 'status-danger'
                      }`}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.88rem', color: 'var(--admin-text-sub)' }}>{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Gözləyən Rəylər Widget (4 Sütun) */}
        <div style={{ gridColumn: 'span 4', backgroundColor: 'var(--admin-card-bg)', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', padding: '20px 24px', boxShadow: 'var(--admin-shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Gözləyən Rəylər</h2>
            <Link href="/admin/reviews" style={{ fontSize: '0.85rem', color: 'var(--admin-accent)', fontWeight: '600' }}>
              Hamısına Bax
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {MOCK_PENDING_REVIEWS.map((rev) => (
              <div key={rev.id} style={{ backgroundColor: 'var(--admin-bg)', padding: '14px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '0.88rem' }}>{rev.user}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-sub)' }}>{rev.date}</span>
                </div>
                <div style={{ display: 'flex', color: 'var(--admin-warning)', marginBottom: '6px' }}>
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={12} fill="var(--admin-warning)" />
                  ))}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-sub)', fontStyle: 'italic' }}>
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
