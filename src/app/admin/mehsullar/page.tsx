'use client';

import React, { useState, useEffect } from 'react';
import { supabase, uploadImage } from '@/lib/supabase';
import { MOCK_PRODUCTS, Product } from '@/lib/mockData';
import { Plus, Search, Filter, Edit, Trash2, X, Upload, Check, AlertTriangle, Image as ImageIcon, Loader2 } from 'lucide-react';
import '@/app/admin/admin.css';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Qonaq Otağı');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [stock, setStock] = useState('15');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('Təbii Palıd / Velvet');
  const [imageUrl, setImageUrl] = useState('');

  // Fetch Products from Supabase Backend
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (data && !error) {
          setProducts(data as Product[]);
        }
      } catch (err) {
        console.log('Error fetching products from DB:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Filter products by search and category
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? prod.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Qonaq Otağı');
    setPrice('');
    setOldPrice('');
    setStock('15');
    setDescription('');
    setImageUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategory(prod.category);
    setPrice(prod.price.toString());
    setOldPrice(prod.old_price ? prod.old_price.toString() : '');
    setStock('12');
    setDescription('Yüksək keyfiyyətli premium mebel.');
    setImageUrl(prod.image_url);
    setIsModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingImage(true);
    try {
      const publicUrl = await uploadImage(file);
      if (publicUrl) {
        setImageUrl(publicUrl);
      } else {
        alert('Şəkil yüklənərkən xəta baş verdi. Zəhmət olmasa Supabase Storage "images" bucket-inin yaradıldığından əmin olun.');
      }
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const newProd: Product = {
      id: editingProduct ? editingProduct.id : (Date.now()).toString(),
      name,
      category,
      price: parseFloat(price) || 0,
      old_price: oldPrice ? parseFloat(oldPrice) : undefined,
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviews_count: editingProduct ? editingProduct.reviews_count : 0,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=60',
    };

    if (editingProduct) {
      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? newProd : p)));
      try {
        await supabase.from('products').update(newProd).eq('id', editingProduct.id);
      } catch (err) {}
    } else {
      setProducts((prev) => [newProd, ...prev]);
      try {
        await supabase.from('products').insert([newProd]);
      } catch (err) {}
    }

    setIsModalOpen(false);
  };

  const handleDeleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirmId(null);
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (err) {}
  };

  return (
    <div className="admin-page">
      {/* Üst Bar & Düymə */}
      <div className="admin-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '600' }}>Məhsullar</h2>
          <p style={{ color: 'var(--admin-text-sub)', fontSize: '0.9rem' }}>Saytdakı bütün mebel məhsullarını idarə edin</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal} style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Yeni Məhsul Əlavə Et
        </button>
      </div>

      {/* Filtr & Axtarış Paneli */}
      <div style={{ backgroundColor: 'var(--admin-card-bg)', padding: '20px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Məhsul adı üzrə axtar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', fontSize: '0.9rem', outline: 'none' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-sub)' }} />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', fontSize: '0.9rem', outline: 'none', backgroundColor: 'white' }}
        >
          <option value="">Bütün Kateqoriyalar</option>
          <option value="Qonaq Otağı">Qonaq Otağı</option>
          <option value="Yataq Otağı">Yataq Otağı</option>
          <option value="Mətbəx">Mətbəx</option>
        </select>
      </div>

      {/* Cədvəl */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Şəkil</th>
              <th>Məhsul Adı</th>
              <th>Kateqoriya</th>
              <th>Qiymət</th>
              <th>Stok</th>
              <th>Reytinq</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((prod) => (
              <tr key={prod.id}>
                <td>
                  <img src={prod.image_url} alt={prod.name} style={{ width: '48px', height: '48px', borderRadius: 'var(--admin-radius)', objectFit: 'cover' }} />
                </td>
                <td style={{ fontWeight: '600' }}>{prod.name}</td>
                <td>{prod.category}</td>
                <td style={{ fontWeight: '600', color: 'var(--admin-accent)' }}>
                  {prod.price} ₼ {prod.old_price && <span style={{ textDecoration: 'line-through', color: 'var(--admin-text-sub)', fontSize: '0.8rem', marginLeft: '4px' }}>{prod.old_price} ₼</span>}
                </td>
                <td>12 ədəd</td>
                <td>★ {prod.rating}</td>
                <td>
                  <span className="status-badge status-success">Aktiv</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="admin-action-btn" onClick={() => handleOpenEditModal(prod)} title="Redaktə Et"><Edit size={16} /></button>
                  <button className="admin-action-btn delete" onClick={() => setDeleteConfirmId(prod.id)} title="Sil"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SİLİNMSƏ TƏSDİQ MODALI */}
      {deleteConfirmId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: 'var(--admin-radius)', maxWidth: '400px', textAlign: 'center' }}>
            <AlertTriangle size={48} color="var(--admin-danger)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Məhsulu Silmək İstedinizə Əminsiniz?</h3>
            <p style={{ color: 'var(--admin-text-sub)', fontSize: '0.9rem', marginBottom: '24px' }}>Bu əməliyyat geri qaytarıla bilməz.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setDeleteConfirmId(null)}>Ləğv Et</button>
              <button className="btn" style={{ backgroundColor: 'var(--admin-danger)', color: 'white' }} onClick={() => handleDeleteProduct(deleteConfirmId)}>Bəli, Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* YENİ / REDAKTƏ MODALI */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: 'var(--admin-radius)', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '600' }}>{editingProduct ? 'Məhsulu Redaktə Et' : 'Yeni Məhsul Əlavə Et'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Məhsul Adı</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Kateqoriya</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)' }}>
                    <option value="Qonaq Otağı">Qonaq Otağı</option>
                    <option value="Yataq Otağı">Yataq Otağı</option>
                    <option value="Mətbəx">Mətbəx</option>
                    <option value="Ofis">Ofis</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Stok Sayı</label>
                  <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Qiymət (₼)</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Endirimli Qiymət (Opsional)</label>
                  <input type="number" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)' }} />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Material & Ölçü Xüsusiyyəti</label>
                <input type="text" value={material} onChange={(e) => setMaterial(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)' }} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Şəkil (URL və ya Kompüterdən Seçim)</label>
                
                {/* 1. Doğrudan URL daxil etmək üçün input */}
                <input
                  type="url"
                  placeholder="https://... şəkil linki daxil edin"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', marginBottom: '10px' }}
                />

                {/* 2. Kompüterdən fayl seçmək üçün buton və ya sürüşdürmə sahəsi */}
                <div style={{ position: 'relative', border: '1px dashed var(--admin-border)', padding: '12px', textAlign: 'center', borderRadius: 'var(--admin-radius)', backgroundColor: 'var(--admin-bg)', cursor: 'pointer' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%', zIndex: 5 }}
                  />
                  {uploadingImage ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--admin-accent)', fontSize: '0.85rem' }}>
                      <Loader2 className="animate-spin" size={18} /> Supabase-ə yüklənir...
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Upload size={18} color="var(--admin-accent)" />
                      <span style={{ fontSize: '0.85rem', color: 'var(--admin-accent)', fontWeight: '600', textDecoration: 'underline' }}>
                        və ya kompüterdən şəkil seçin
                      </span>
                    </div>
                  )}
                </div>

                {/* Əgər şəkil seçilibsə preview göstəririk */}
                {imageUrl && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--admin-bg)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                    <img src={imageUrl} alt="Ön baxış" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {imageUrl}
                    </span>
                  </div>
                )}
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


