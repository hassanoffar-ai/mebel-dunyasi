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

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [activeTab, setActiveTab] = useState<'gozlemede' | 'tesdiqlendi' | 'reddedildi'>('gozlemede');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');

  // Supabase Fetch
  useEffect(() => {
    async function loadReviews() {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*, products(ad, name, sekil_url, image_url, product_images(sekil_url))')
          .order('created_at', { ascending: false });

        if (data && !error) {
          const mapped: ReviewItem[] = data.map((rev: any) => {
            const p = rev.products;
            const pName = p?.ad || p?.name || 'Məhsul';
            const pImg = p?.product_images?.[0]?.sekil_url || p?.sekil_url || p?.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80';

            return {
              id: rev.id,
              user_name: rev.user_name || rev.ad_soyad || (rev.user_id ? `İstifadəçi #${rev.user_id.slice(0, 5)}` : 'Qonaq Müştəri'),
              user_email: rev.user_email || rev.email || 'Məlumatsız',
              product_name: pName,
              product_image: pImg,
              rating: rev.ulduz || rev.rating || 5,
              comment: rev.metn || rev.comment || '',
              status: rev.status === 'pending' ? 'gozlemede' : rev.status || 'gozlemede',
              date: rev.created_at ? new Date(rev.created_at).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Bu gün',
              rejection_reason: rev.rejection_reason || rev.red_sebebi,
            };
          });
          setReviews(mapped);
        }
      } catch (err) {
        console.log('Error loading reviews from DB');
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
                        <button className="btn btn-outline" onClick={() => setRejectingId(null)}>Ləğv Et</button>
                        <button className="btn" style={{ backgroundColor: 'var(--admin-danger)', color: 'white' }} onClick={() => handleRejectSubmit(rev.id)}>
                          Rədd Etməni Təsdiqlə
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Təsdiqlə / Rədd Et Düymələri */
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        className="btn"
                        style={{ backgroundColor: 'var(--admin-success)', color: 'white', padding: '10px 20px', fontSize: '0.88rem' }}
                        onClick={() => handleApprove(rev.id)}
                      >
                        <Check size={16} /> Təsdiqlə (Saytda Dərc Et)
                      </button>
                      <button
                        className="btn"
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
