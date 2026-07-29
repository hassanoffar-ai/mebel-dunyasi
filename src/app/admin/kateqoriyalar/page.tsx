'use client';

import React, { useState, useEffect } from 'react';
import { supabase, uploadImage } from '@/lib/supabase';
import { Plus, Edit, Trash2, X, Upload, GripVertical, AlertTriangle, Loader2 } from 'lucide-react';
import '@/app/admin/admin.css';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any | null>(null);
  const [deleteWarningCat, setDeleteWarningCat] = useState<any | null>(null);

  // Form State
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImg, setCatImg] = useState('');

  // Handle Category Image File Upload (from Desktop)
  const handleCategoryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      alert('Yalnız JPG, PNG və WEBP formatları qəbul olunur.');
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const publicUrl = await uploadImage(file);
      if (publicUrl) {
        setCatImg(publicUrl);
      }
    } catch (err: any) {
      console.error('Category image upload error:', err);
      alert(`Şəkil yüklənməsi xətası: ${err.message || err}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Fetch Categories from Supabase with real active product counts
  const loadCategories = async () => {
    setLoading(true);
    try {
      // 1. Fetch categories
      const { data: dbCategories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('sira', { ascending: true });

      // 2. Fetch products
      const { data: dbProducts } = await supabase
        .from('products')
        .select('*');

      if (dbCategories && !catError) {
        const activeProducts = dbProducts ? dbProducts.filter((p: any) => p.status === 'aktiv' || !p.status) : [];

        const mapped = dbCategories.map((c: any) => {
          const catName = c.ad || c.name || c.title || 'Kateqoriya';
          const productCount = activeProducts.filter((p: any) => {
            if (p.kateqoriya_id && c.id) {
              return p.kateqoriya_id === c.id;
            }
            const pCat = p.category || p.kateqoriya;
            return pCat && pCat.toLowerCase() === catName.toLowerCase();
          }).length;

          return {
            id: c.id,
            name: catName,
            description: c.description || c.qisa_teswir || '',
            product_count: productCount,
            order: c.sira || c.order || 0,
            image_url: c.sekil_url || c.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
          };
        });

        setCategories(mapped);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.log('Error loading categories:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCat(null);
    setCatName('');
    setCatDesc('');
    setCatImg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: any) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatDesc(cat.description || '');
    setCatImg(cat.image_url);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!catName.trim()) {
      alert('Zəhmət olmasa kateqoriya adını daxil edin.');
      return;
    }

    const defaultImg = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80';
    const finalImg = catImg.trim() || defaultImg;

    const dbPayload = {
      ad: catName.trim(),
      description: catDesc.trim(),
      sekil_url: finalImg,
      sira: editingCat ? editingCat.order : categories.length + 1,
    };

    try {
      if (editingCat) {
        const { error } = await supabase.from('categories').update(dbPayload).eq('id', editingCat.id);
        if (error) {
          console.error('Update category error:', error);
          await supabase.from('categories').update({
            ad: catName.trim(),
            sekil_url: finalImg,
          }).eq('id', editingCat.id);
        }
      } else {
        const { error } = await supabase.from('categories').insert([dbPayload]);
        if (error) {
          console.error('Insert category error:', error);
          const { error: fallbackErr } = await supabase.from('categories').insert([{
            ad: catName.trim(),
            sekil_url: finalImg,
          }]);

          if (fallbackErr) {
            alert(`Kateqoriya əlavə edilərkən xəta baş verdi: ${fallbackErr.message}`);
            return;
          }
        }
      }

      await loadCategories();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Save category exception:', err);
      alert(`Xəta baş verdi: ${err.message || err}`);
    }
  };

  const handleDeleteClick = async (cat: any) => {
    if (cat.product_count > 0) {
      setDeleteWarningCat(cat);
    } else {
      try {
        await supabase.from('categories').delete().eq('id', cat.id);
      } catch (err) {}
      await loadCategories();
    }
  };

  return (
    <div>
      {/* Üst Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '600' }}>Kateqoriyalar</h2>
          <p style={{ color: 'var(--admin-text-sub)', fontSize: '0.9rem' }}>Mebel kateqoriyalarını və onların sırasını idarə edin</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal} style={{ padding: '12px 24px' }}>
          <Plus size={18} /> Yeni Kateqoriya Əlavə Et
        </button>
      </div>

      {/* Cədvəl */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>Sıra</th>
              <th>Şəkil</th>
              <th>Kateqoriya Adı</th>
              <th>Məhsul Sayı</th>
              <th style={{ textAlign: 'right' }}>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, idx) => (
              <tr key={cat.id}>
                <td style={{ color: 'var(--admin-text-sub)', cursor: 'grab' }}>
                  <GripVertical size={18} />
                </td>
                <td>
                  <img src={cat.image_url} alt={cat.name} style={{ width: '48px', height: '36px', borderRadius: 'var(--admin-radius)', objectFit: 'cover' }} />
                </td>
                <td style={{ fontWeight: '600' }}>{cat.name}</td>
                <td>
                  <span style={{ fontWeight: '600', color: 'var(--admin-accent)' }}>{cat.product_count} məhsul</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="admin-action-btn" onClick={() => handleOpenEditModal(cat)} title="Redaktə Et"><Edit size={16} /></button>
                  <button className="admin-action-btn delete" onClick={() => handleDeleteClick(cat)} title="Sil"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MƏHSUL XƏBƏRDARLIQ MODALI (Əgər məhsul varsa silinməyə icazə vermir) */}
      {deleteWarningCat && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: 'var(--admin-radius)', maxWidth: '440px', textAlign: 'center' }}>
            <AlertTriangle size={48} color="var(--admin-warning)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Kateqoriyanı Silmək Mümkün Deyil!</h3>
            <p style={{ color: 'var(--admin-text-sub)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '24px' }}>
              Bu kateqoriyada <strong>{deleteWarningCat.product_count} məhsul</strong> var. Silinməzdən əvvəl məhsulları başqa kateqoriyaya köçürün və ya onları silin.
            </p>
            <button className="btn btn-primary" onClick={() => setDeleteWarningCat(null)} style={{ padding: '10px 24px' }}>
              Başa Düşdüm
            </button>
          </div>
        </div>
      )}

      {/* YENİ / REDAKTƏ MODALI */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: 'var(--admin-radius)', maxWidth: '500px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600' }}>{editingCat ? 'Kateqoriyanı Redaktə Et' : 'Yeni Kateqoriya'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveCategory}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Kateqoriya Adı *</label>
                <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} required placeholder="məs: Yataq Otağı Mebelləri" style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Qısa Təsvir (Opsional)</label>
                <textarea rows={2} value={catDesc} onChange={(e) => setCatDesc(e.target.value)} placeholder="Kateqoriya haqqında qısa məlumat..." style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)' }} />
              </div>

              {/* Şəkil Yükləmə & Preview */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Kateqoriya Şəkli *</label>

                {/* File Upload Button */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ position: 'relative', flexGrow: 1 }}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={uploading}
                      onChange={handleCategoryFileUpload}
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%', zIndex: 5 }}
                    />
                    <button
                      type="button"
                      disabled={uploading}
                      className="btn btn-primary"
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', fontSize: '0.85rem' }}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="animate-spin" size={16} /> Yüklənir...
                        </>
                      ) : (
                        <>
                          <Upload size={16} /> 📁 Kompüterdən Şəkil Yüklə
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Direct Image URL input */}
                <input
                  type="url"
                  value={catImg}
                  onChange={(e) => setCatImg(e.target.value)}
                  placeholder="və ya şəkil URL ünvanı daxil edin (https://...)"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', fontSize: '0.82rem', marginBottom: '10px' }}
                />

                {/* Preview Thumbnail */}
                {catImg && (
                  <div style={{ position: 'relative', height: '120px', borderRadius: 'var(--admin-radius)', overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
                    <img src={catImg} alt="Kateqoriya şəkli" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setCatImg('')}
                      style={{ position: 'absolute', top: '6px', right: '6px', backgroundColor: 'rgba(179,65,58,0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      title="Şəkli sil"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Ləğv Et</button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Yüklənir...' : 'Yadda Saxla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
