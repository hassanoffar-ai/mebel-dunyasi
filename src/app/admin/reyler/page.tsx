'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Check, X, Star, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import '@/app/admin/admin.css';

interface ReviewItem {
  id: string;
  user_name: string;
  user_email: string;
  product_name: string;
  product_image: string;
  rating: number;
  comment: string;
  status: 'gozlemede' | 'tesdiqlendi' | 'reddedildi';
  date: string;
  rejection_reason?: string;
}

const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: '1',
    user_name: 'Əli Həsənov',
    user_email: 'ali@example.com',
    product_name: 'Minimalist Velvet Divan',
    product_image: 'C:\\Users\\User\\.gemini\\antigravity\\brain\\60ddce65-7740-47cc-a2af-78899d3729b9\\sofa_product_1785206074780.jpg',
    rating: 5,
    comment: 'Çox keyfiyyətli divandır, materialı yumşaqdır və çatdırılma vaxtında oldu. Təşəkkürlər!',
    status: 'gozlemede',
    date: '28 İyul 2026',
  },
  {
    id: '2',
    user_name: 'Günel Quliyeva',
    user_email: 'gunel@example.com',
    product_name: 'Təbii Palıd Yemək Masası',
    product_image: 'C:\\Users\\User\\.gemini\\antigravity\\brain\\60ddce65-7740-47cc-a2af-78899d3729b9\\table_product_1785206085165.jpg',
    rating: 4,
    comment: 'Palıd masa çox zərifdir, evimizə xüsusi abu-hava verdi. Amma quraşdırılması bir az vaxt aldı.',
    status: 'gozlemede',
    date: '27 İyul 2026',
  },
  {
    id: '3',
    user_name: 'Rəşad Nəsirov',
    user_email: 'resad@example.com',
    product_name: 'Lüks Ketan Çarpayı Dəsti',
    product_image: 'C:\\Users\\User\\.gemini\\antigravity\\brain\\60ddce65-7740-47cc-a2af-78899d3729b9\\bed_product_1785206094275.jpg',
    rating: 5,
    comment: 'Mükəmməl sənətkarlıq işidir! Ketan örtük çox rahatdır.',
    status: 'tesdiqlendi',
    date: '26 İyul 2026',
  },
  {
    id: '4',
    user_name: 'Vüsal Qasımov',
    user_email: 'vusal@example.com',
    product_name: 'Qəhvəyi Dəri Aksent Kreslo',
    product_image: 'C:\\Users\\User\\.gemini\\antigravity\\brain\\60ddce65-7740-47cc-a2af-78899d3729b9\\armchair_product_1785206104309.jpg',
    rating: 1,
    comment: 'Gözlədiyim kimi olmadı, çatdırılma gecikdi.',
    status: 'reddedildi',
    date: '25 İyul 2026',
    rejection_reason: 'Qeyri-etik və əsassız ifadələr',
  },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>(MOCK_REVIEWS);
  const [activeTab, setActiveTab] = useState<'gozlemede' | 'tesdiqlendi' | 'reddedildi'>('gozlemede');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');

  // Supabase Fetch
  useEffect(() => {
    async function loadReviews() {
      try {
        const { data, error } = await supabase.from('reviews').select('*');
        if (data && data.length > 0 && !error) {
          setReviews(data as any);
        }
      } catch (err) {
        console.log('Using mock reviews data');
      }
    }
    loadReviews();
  }, []);

  const pendingCount = reviews.filter((r) => r.status === 'gozlemede').length;
  const approvedCount = reviews.filter((r) => r.status === 'tesdiqlendi').length;
  const rejectedCount = reviews.filter((r) => r.status === 'reddedildi').length;

  const filteredReviews = reviews.filter((r) => r.status === activeTab);

  // Approve review
  const handleApprove = async (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'tesdiqlendi' } : r))
    );

    try {
      await supabase.from('reviews').update({ status: 'tesdiqlendi' }).eq('id', id);
    } catch (err) {}
  };

  // Reject review
  const handleRejectSubmit = async (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'reddedildi', rejection_reason: rejectReasonInput } : r))
    );

    try {
      await supabase.from('reviews').update({ status: 'reddedildi', rejection_reason: rejectReasonInput }).eq('id', id);
    } catch (err) {}

    setRejectingId(null);
    setRejectReasonInput('');
  };

  return (
    <div>
      {/* Üst Bar */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '600' }}>Rəylərin Moderasiyası</h2>
        <p style={{ color: 'var(--admin-text-sub)', fontSize: '0.9rem' }}>Müştərilərin yazdığı rəyləri yoxlayın və dərc edin</p>
      </div>

      {/* TAB-lar (Gözləmədə, Təsdiqlənmiş, Rədd Edilmiş) */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--admin-border)', marginBottom: '28px' }}>
        <button
          onClick={() => setActiveTab('gozlemede')}
          style={{
            padding: '12px 20px',
            fontSize: '0.95rem',
            fontWeight: '600',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: activeTab === 'gozlemede' ? 'var(--admin-accent)' : 'var(--admin-text-sub)',
            borderBottom: activeTab === 'gozlemede' ? '2.5px solid var(--admin-accent-gold)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          Gözləmədə
          {pendingCount > 0 && (
            <span style={{ backgroundColor: 'var(--admin-warning)', color: 'white', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '999px' }}>
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('tesdiqlendi')}
          style={{
            padding: '12px 20px',
            fontSize: '0.95rem',
            fontWeight: '600',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: activeTab === 'tesdiqlendi' ? 'var(--admin-accent)' : 'var(--admin-text-sub)',
            borderBottom: activeTab === 'tesdiqlendi' ? '2.5px solid var(--admin-accent-gold)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          Təsdiqlənmiş ({approvedCount})
        </button>

        <button
          onClick={() => setActiveTab('reddedildi')}
          style={{
            padding: '12px 20px',
            fontSize: '0.95rem',
            fontWeight: '600',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: activeTab === 'reddedildi' ? 'var(--admin-accent)' : 'var(--admin-text-sub)',
            borderBottom: activeTab === 'reddedildi' ? '2.5px solid var(--admin-accent-gold)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          Rədd Edilmiş ({rejectedCount})
        </button>
      </div>

      {/* RƏYLƏR SİYAHISI (KART FORMATINDA) */}
      {filteredReviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)' }}>
          <MessageSquare size={36} color="var(--admin-text-sub)" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Bu bölmədə rəy yoxdur</h3>
          <p style={{ color: 'var(--admin-text-sub)', fontSize: '0.9rem' }}>Aktiv filterə uyğun rəy tapılmadı.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              style={{
                backgroundColor: 'white',
                borderRadius: 'var(--admin-radius)',
                border: '1px solid var(--admin-border)',
                padding: '24px',
                boxShadow: 'var(--admin-shadow)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                {/* Müştəri Məlumatı */}
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '2px' }}>{rev.user_name}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--admin-text-sub)' }}>{rev.user_email} • {rev.date}</span>
                </div>

                {/* Aid Olduğu Məhsul */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--admin-bg)', padding: '6px 12px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)' }}>
                  <img src={rev.product_image} alt={rev.product_name} style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{rev.product_name}</span>
                </div>
              </div>

              {/* Ulduz Reytinqi */}
              <div style={{ display: 'flex', color: 'var(--admin-warning)', marginBottom: '12px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < rev.rating ? 'var(--admin-warning)' : 'none'} color="var(--admin-warning)" />
                ))}
              </div>

              {/* Rəy Mətni */}
              <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--admin-text-main)', marginBottom: '16px' }}>
                "{rev.comment}"
              </p>

              {/* Rədd edilmə səbəbi varsa */}
              {rev.rejection_reason && (
                <div style={{ fontSize: '0.85rem', color: 'var(--admin-danger)', backgroundColor: 'var(--admin-danger-bg)', padding: '8px 12px', borderRadius: '4px', marginBottom: '16px' }}>
                  <strong>Rədd səbəbi:</strong> {rev.rejection_reason}
                </div>
              )}

              {/* Gözləmədə Tab-ında Əməliyyat Düymələri */}
              {rev.status === 'gozlemede' && (
                <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '16px' }}>
                  {rejectingId === rev.id ? (
                    /* Rədd Etmə Səbəbi Sahəsi */
                    <div style={{ backgroundColor: 'var(--admin-bg)', padding: '16px', borderRadius: 'var(--admin-radius)' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Rədd Etmə Səbəbi (Opsional)</label>
                      <input
                        type="text"
                        placeholder="Məs: Qeyri-etik ifadə..."
                        value={rejectReasonInput}
                        onChange={(e) => setRejectReasonInput(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', marginBottom: '12px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button class="btn btn-outline" onClick={() => setRejectingId(null)}>Ləğv Et</button>
                        <button class="btn" style={{ backgroundColor: 'var(--admin-danger)', color: 'white' }} onClick={() => handleRejectSubmit(rev.id)}>
                          Rədd Etməni Təsdiqlə
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Təsdiqlə / Rədd Et Düymələri */
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        class="btn"
                        style={{ backgroundColor: 'var(--admin-success)', color: 'white', padding: '10px 20px', fontSize: '0.88rem' }}
                        onClick={() => handleApprove(rev.id)}
                      >
                        <Check size={16} /> Təsdiqlə (Saytda Dərc Et)
                      </button>
                      <button
                        class="btn"
                        style={{ backgroundColor: 'var(--admin-danger)', color: 'white', padding: '10px 20px', fontSize: '0.88rem' }}
                        onClick={() => setRejectingId(rev.id)}
                      >
                        <X size={16} /> Rədd Et
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
