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
    totalOrders: 0,
    totalRevenue: 0,
    pendingReviewsCount: 0,
    activeProductsCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);

  // Supabase dynamic stats calculation from real backend database
  useEffect(() => {
    async function loadStats() {
      try {
        const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
        const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
        const { count: pendingRevCount } = await supabase.from('reviews').select('*', { count: 'exact', head: true }).or('status.eq.gozlemede,status.eq.pending');
        
        const { data: revenueData } = await supabase.from('orders').select('umumi_meblegh');
        const totalRevenue = (revenueData || []).reduce((acc: number, item: any) => acc + (item.umumi_meblegh || 0), 0);

        setStats({
          totalOrders: ordersCount || 0,
          activeProductsCount: productsCount || 0,
          pendingReviewsCount: pendingRevCount || 0,
          totalRevenue: totalRevenue || 0,
        });

        // Load recent orders
        const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5);
        if (ordersData) {
          const mappedOrders = ordersData.map((order: any) => ({
            id: order.id,
            musteri_ad: order.customer || order.full_name || (order.user_id ? `İstifadəçi #${order.user_id.slice(0, 6)}` : 'Qonaq Müştəri'),
            umumi_meblegh: order.umumi_meblegh || order.total_amount || 0,
            status: order.status || 'pending',
            created_at: order.created_at,
          }));
          setRecentOrders(mappedOrders);
        }

        // Load pending reviews
        const { data: reviewsData } = await supabase.from('reviews').select('*').or('status.eq.gozlemede,status.eq.pending').limit(5);
        if (reviewsData) {
          const mappedReviews = reviewsData.map((rev: any) => ({
            id: rev.id,
            user_name: rev.user_name || rev.ad_soyad || 'İstifadəçi',
            rating: rev.ulduz || rev.rating || 5,
            comment: rev.metn || rev.comment || '',
            date: rev.created_at ? new Date(rev.created_at).toLocaleDateString('az-AZ') : 'Bu gün',
          }));
          setPendingReviews(mappedReviews);
        }

      } catch (err) {
        console.log('Database metrics fetch error:', err);
      }
    }
    loadStats();
  }, []);

  return (
    <div>
      {/* 1. 4 STATİSTİKA KARTI */}
      <div className="admin-metrics-grid">
        {/* Kart 1: Ümumi Sifarişlər */}
        <div className="admin-metric-card">
          <div>
            <div className="admin-metric-label">Ümumi Sifarişlər</div>
            <div className="admin-metric-value">{stats.totalOrders}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-sub)', marginTop: '4px' }}>
              Real verilənlər bazasından
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
              Ödənilmiş sifarişlər
            </div>
          </div>
          <div className="admin-metric-icon">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Kart 3: Gözləyən Rəylər */}
        <Link href="/admin/reyler" style={{ textDecoration: 'none' }}>
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

      {/* 2. CƏDVƏL & WIDGET GRID (Son Sifarişlər + Gözləyən Rəylər) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '32px', marginTop: '32px' }}>
        {/* Son Sifarişlər Cədvəli (8 Sütun) */}
        <div style={{ gridColumn: 'span 8' }} className="admin-table-container">
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Son Sifarişlər</h2>
            <Link href="/admin/sifarisler" style={{ fontSize: '0.88rem', color: 'var(--admin-accent)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Hamısına Bax <ArrowRight size={16} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--admin-text-sub)', fontSize: '0.9rem' }}>
              Hələ ki heç bir yeni sifariş daxil olmayıb.
            </div>
          ) : (
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
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: '600' }}>{order.id.toString().substring(0, 8)}</td>
                    <td>{order.musteri_ad || order.customer_name || 'Müştəri'}</td>
                    <td style={{ fontWeight: '600', color: 'var(--admin-accent)' }}>{order.umumi_meblegh || order.total_amount || 0} ₼</td>
                    <td>
                      <span className="status-badge status-warning">
                        {STATUS_LABELS[order.status] || order.status || 'yeni'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.88rem', color: 'var(--admin-text-sub)' }}>
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('az-AZ') : 'Bu gün'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Gözləyən Rəylər Widget (4 Sütun) */}
        <div style={{ gridColumn: 'span 4', backgroundColor: 'var(--admin-card-bg)', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', padding: '20px 24px', boxShadow: 'var(--admin-shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Gözləyən Rəylər</h2>
            <Link href="/admin/reyler" style={{ fontSize: '0.85rem', color: 'var(--admin-accent)', fontWeight: '600' }}>
              Hamısına Bax
            </Link>
          </div>

          {pendingReviews.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--admin-text-sub)', fontSize: '0.88rem' }}>
              Gözləmədə olan rəy yoxdur.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pendingReviews.map((rev) => (
                <div key={rev.id} style={{ backgroundColor: 'var(--admin-bg)', padding: '14px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '0.88rem' }}>{rev.user_name || 'İstifadəçi'}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-sub)' }}>{rev.date || 'Bu gün'}</span>
                  </div>
                  <div style={{ display: 'flex', color: 'var(--admin-warning)', marginBottom: '6px' }}>
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} size={12} fill="var(--admin-warning)" />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-sub)', fontStyle: 'italic' }}>
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
