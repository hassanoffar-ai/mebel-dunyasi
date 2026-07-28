'use client';

import React from 'react';
import { Package, ShoppingCart, MessageSquare, DollarSign, Eye, Edit, Trash2 } from 'lucide-react';

const RECENT_ORDERS = [
  { id: 'MD-584912', customer: 'Anar Məmmədov', amount: '2,430 ₼', status: 'Təsdiqləndi', date: '28 İyul 2026' },
  { id: 'MD-391204', customer: 'Leyla Həsənova', amount: '980 ₼', status: 'Gözləmədə', date: '28 İyul 2026' },
  { id: 'MD-109283', customer: 'Vüsal Qasımov', amount: '1,450 ₼', status: 'Rədd edildi', date: '27 İyul 2026' },
];

export default function AdminDashboardPage() {
  return (
    <div>
      {/* 4 Əsas Statistika Kartı */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div>
            <div className="admin-metric-label">Ümumi Gəlir</div>
            <div className="admin-metric-value">48,250 ₼</div>
          </div>
          <div className="admin-metric-icon">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="admin-metric-card">
          <div>
            <div className="admin-metric-label">Ümumi Sifarişlər</div>
            <div className="admin-metric-value">142</div>
          </div>
          <div className="admin-metric-icon">
            <ShoppingCart size={24} />
          </div>
        </div>

        <div className="admin-metric-card">
          <div>
            <div className="admin-metric-label">Aktiv Məhsullar</div>
            <div className="admin-metric-value">86</div>
          </div>
          <div className="admin-metric-icon">
            <Package size={24} />
          </div>
        </div>

        <div className="admin-metric-card">
          <div>
            <div className="admin-metric-label">Gözləyən Rəylər</div>
            <div className="admin-metric-value">5</div>
          </div>
          <div className="admin-metric-icon">
            <MessageSquare size={24} />
          </div>
        </div>
      </div>

      {/* Son Sifarişlər Cədvəli */}
      <div className="admin-table-container">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Son Sifarişlər</h2>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Sifariş ID</th>
              <th>Müştəri Adı</th>
              <th>Məbləğ</th>
              <th>Status</th>
              <th>Tarix</th>
              <th style={{ textAlign: 'right' }}>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {RECENT_ORDERS.map((order) => (
              <tr key={order.id}>
                <td style={{ fontWeight: '600' }}>{order.id}</td>
                <td>{order.customer}</td>
                <td style={{ fontWeight: '600', color: 'var(--admin-accent)' }}>{order.amount}</td>
                <td>
                  <span
                    className={`status-badge ${
                      order.status === 'Təsdiqləndi'
                        ? 'status-success'
                        : order.status === 'Gözləmədə'
                        ? 'status-warning'
                        : 'status-danger'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td>{order.date}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="admin-action-btn" title="Bax"><Eye size={16} /></button>
                  <button className="admin-action-btn" title="Redaktə et"><Edit size={16} /></button>
                  <button className="admin-action-btn delete" title="Sil"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
