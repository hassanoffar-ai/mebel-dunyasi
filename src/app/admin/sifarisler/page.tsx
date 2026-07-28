'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Eye, Search, Filter, X, CheckCircle2, Clock, Truck, XCircle, Save, FileText } from 'lucide-react';
import '@/app/admin/admin.css';

interface OrderItem {
  id: string;
  order_id: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  items_count: number;
  total_amount: number;
  status: 'Yeni' | 'Hazırlanır' | 'Göndərildi' | 'Çatdırıldı' | 'Ləğv edildi';
  date: string;
  notes?: string;
  products: { name: string; quantity: number; price: number; image_url: string }[];
}

const MOCK_ORDERS: OrderItem[] = [
  {
    id: 'MD-584912',
    order_id: 'MD-584912',
    customer: 'Anar Məmmədov',
    email: 'anar@example.com',
    phone: '+994 50 123 45 67',
    address: 'Bakı şəh., Həsən Əliyev küç. 45, mənzil 12',
    items_count: 2,
    total_amount: 2430,
    status: 'Yeni',
    date: '28 İyul 2026',
    notes: 'Kuryer gəlməzdən 1 saat əvvəl zəng etsin.',
    products: [
      { name: 'Minimalist Velvet Divan', quantity: 1, price: 1450, image_url: 'C:\\Users\\User\\.gemini\\antigravity\\brain\\60ddce65-7740-47cc-a2af-78899d3729b9\\sofa_product_1785206074780.jpg' },
      { name: 'Təbii Palıd Yemək Masası', quantity: 1, price: 980, image_url: 'C:\\Users\\User\\.gemini\\antigravity\\brain\\60ddce65-7740-47cc-a2af-78899d3729b9\\table_product_1785206085165.jpg' },
    ],
  },
  {
    id: 'MD-391204',
    order_id: 'MD-391204',
    customer: 'Leyla Həsənova',
    email: 'leyla@example.com',
    phone: '+994 55 987 65 43',
    address: 'Sumqayıt şəh., 4-cü mkr. ev 12',
    items_count: 1,
    total_amount: 980,
    status: 'Hazırlanır',
    date: '28 İyul 2026',
    products: [
      { name: 'Təbii Palıd Yemək Masası', quantity: 1, price: 980, image_url: 'C:\\Users\\User\\.gemini\\antigravity\\brain\\60ddce65-7740-47cc-a2af-78899d3729b9\\table_product_1785206085165.jpg' },
    ],
  },
  {
    id: 'MD-901244',
    order_id: 'MD-901244',
    customer: 'Nərgiz Əliyeva',
    email: 'nergiz@example.com',
    phone: '+994 70 555 44 33',
    address: 'Bakı şəh., Nizami küç. 102',
    items_count: 1,
    total_amount: 2100,
    status: 'Göndərildi',
    date: '26 İyul 2026',
    products: [
      { name: 'Lüks Ketan Çarpayı Dəsti', quantity: 1, price: 2100, image_url: 'C:\\Users\\User\\.gemini\\antigravity\\brain\\60ddce65-7740-47cc-a2af-78899d3729b9\\bed_product_1785206094275.jpg' },
    ],
  },
  {
    id: 'MD-109283',
    order_id: 'MD-109283',
    customer: 'Vüsal Qasımov',
    email: 'vusal@example.com',
    phone: '+994 50 444 33 22',
    address: 'Gəncə şəh., Atatürk pr. 15',
    items_count: 1,
    total_amount: 1450,
    status: 'Çatdırıldı',
    date: '25 İyul 2026',
    products: [
      { name: 'Minimalist Velvet Divan', quantity: 1, price: 1450, image_url: 'C:\\Users\\User\\.gemini\\antigravity\\brain\\60ddce65-7740-47cc-a2af-78899d3729b9\\sofa_product_1785206074780.jpg' },
    ],
  },
  {
    id: 'MD-748392',
    order_id: 'MD-748392',
    customer: 'Elvin Qasımov',
    email: 'elvin@example.com',
    phone: '+994 51 222 11 00',
    address: 'Bakı şəh., Məti mütbuat pr. 8',
    items_count: 1,
    total_amount: 750,
    status: 'Ləğv edildi',
    date: '24 İyul 2026',
    products: [
      { name: 'Qəhvəyi Dəri Aksent Kreslo', quantity: 1, price: 750, image_url: 'C:\\Users\\User\\.gemini\\antigravity\\brain\\60ddce65-7740-47cc-a2af-78899d3729b9\\armchair_product_1785206104309.jpg' },
    ],
  },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>(MOCK_ORDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  // Detail Modal Form States
  const [newStatus, setNewStatus] = useState<'Yeni' | 'Hazırlanır' | 'Göndərildi' | 'Çatdırıldı' | 'Ləğv edildi'>('Yeni');
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch Orders from Supabase
  useEffect(() => {
    async function loadOrders() {
      try {
        const { data, error } = await supabase.from('orders').select('*');
        if (data && data.length > 0 && !error) {
          setOrders(data as any);
        }
      } catch (err) {
        console.log('Using mock orders list');
      }
    }
    loadOrders();
  }, []);

  // Filter Orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.customer.toLowerCase().includes(searchQuery.toLowerCase()) || order.id.toLowerCase().includes(searchQuery.toLowerCase());
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
      await supabase.from('orders').update({ status: newStatus, notes: adminNotes }).eq('id', selectedOrder.id);
    } catch (err) {}

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
          <option value="Yeni">Yeni</option>
          <option value="Hazırlanır">Hazırlanır</option>
          <option value="Göndərildi">Göndərildi</option>
          <option value="Çatdırıldı">Çatdırıldı</option>
          <option value="Ləğv edildi">Ləğv edildi</option>
        </select>
      </div>

      {/* Sifarişlər Cədvəli */}
      <div class="admin-table-container">
        <table class="admin-table">
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
                  <span
                    className={`status-badge ${
                      order.status === 'Çatdırıldı'
                        ? 'status-success'
                        : order.status === 'Ləğv edildi'
                        ? 'status-danger'
                        : 'status-warning'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button class="admin-action-btn" onClick={() => handleOpenDetailModal(order)} title="Sifariş Detalları"><Eye size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                  <option value="Yeni">Yeni</option>
                  <option value="Hazırlanır">Hazırlanır</option>
                  <option value="Göndərildi">Göndərildi</option>
                  <option value="Çatdırıldı">Çatdırıldı</option>
                  <option value="Ləğv edildi">Ləğv edildi</option>
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
                <button type="button" class="btn btn-outline" onClick={() => setSelectedOrder(null)}>Bağla</button>
                <button type="submit" class="btn btn-primary">
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
