'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Eye, Search, Filter, X, CheckCircle2, Clock, Truck, XCircle, Save, FileText, ShoppingBag } from 'lucide-react';
import '@/app/admin/admin.css';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  items_count: number;
  total_amount: number;
  status: OrderStatus;
  date: string;
  notes?: string;
  products: { name: string; quantity: number; price: number; image_url: string }[];
}



export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setStatusFilter(params.get('status') === 'pending' ? 'pending' : '');
  }, []);

  const STATUS_LABELS: Record<OrderStatus, string> = {
    pending: 'Gözləmədə (Pending)',
    confirmed: 'Təsdiqləndi (Confirmed)',
    processing: 'Hazırlanır (Processing)',
    shipped: 'Göndərildi (Shipped)',
    delivered: 'Çatdırıldı (Delivered)',
    cancelled: 'Ləğv edildi (Cancelled)',
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
      case 'confirmed':
        return 'status-success';
      case 'cancelled':
        return 'status-danger';
      default:
        return 'status-warning';
    }
  };

  // Fetch Orders from Supabase sorted by date DESC
  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      setErrorMsg('');
      try {
        const response = await fetch('/api/admin/orders', { cache: 'no-store' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Sifarişlər yüklənə bilmədi.');
        const data = result.data;

        if (data) {
          const mappedData: OrderItem[] = data.map((item: any) => {
            const mappedProducts = (item.order_items || []).map((oi: any) => ({
              name: oi.products?.ad || oi.products?.name || 'Mebel Məhsulu',
              quantity: oi.say || oi.quantity || 1,
              price: oi.vahid_qiymet || oi.price || 0,
              image_url: oi.products?.product_images?.find((image: any) => image.esas_sekil)?.sekil_url || oi.products?.product_images?.[0]?.sekil_url || oi.products?.sekil_url || oi.products?.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
            }));

            const finalProducts = mappedProducts.length > 0 ? mappedProducts : (item.products || [
              { name: 'Sifariş edilmiş mebel məhsulu', quantity: 1, price: item.umumi_meblegh || 0, image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80' }
            ]);

            return {
              id: item.id,
              order_id: item.id,
              customer: item.customer || item.full_name || (item.user_id ? `İstifadəçi #${item.user_id.slice(0, 6)}` : 'Qonaq Müştəri'),
              email: item.email || 'Məlumatsız',
              phone: item.telefon || item.phone || '+994 50 000 00 00',
              address: item.catdirilma_unvani || item.address || 'Ünvan qeyd edilməyib',
              items_count: finalProducts.reduce((acc: number, p: any) => acc + p.quantity, 0),
              total_amount: item.umumi_meblegh || item.total_amount || 0,
              status: (item.status as OrderStatus) || 'pending',
              date: item.created_at ? new Date(item.created_at).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Bu gün',
              notes: item.notes,
              products: finalProducts,
            };
          });
          setOrders(mappedData);
        }
      } catch (err: any) {
        console.log('Database read error:', err);
        setOrders([]);
        setErrorMsg(err.message || 'Sifarişlər yüklənə bilmədi.');
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  // Filter & Sort Orders (Date descending)
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.customer || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const handleOpenDetailModal = (order: OrderItem) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setAdminNotes(order.notes || '');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setOrders((prev) =>
      prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: newStatus, notes: adminNotes } : o))
    );

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedOrder.id, status: newStatus, notes: adminNotes }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Sifariş yenilənə bilmədi.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Sifariş yenilənə bilmədi.');
    }

    setSelectedOrder(null);
  };

  return (
    <div>
      {/* Üst Bar */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '600' }}>Sifarişlər</h2>
        <p style={{ color: 'var(--admin-text-sub)', fontSize: '0.9rem' }}>Müştəri sifarişlərini və çatdırılma statuslarını idarə edin</p>
      </div>

      {/* Filtr Paneli */}
      <div style={{ backgroundColor: 'var(--admin-card-bg)', padding: '20px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Müştəri adı və ya Sifariş № üzrə axtar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', fontSize: '0.9rem', outline: 'none' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-sub)' }} />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', fontSize: '0.9rem', outline: 'none', backgroundColor: 'white' }}
        >
          <option value="">Bütün Statuslar</option>
          <option value="pending">Gözləmədə (pending)</option>
          <option value="confirmed">Təsdiqləndi (confirmed)</option>
          <option value="processing">Hazırlanır (processing)</option>
          <option value="shipped">Göndərildi (shipped)</option>
          <option value="delivered">Çatdırıldı (delivered)</option>
          <option value="cancelled">Ləğv edildi (cancelled)</option>
        </select>
      </div>

      {/* Sifarişlər Cədvəli / Vəziyyət Mesajları */}
      {loading ? (
        <div style={{ backgroundColor: 'white', padding: '60px', borderRadius: 'var(--admin-radius)', textAlign: 'center', color: 'var(--admin-text-sub)' }}>
          <Clock size={32} className="animate-spin" style={{ margin: '0 auto 12px auto', color: 'var(--admin-accent)' }} />
          <div>Sifarişlər yüklənir...</div>
        </div>
      ) : errorMsg ? (
        <div style={{ backgroundColor: '#FDE8E8', color: '#E53E3E', padding: '20px', borderRadius: 'var(--admin-radius)', textAlign: 'center', marginBottom: '24px' }}>
          {errorMsg}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '60px', borderRadius: 'var(--admin-radius)', textAlign: 'center', color: 'var(--admin-text-sub)', border: '1px solid var(--admin-border)' }}>
          <ShoppingBag size={40} style={{ margin: '0 auto 12px auto', color: 'var(--admin-text-sub)' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '4px', color: 'var(--admin-text-main)' }}>Sifariş Tapılmadı</h3>
          <p style={{ fontSize: '0.9rem' }}>Axtarış kriteriyalarınıza uyğun heç bir sifariş mövcud deyil.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sifariş №</th>
                <th>Müştəri Adı</th>
                <th>Tarix</th>
                <th>Məhsul Sayı</th>
                <th>Ümumi Məbləğ</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: '600' }}>{order.id}</td>
                  <td>{order.customer}</td>
                  <td style={{ fontSize: '0.88rem', color: 'var(--admin-text-sub)' }}>{order.date}</td>
                  <td>{order.items_count} məhsul</td>
                  <td style={{ fontWeight: '700', color: 'var(--admin-accent)' }}>{order.total_amount} ₼</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="admin-action-btn" onClick={() => handleOpenDetailModal(order)} title="Sifariş Detalları"><Eye size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SİFARİŞ DETAL & STATUS DƏYİŞDİRMƏ MODALI */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: 'var(--admin-radius)', maxWidth: '650px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '600' }}>Sifariş № {selectedOrder.id}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--admin-text-sub)' }}>Tarix: {selectedOrder.date}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Müştəri Məlumatları */}
            <div style={{ backgroundColor: 'var(--admin-bg)', padding: '16px', borderRadius: 'var(--admin-radius)', marginBottom: '24px', fontSize: '0.9rem' }}>
              <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Müştəri & Çatdırılma Məlumatları</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: 'var(--admin-text-sub)' }}>
                <div><strong>Ad:</strong> {selectedOrder.customer}</div>
                <div><strong>Tel:</strong> {selectedOrder.phone}</div>
                <div><strong>Email:</strong> {selectedOrder.email}</div>
                <div style={{ gridColumn: 'span 2' }}><strong>Ünvan:</strong> {selectedOrder.address}</div>
              </div>
            </div>

            {/* Məhsullar Siyahısı */}
            <h4 style={{ fontWeight: '600', marginBottom: '12px' }}>Sifariş Edilən Məhsullar</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {selectedOrder.products.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '10px' }}>
                  <img src={item.image_url} alt={item.name} style={{ width: '48px', height: '48px', borderRadius: 'var(--admin-radius)', objectFit: 'cover' }} />
                  <div style={{ flexGrow: 1 }}>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: '600' }}>{item.name}</h5>
                    <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-sub)' }}>Say: {item.quantity} × {item.price} ₼</span>
                  </div>
                  <strong style={{ color: 'var(--admin-accent)' }}>{item.quantity * item.price} ₼</strong>
                </div>
              ))}
            </div>

            {/* Status Update Form */}
            <form onSubmit={handleUpdateStatus}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Statusu Dəyişdir</label>
                <select
                  value={newStatus}
                  onChange={(e: any) => setNewStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', backgroundColor: 'white' }}
                >
                  <option value="pending">Gözləmədə (pending)</option>
                  <option value="confirmed">Təsdiqləndi (confirmed)</option>
                  <option value="processing">Hazırlanır (processing)</option>
                  <option value="shipped">Göndərildi (shipped)</option>
                  <option value="delivered">Çatdırıldı (delivered)</option>
                  <option value="cancelled">Ləğv edildi (cancelled)</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Daxili Admin Qeydləri</label>
                <textarea
                  rows={3}
                  placeholder="Kuryer, çatdırılma və ya xüsusi qeydlər..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setSelectedOrder(null)}>Bağla</button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> Statusu Yadda Saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
