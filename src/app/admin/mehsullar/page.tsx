'use client';

import React, { useState, useEffect } from 'react';
import { supabase, uploadImage } from '@/lib/supabase';
import { Product } from '@/lib/mockData';
import { Plus, Search, Edit, Trash2, X, Upload, AlertTriangle, Loader2, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import '@/app/admin/admin.css';

const CATEGORIES = [
  'Qonaq Otağı',
  'Yataq Otağı',
  'Mətbəx',
  'Ofis',
  'Uşaq Otağı',
  'Masa və Stullar',
  'Bağ və Balkon'
];

const MATERIALS = [
  'Təbii Palıd',
  'Qoz Ağacı',
  'Şam Ağacı',
  'MDF',
  'Laminat MDF',
  'DSP (Sunta)',
  'Təbii Dəri',
  'Süni Dəri',
  'Parça',
  'Məxmər (Velvet)',
  'Metal',
  'Şüşə'
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State & Validation
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Qonaq Otağı');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [material, setMaterial] = useState('Təbii Palıd');
  const [dimensions, setDimensions] = useState('');
  const [color, setColor] = useState('');
  const [description, setDescription] = useState('');

  // Image Management (Multiple images + primary URL)
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrlInput, setNewImageUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch Products from Supabase Backend (with product_images relation)
  const loadProducts = async () => {
    setLoading(true);
    try {
      let combinedProducts: Product[] = [];

      // 1. Fetch products from Supabase with nested relation
      const { data: dbProducts, error: prodError } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .order('created_at', { ascending: false });
      
      if (dbProducts && !prodError) {
        combinedProducts = dbProducts.map((p: any) => {
          const pImgs = p.product_images ? [...p.product_images].sort((a: any, b: any) => (a.sira || 0) - (b.sira || 0)) : [];
          const mainImg = pImgs.find((img: any) => img.esas_sekil)?.sekil_url || (pImgs[0]?.sekil_url) || p.xususiyyetler?.image_url || p.image_url || p.sekil_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=60';
          const allImgUrls = pImgs.length > 0 ? pImgs.map((img: any) => img.sekil_url) : (p.xususiyyetler?.images || p.images || [mainImg]);

          return {
            id: p.id,
            sku: p.xususiyyetler?.sku || p.sku || `MBL-${p.id.slice(0, 5)}`,
            name: p.ad || p.name || 'Məhsul',
            category: p.xususiyyetler?.category || p.category || p.kateqoriya || 'Qonaq Otağı',
            price: Number(p.qiymet || p.price || 0),
            old_price: p.endirimli_qiymet || p.old_price ? Number(p.endirimli_qiymet || p.old_price) : undefined,
            stock: Number(p.stok || p.stock || 0),
            material: p.xususiyyetler?.material || p.material || 'Təbii Palıd',
            dimensions: p.xususiyyetler?.dimensions || p.dimensions || '',
            color: p.xususiyyetler?.color || p.color || '',
            description: p.etrafli_teswir || p.qisa_teswir || p.description || '',
            image_url: mainImg,
            images: allImgUrls,
            rating: p.rating || 5.0,
            reviews_count: p.reviews_count || 0,
          };
        });
      }

      setProducts(combinedProducts);
    } catch (err) {
      console.log('Error fetching products from DB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      localStorage.removeItem('local_added_products');
    } catch (e) {}
    loadProducts();
  }, []);

  // Filter products by search and category
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.sku && prod.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory ? prod.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setSku(`MBL-${Math.floor(10000 + Math.random() * 90000)}`);
    setName('');
    setCategory('Qonaq Otağı');
    setPrice('');
    setOldPrice('');
    setStock('10');
    setMaterial('Təbii Palıd');
    setDimensions('');
    setColor('');
    setDescription('');
    setImages([]);
    setNewImageUrlInput('');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setSku(prod.sku || `MBL-${Math.floor(10000 + Math.random() * 90000)}`);
    setName(prod.name);
    setCategory(prod.category || 'Qonaq Otağı');
    setPrice(prod.price.toString());
    setOldPrice(prod.old_price ? prod.old_price.toString() : '');
    setStock(prod.stock ? prod.stock.toString() : '10');
    setMaterial(prod.material || 'Təbii Palıd');
    setDimensions(prod.dimensions || '');
    setColor(prod.color || '');
    setDescription(prod.description || '');

    const existingImages = prod.images && prod.images.length > 0 ? prod.images : (prod.image_url ? [prod.image_url] : []);
    setImages(existingImages);
    setNewImageUrlInput('');
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Image Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const fileList = Array.from(e.target.files);

    if (images.length + fileList.length > 5) {
      alert('Maksimum 5 ədəd şəkil yükləyə bilərsiniz.');
      e.target.value = '';
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

    setUploadingImage(true);

    try {
      const validFiles = fileList.filter((file) => {
        if (!allowedTypes.includes(file.type.toLowerCase())) {
          alert(`"${file.name}" faylının formatı düzgün deyil. Yalnız JPG, PNG və WEBP formatları qəbul olunur.`);
          return false;
        }

        if (file.size > maxSizeBytes) {
          alert(`"${file.name}" faylının həcmi 5 MB-dan böyükdür (Həcmi: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`);
          return false;
        }

        return true;
      });

      // Storage uploads do not depend on one another. Running them concurrently
      // avoids making a multi-image upload wait for every previous file.
      const results = await Promise.allSettled(validFiles.map((file) => uploadImage(file)));
      const uploadedUrls = results
        .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
        .map((result) => result.value);
      const failedCount = results.filter((result) => result.status === 'rejected').length;

      if (uploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...uploadedUrls.filter((url) => !prev.includes(url))]);
      }
      if (failedCount > 0) {
        alert(`${failedCount} şəkil yüklənə bilmədi. Zəhmət olmasa yenidən cəhd edin.`);
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      alert(`Şəkil yüklənməsi xətası: ${err.message || err}`);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAddUrlImage = () => {
    const url = newImageUrlInput.trim();
    if (!url) return;

    if (images.length >= 5) {
      alert('Maksimum 5 ədəd şəkil əlavə edilə bilər.');
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      alert('Zəhmət olmasa düzgün şəkil URL ünvanı daxil edin (http:// və ya https://)');
      return;
    }

    if (images.includes(url)) {
      alert('Bu şəkil URL-i artıq siyahıda var.');
      return;
    }

    setImages((prev) => [...prev, url]);
    setNewImageUrlInput('');
    if (formErrors.images) setFormErrors((prev) => ({ ...prev, images: '' }));
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const updated = [...prev];
      const selected = updated.splice(index, 1)[0];
      updated.unshift(selected);
      return updated;
    });
  };

  const handleReplaceImageFile = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      alert('Yalnız JPG, PNG və WEBP formatları qəbul olunur.');
      return;
    }
    setUploadingImage(true);
    try {
      const publicUrl = await uploadImage(file);
      if (publicUrl) {
        setImages((prev) => {
          const updated = [...prev];
          updated[index] = publicUrl;
          return updated;
        });
      }
    } catch (err: any) {
      console.error('Replace image error:', err);
      alert(`Şəkil dəyişdirmə xətası: ${err.message || err}`);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  // Validation Check
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Məhsul adı məcburidir.';
    if (!price || parseFloat(price) <= 0) errors.price = 'Məhsulun qiyməti düzgün daxil edilməlidir (0-dan böyük).';
    if (oldPrice && parseFloat(oldPrice) <= parseFloat(price)) {
      errors.oldPrice = 'Endirimli qiymət ilkin qiymətdən az olmalıdır.';
    }
    if (images.length === 0) errors.images = 'Ən azı 1 ədəd şəkil yüklənməlidir və ya URL daxil edilməlidir.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const primaryImage = images[0];

    const dbPayload = {
      ad: name.trim(),
      qiymet: parseFloat(price),
      endirimli_qiymet: oldPrice ? parseFloat(oldPrice) : null,
      stok: parseInt(stock) || 0,
      qisa_teswir: description.trim().slice(0, 150),
      etrafli_teswir: description.trim(),
      xususiyyetler: {
        sku: sku || `MBL-${Date.now().toString().slice(-5)}`,
        category: category,
        material,
        dimensions: dimensions.trim(),
        color: color.trim(),
        image_url: primaryImage,
        images: images,
      },
      status: 'aktiv',
    };

    try {
      let savedProductId = editingProduct ? editingProduct.id : null;

      if (editingProduct) {
        const res = await fetch('/api/admin/crud', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table: 'products',
            id: editingProduct.id,
            data: dbPayload,
          }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || 'Məhsul yenilənə bilmədi.');
        }
      } else {
        const res = await fetch('/api/admin/crud', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table: 'products',
            data: dbPayload,
          }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || 'Məhsul əlavə edilə bilmədi.');
        }
        if (data.data && data.data.length > 0) {
          savedProductId = data.data[0].id;
        }
      }

      // Save product images to product_images table linked with product_id
      if (savedProductId) {
        if (editingProduct) {
          try {
            await fetch(`/api/admin/crud?table=product_images&id=${savedProductId}`, {
              method: 'DELETE',
            });
          } catch (e) {}
        }

        const imageInserts = images.map((imgUrl, idx) => ({
          product_id: savedProductId,
          sekil_url: imgUrl,
          esas_sekil: idx === 0,
          sira: idx + 1,
        }));

        await fetch('/api/admin/crud', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table: 'product_images',
            data: imageInserts,
          }),
        });
      }

      // Local storage backup for instant sync across tabs
      try {
        const newProdObj: Product = {
          id: savedProductId || `MBL-${Date.now()}`,
          sku: sku || `MBL-${Math.floor(10000 + Math.random() * 90000)}`,
          name: name.trim(),
          category: category,
          price: parseFloat(price),
          old_price: oldPrice ? parseFloat(oldPrice) : undefined,
          stock: parseInt(stock) || 10,
          material,
          dimensions: dimensions.trim(),
          color: color.trim(),
          description: description.trim(),
          image_url: primaryImage,
          images,
          rating: 5.0,
          reviews_count: 0,
        };

        const stored = localStorage.getItem('local_added_products');
        const localList: Product[] = stored ? JSON.parse(stored) : [];
        const filtered = localList.filter((p) => p.id !== newProdObj.id);
        localStorage.setItem('local_added_products', JSON.stringify([newProdObj, ...filtered]));
      } catch (e) {}

      await loadProducts();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving product to Supabase:', err);
      alert(`Məhsul yadda saxlanılarkən xəta baş verdi: ${err.message || err}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setDeleteConfirmId(null);
    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Naməlum xəta');
      }

      setProducts((current) => current.filter((product) => product.id !== id));
    } catch (err: any) {
      console.error('Delete product error:', err);
      alert(`Məhsul silinərkən xəta baş verdi: ${err.message || err}`);
    }
    await loadProducts();
  };

  return (
    <div className="admin-page">
      {/* Üst Bar & Düymə */}
      <div className="admin-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '600' }}>Məhsulların İdarə Olunması</h2>
          <p style={{ color: 'var(--admin-text-sub)', fontSize: '0.9rem' }}>Saytdakı bütün mebel məhsullarını əlavə edin, yeniləyin və redaktə edin</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal} style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Yeni Məhsul Əlavə Et
        </button>
      </div>

      {/* Filtr & Axtarış Paneli */}
      <div style={{ backgroundColor: 'var(--admin-card-bg)', padding: '18px 20px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Məhsul adı və ya SKU ilə axtar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', fontSize: '0.9rem', outline: 'none' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-sub)' }} />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', fontSize: '0.9rem', outline: 'none', backgroundColor: 'white', cursor: 'pointer' }}
        >
          <option value="">Bütün Kateqoriyalar</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Cədvəl */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Şəkil</th>
              <th>SKU</th>
              <th>Məhsul Adı</th>
              <th>Kateqoriya</th>
              <th>Material / Ölçü</th>
              <th>Qiymət</th>
              <th>Stok</th>
              <th style={{ textAlign: 'right' }}>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--admin-text-sub)' }}>
                  Heç bir məhsul tapılmadı.
                </td>
              </tr>
            ) : (
              filteredProducts.map((prod) => (
                <tr key={prod.id}>
                  <td>
                    <img src={prod.image_url} alt={prod.name} style={{ width: '48px', height: '48px', borderRadius: 'var(--admin-radius)', objectFit: 'cover' }} />
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--admin-text-sub)', fontWeight: '600' }}>{prod.sku || '—'}</td>
                  <td style={{ fontWeight: '600' }}>{prod.name}</td>
                  <td>{prod.category}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--admin-text-sub)' }}>
                    <div>{prod.material || 'Göstərilməyib'}</div>
                    {prod.dimensions && <div style={{ fontSize: '0.75rem', color: '#8A6822' }}>{prod.dimensions}</div>}
                  </td>
                  <td style={{ fontWeight: '600', color: 'var(--admin-accent)' }}>
                    {prod.price} ₼ {prod.old_price && <span style={{ textDecoration: 'line-through', color: 'var(--admin-text-sub)', fontSize: '0.8rem', marginLeft: '4px' }}>{prod.old_price} ₼</span>}
                  </td>
                  <td>{prod.stock ?? 10} ədəd</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="admin-action-btn" onClick={() => handleOpenEditModal(prod)} title="Redaktə Et"><Edit size={16} /></button>
                    <button className="admin-action-btn delete" onClick={() => setDeleteConfirmId(prod.id)} title="Sil"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* SİLİNMƏ TƏSDİQ MODALI */}
      {deleteConfirmId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: 'var(--admin-radius)', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <AlertTriangle size={48} color="var(--admin-danger)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Məhsulu Silmək İstədiyinizə Əminsiniz?</h3>
            <p style={{ color: 'var(--admin-text-sub)', fontSize: '0.9rem', marginBottom: '24px' }}>Bu əməliyyat geri qaytarıla bilməz.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setDeleteConfirmId(null)}>Ləğv Et</button>
              <button className="btn" style={{ backgroundColor: 'var(--admin-danger)', color: 'white' }} onClick={() => handleDeleteProduct(deleteConfirmId)}>Bəli, Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* PEŞƏKAR E-COMMERCE MƏHSUL ƏLAVƏ / REDAKTƏ MODALI */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: 'var(--admin-radius)', maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            
            {/* Modal Başlığı */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--admin-text-main)' }}>
                  {editingProduct ? 'Məhsul Məlumatlarını Redaktə Et' : 'Yeni Məhsul Əlavə Et'}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-sub)' }}>Real e-commerce kataloq idarəetməsi</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-sub)' }}><X size={22} /></button>
            </div>

            <form onSubmit={handleSaveProduct}>
              {/* 1. Məhsul Kodu (SKU) & Məhsul Adı */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>Məhsul Kodu (SKU)</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="MBL-10293"
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>Məhsul Adı *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: '' })); }}
                    placeholder="məs: Velvet Lüks Künc Divanı"
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: formErrors.name ? '1px solid var(--admin-danger)' : '1px solid var(--admin-border)', fontSize: '0.88rem' }}
                  />
                  {formErrors.name && <span style={{ fontSize: '0.75rem', color: 'var(--admin-danger)', marginTop: '4px', display: 'block' }}>{formErrors.name}</span>}
                </div>
              </div>

              {/* 2. Kateqoriya & Stok Sayı */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>Kateqoriya *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', fontSize: '0.88rem', backgroundColor: 'white' }}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>Stok Sayı (Ədəd)</label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="10"
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              {/* 3. Qiymət (Məcburi) & Endirimli Qiymət (Optional) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>Qiymət (₼) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => { setPrice(e.target.value); if (formErrors.price) setFormErrors((prev) => ({ ...prev, price: '' })); }}
                    placeholder="məs: 1450"
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: formErrors.price ? '1px solid var(--admin-danger)' : '1px solid var(--admin-border)', fontSize: '0.88rem' }}
                  />
                  {formErrors.price && <span style={{ fontSize: '0.75rem', color: 'var(--admin-danger)', marginTop: '4px', display: 'block' }}>{formErrors.price}</span>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>Endirimli Qiymət (Əvvəlki) — Opsional</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={oldPrice}
                    onChange={(e) => { setOldPrice(e.target.value); if (formErrors.oldPrice) setFormErrors((prev) => ({ ...prev, oldPrice: '' })); }}
                    placeholder="məs: 1650"
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: formErrors.oldPrice ? '1px solid var(--admin-danger)' : '1px solid var(--admin-border)', fontSize: '0.88rem' }}
                  />
                  {formErrors.oldPrice && <span style={{ fontSize: '0.75rem', color: 'var(--admin-danger)', marginTop: '4px', display: 'block' }}>{formErrors.oldPrice}</span>}
                </div>
              </div>

              {/* 4. Material (Dropdown) & Ölçü & Rəng */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>Material</label>
                  <select
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', fontSize: '0.88rem', backgroundColor: 'white' }}
                  >
                    {MATERIALS.map((mat) => (
                      <option key={mat} value={mat}>{mat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>Ölçü (Ö/E/H sm)</label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="məs: 180 × 90 × 75 sm"
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>Rəng Seçimi</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="məs: Qoz, Zümrüd Yaşılı"
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              {/* 5. Məhsul Təsviri (Textarea) */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>Məhsulun Ətraflı Təsviri</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Məhsulun rahatlığı, parça xüsusiyyətləri və dizayn detalları haqqında məlumat yazın..."
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', fontSize: '0.88rem', resize: 'vertical' }}
                />
              </div>

              {/* 6. Şəkil Yükləmə (Multiple Images + URL) */}
              <div style={{ marginBottom: '24px', backgroundColor: 'var(--admin-bg)', padding: '18px', borderRadius: 'var(--admin-radius)', border: formErrors.images ? '1px solid var(--admin-danger)' : '1px solid var(--admin-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600' }}>
                    Məhsul Şəkilləri *
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-sub)' }}>
                    {images.length}/5 şəkil əlavə edilib
                  </span>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-sub)', marginBottom: '12px' }}>
                  İcazə verilən formatlar: <strong>JPG, PNG, WEBP</strong> (Hər fayl maksimum 5 MB)
                </p>

                {/* Full-width URL input (Enter / onBlur auto-add) */}
                <div style={{ marginBottom: '10px' }}>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={newImageUrlInput}
                    disabled={images.length >= 5}
                    onChange={(e) => setNewImageUrlInput(e.target.value)}
                    onBlur={() => {
                      if (newImageUrlInput.trim()) {
                        handleAddUrlImage();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddUrlImage();
                      }
                    }}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', fontSize: '0.88rem', backgroundColor: 'white', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Kompüterdən Yüklə button directly below input, left-aligned */}
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      disabled={images.length >= 5 || uploadingImage}
                      onChange={handleFileUpload}
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: images.length >= 5 ? 'not-allowed' : 'pointer', width: '100%', height: '100%', zIndex: 5 }}
                    />
                    <button
                      type="button"
                      disabled={images.length >= 5 || uploadingImage}
                      className="btn btn-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="animate-spin" size={16} /> Yüklənir...
                        </>
                      ) : (
                        <>
                          <Upload size={16} /> 📁 Kompüterdən Yüklə
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {formErrors.images && <span style={{ fontSize: '0.75rem', color: 'var(--admin-danger)', marginBottom: '10px', display: 'block' }}>{formErrors.images}</span>}

                {/* Yüklənmiş Şəkillər Şəbəkəsi (Thumbnails) */}
                {images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))', gap: '12px', marginTop: '14px' }}>
                    {images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: 'relative',
                          height: '95px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: idx === 0 ? '2px solid var(--admin-accent)' : '1px solid var(--admin-border)',
                          backgroundColor: 'white',
                          boxShadow: 'var(--admin-shadow)',
                        }}
                      >
                        <img src={imgUrl} alt={`Məhsul şəkli ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        
                        {/* Edit / Replace Button */}
                        <div style={{ position: 'absolute', top: '4px', left: '4px', zIndex: 10 }}>
                          <label title="Şəkli Dəyişdir (Desktop-dan yeni şəkil seç)" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'rgba(43,29,20,0.85)', color: 'white', cursor: 'pointer' }}>
                            <Edit size={12} />
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              style={{ display: 'none' }}
                              onChange={(e) => handleReplaceImageFile(idx, e)}
                            />
                          </label>
                        </div>

                        {/* Delete Image Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          title="Şəkli Sil"
                          style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(179,65,58,0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                        >
                          <Trash2 size={12} />
                        </button>

                        {idx === 0 ? (
                          <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'var(--admin-accent)', color: 'white', fontSize: '0.65rem', textAlign: 'center', padding: '3px 0', fontWeight: '600' }}>
                            ★ Əsas Şəkil
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(43,29,20,0.8)', color: '#FAF7F2', border: 'none', fontSize: '0.62rem', textAlign: 'center', padding: '3px 0', cursor: 'pointer', fontWeight: '500' }}
                          >
                            Əsas Şəkil Et
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Düymələr */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--admin-border)', paddingTop: '16px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Ləğv Et</button>
                <button type="submit" className="btn btn-primary" disabled={uploadingImage}>
                  {uploadingImage ? 'Şəkil Yüklənir...' : 'Yadda Saxla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


