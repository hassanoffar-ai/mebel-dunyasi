'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { MOCK_PRODUCTS, Product } from '@/lib/mockData';
import { Plus, Search, Filter, Edit, Trash2, X, Upload, Check, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import '@/app/admin/admin.css';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Qonaq Otağı');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [stock, setStock] = useState('15');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('Təbii Palıd / Velvet');
  const [imageUrl, setImageUrl] = useState('');

  // Fetch Products from Supabase
  useEffect(() => {
    async function loadProducts() {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (data && data.length > 0 && !error) {
          setProducts(data as Product[]);
        }
      } catch (err) {
        console.log('Using mock products list');
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
    setImageUrl('C:\\Users\\User\\.gemini\\antigravity\\brain\\60ddce65-7740-47cc-a2af-78899d3729b9\\sofa_product_1785206074780.jpg');
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
      image_url: imageUrl || 'C:\\Users\\User\\.gemini\\antigravity\\brain\\60ddce65-7740-47cc-a2af-78899d3729b9\\sofa_product_1785206074780.jpg',
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
    <div>
      {/* Üst Bar & Düymə */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '600' }}>Məhsullar</h2>
          <p style={{ color: 'var(--admin-text-sub)', fontSize: '0.9rem' }}>Saytdakı bütün mebel məhsullarını idarə edin</p>
        </div>
        <button class="btn btn-primary" onClick={handleOpenAddModal} style={{ padding: '12px 24px' }}>
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
      <div class="admin-table-container">
        <table class="admin-table">
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
                  <span class="status-badge status-success">Aktiv</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button class="admin-action-btn" onClick={() => handleOpenEditModal(prod)} title="Redaktə Et"><Edit size={16} /></button>
                  <button class="admin-action-btn delete" onClick={() => setDeleteConfirmId(prod.id)} title="Sil"><Trash2 size={16} /></button>
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
              <button class="btn btn-outline" onClick={() => setDeleteConfirmId(null)}>Ləğv Et</button>
              <button class="btn" style={{ backgroundColor: 'var(--admin-danger)', color: 'white' }} onClick={() => handleDeleteProduct(deleteConfirmId)}>Bəli, Sil</button>
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
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Şəkil Yükləmə (Supabase Storage)</label>
                <div style={{ border: '2px dashed var(--admin-border)', padding: '20px', textAlign: 'center', borderRadius: 'var(--admin-radius)', backgroundColor: 'var(--admin-bg)', cursor: 'pointer' }}>
                  <Upload size={28} color="var(--admin-accent)" style={{ marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-sub)' }}>Şəkli bura sürüşdürün və ya Supabase Storage-ə yükləmək üçün klikləyin</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" class="btn btn-outline" onClick={() => setIsModalOpen(false)}>Ləğv Et</button>
                <button type="submit" class="btn btn-primary">Yadda Saxla</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
