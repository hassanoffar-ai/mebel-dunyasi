'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, CheckCircle2, XCircle, Star, Quote, Search, X, Save, AlertCircle } from 'lucide-react';
import '@/app/admin/admin.css';

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  avatar_url: string;
  comment: string;
  rating: number;
  is_active: boolean;
  created_at?: string;
}



export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TestimonialItem | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [isActive, setIsActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Testimonials from Backend / Supabase
  const loadTestimonials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
      if (data && !error) {
        setTestimonials(data as TestimonialItem[]);
      } else {
        setTestimonials([]);
      }
    } catch (err) {
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  // Open Modal for Add
  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setRole('Müştəri');
    setAvatarUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
    setComment('');
    setRating(5);
    setIsActive(true);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (item: TestimonialItem) => {
    setEditingItem(item);
    setName(item.name);
    setRole(item.role || 'Müştəri');
    setAvatarUrl(item.avatar_url || '');
    setComment(item.comment);
    setRating(item.rating || 5);
    setIsActive(item.is_active);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Toggle Active/Deactive Status
  const handleToggleActive = async (item: TestimonialItem) => {
    const updatedStatus = !item.is_active;
    setTestimonials((prev) =>
      prev.map((t) => (t.id === item.id ? { ...t, is_active: updatedStatus } : t))
    );

    try {
      await supabase.from('testimonials').update({ is_active: updatedStatus }).eq('id', item.id);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // Delete Testimonial
  const handleDelete = async (id: string) => {
    if (!confirm('Bu testimonial rəyini silməyə əminsiniz?')) return;

    setTestimonials((prev) => prev.filter((t) => t.id !== id));

    try {
      await supabase.from('testimonials').delete().eq('id', id);
    } catch (err) {
      console.error('Failed to delete testimonial', err);
    }
  };

  // Save Form (Add or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      setErrorMsg('Ad və Rəy mətni mütləq daxil edilməlidir.');
      return;
    }

    if (editingItem) {
      // Update
      const updatedObj = { ...editingItem, name, role, avatar_url: avatarUrl, comment, rating, is_active: isActive };
      setTestimonials((prev) => prev.map((t) => (t.id === editingItem.id ? updatedObj : t)));

      try {
        await supabase.from('testimonials').update({
          name,
          role,
          avatar_url: avatarUrl,
          comment,
          rating,
          is_active: isActive,
        }).eq('id', editingItem.id);
      } catch (err) {}
    } else {
      // Add New
      const newId = 'test_' + Date.now();
      const newObj: TestimonialItem = {
        id: newId,
        name,
        role: role || 'Müştəri',
        avatar_url: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        comment,
        rating,
        is_active: isActive,
      };

      setTestimonials((prev) => [newObj, ...prev]);

      try {
        await supabase.from('testimonials').insert([{
          name,
          role: role || 'Müştəri',
          avatar_url: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          comment,
          rating,
          is_active: isActive,
        }]);
      } catch (err) {}
    }

    setIsModalOpen(false);
  };

  // Filtered List
  const filteredTestimonials = testimonials.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.comment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ? true : statusFilter === 'active' ? t.is_active : !t.is_active;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Başlıq və Əlavə et Düyməsi */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '600' }}>Testimonials İdarəetməsi</h2>
          <p style={{ color: 'var(--admin-text-sub)', fontSize: '0.9rem' }}>Public saytda göstərilən müştəri rəylərini və tövsiyələri idarə edin</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Yeni Testimonial Əlavə Et
        </button>
      </div>

      {/* Filtr Paneli */}
      <div style={{ backgroundColor: 'var(--admin-card-bg)', padding: '20px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Ad və ya rəy mətni üzrə axtar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', fontSize: '0.9rem', outline: 'none' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-sub)' }} />
        </div>

        <select
          value={statusFilter}
          onChange={(e: any) => setStatusFilter(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', fontSize: '0.9rem', outline: 'none', backgroundColor: 'white' }}
        >
          <option value="all">Bütün Statuslar</option>
          <option value="active">Aktiv</option>
          <option value="inactive">Deaktiv</option>
        </select>
      </div>

      {/* Cədvəl / Siyahı */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Şəkil / Müştəri</th>
              <th>Vəzifə / Rol</th>
              <th>Rəy Mətni</th>
              <th>Reytinq</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {filteredTestimonials.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={item.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                      alt={item.name}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span style={{ fontWeight: '600' }}>{item.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--admin-text-sub)', fontSize: '0.88rem' }}>{item.role || 'Müştəri'}</td>
                <td style={{ maxWidth: '320px', fontSize: '0.9rem' }}>"{item.comment}"</td>
                <td>
                  <div style={{ display: 'flex', color: '#C9A15D', gap: '2px' }}>
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} size={14} fill="#C9A15D" />
                    ))}
                  </div>
                </td>
                <td>
                  <button
                    onClick={() => handleToggleActive(item)}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span className={`status-badge ${item.is_active ? 'status-success' : 'status-danger'}`}>
                      {item.is_active ? 'Aktiv' : 'Deaktiv'}
                    </span>
                  </button>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="admin-action-btn" onClick={() => handleOpenEdit(item)} title="Redaktə Et">
                    <Edit size={16} />
                  </button>
                  <button className="admin-action-btn delete" onClick={() => handleDelete(item.id)} title="Sil">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: 'var(--admin-radius)', maxWidth: '540px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '600' }}>
                {editingItem ? 'Testimonial-ı Redaktə Et' : 'Yeni Testimonial Əlavə Et'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {errorMsg && (
              <div style={{ backgroundColor: '#FDE8E8', color: '#E53E3E', padding: '12px', borderRadius: 'var(--admin-radius)', marginBottom: '16px', fontSize: '0.88rem' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Müştəri Adı və Soyadı *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Nümunə: Leyla Həsənova"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Vəzifə / Titul</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nümunə: İnteryer Dizayneri"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Şəkil URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Rəy Mətni *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Müştərinin rəy mətni..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Reytinq (1-5)</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', backgroundColor: 'white' }}
                >
                  <option value={5}>5 Ulduz (Əla)</option>
                  <option value={4}>4 Ulduz (Yaxşı)</option>
                  <option value={3}>3 Ulduz (Orta)</option>
                  <option value={2}>2 Ulduz</option>
                  <option value={1}>1 Ulduz</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <input
                  type="checkbox"
                  id="is_active_check"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="is_active_check" style={{ fontSize: '0.9rem', cursor: 'pointer', fontWeight: '500' }}>
                  Public saytda dərhal aktiv olaraq dərc edilsin
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Ləğv Et</button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> Yadda Saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
