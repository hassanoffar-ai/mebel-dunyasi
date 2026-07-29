'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, X, Upload, GripVertical, AlertTriangle } from 'lucide-react';
import '@/app/admin/admin.css';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any | null>(null);
  const [deleteWarningCat, setDeleteWarningCat] = useState<any | null>(null);

  // Form State
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImg, setCatImg] = useState('');

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
        .select('id, category, kateqoriya, kateqoriya_id, status');

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
    setCatImg('C:\\Users\\User\\.gemini\\antigravity\\brain\\60ddce65-7740-47cc-a2af-78899d3729b9\\sofa_product_1785206074780.jpg');
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

    const dbPayload = {
      ad: catName.trim(),
      sekil_url: catImg,
      sira: editingCat ? editingCat.order : categories.length + 1,
    };

    if (editingCat) {
      try {
        const { error } = await supabase.from('categories').update(dbPayload).eq('id', editingCat.id);
        if (error) {
          await supabase.from('categories').update({
            name: catName.trim(),
            description: catDesc,
            image_url: catImg,
          }).eq('id', editingCat.id);
        }
      } catch (err) {}
    } else {
      try {
        const { error } = await supabase.from('categories').insert([dbPayload]);
        if (error) {
          await supabase.from('categories').insert([{
            name: catName.trim(),
            description: catDesc,
            image_url: catImg,
          }]);
        }
      } catch (err) {}
    }

    await loadCategories();
    setIsModalOpen(false);
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
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Kateqoriya Adı</label>
                <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Qısa Təsvir (Opsional)</label>
                <textarea rows={3} value={catDesc} onChange={(e) => setCatDesc(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)' }} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Şəkil Yükləmə (Supabase Storage)</label>
                <div style={{ border: '2px dashed var(--admin-border)', padding: '16px', textAlign: 'center', borderRadius: 'var(--admin-radius)', backgroundColor: 'var(--admin-bg)', cursor: 'pointer' }}>
                  <Upload size={24} color="var(--admin-accent)" style={{ marginBottom: '6px' }} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-sub)' }}>Şəkil seçin və ya bura sürüşdürün</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Ləğv Et</button>
                <button type="submit" className="btn btn-primary">Yadda Saxla</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
