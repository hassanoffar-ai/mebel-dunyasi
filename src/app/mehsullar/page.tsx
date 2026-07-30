'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header, Footer } from '@/components/Navigation';
import { ProductCard } from '@/components/ProductCard';
import { Product, MOCK_PRODUCTS } from '@/lib/mockData';
import { supabase } from '@/lib/supabase';
import { Search, Filter, SlidersHorizontal, AlertTriangle, PackageX } from 'lucide-react';

import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('kateqoriya') || 'Bütün';

  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'rating'>('default');

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) {
      setSearchQuery(q);
    }
    setSelectedCategory(searchParams.get('kateqoriya') || 'Bütün');
  }, [searchParams]);

  const categories = ['Bütün', 'Qonaq Otağı', 'Yataq Otağı', 'Mətbəx', 'Ofis', 'Uşaq Otağı', 'Masa və Stullar'];

  useEffect(() => {
    const cat = searchParams.get('kateqoriya') || searchParams.get('category');
    if (cat) {
      const decodedCat = decodeURIComponent(cat);
      const found = categories.find((c) => c.toLowerCase() === decodedCat.toLowerCase());
      if (found) {
        setSelectedCategory(found);
      } else {
        setSelectedCategory(decodedCat);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadProducts() {
      // Show the most recently fetched catalogue immediately, then refresh it
      // in the background. This removes the blank loading state on repeat visits.
      let hasCachedProducts = false;
      try {
        const sessionCached = sessionStorage.getItem('catalogue_products_cache');
        const localCached = localStorage.getItem('catalogue_products_cache_v2');
        const parsed = sessionCached
          ? JSON.parse(sessionCached)
          : localCached
            ? JSON.parse(localCached)
            : null;
        const cachedProducts = Array.isArray(parsed) ? parsed : parsed?.products;
        const isFresh = Array.isArray(parsed) || (parsed?.savedAt && Date.now() - parsed.savedAt < 2 * 60 * 1000);
        if (Array.isArray(cachedProducts) && isFresh) {
          setProducts(cachedProducts);
          setLoading(false);
          hasCachedProducts = true;
        }
      } catch {}
      if (!hasCachedProducts) setLoading(true);
      try {
        let combined: Product[] = [];
        const { data: dbProducts } = await supabase
          .from('products')
          .select('*, product_images(*)')
          .order('created_at', { ascending: false });

        if (dbProducts && dbProducts.length > 0) {
          combined = dbProducts.map((p: any) => {
            const pImgs = p.product_images ? [...p.product_images].sort((a: any, b: any) => (a.sira || 0) - (b.sira || 0)) : [];
            const mainImg = pImgs.find((img: any) => img.esas_sekil)?.sekil_url || (pImgs[0]?.sekil_url) || p.xususiyyetler?.image_url || p.image_url || p.sekil_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=60';
            const allImgs = pImgs.length > 0 ? pImgs.map((img: any) => img.sekil_url) : (p.xususiyyetler?.images || p.images || [mainImg]);

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
              description: p.etrafli_teswir || p.qisa_teswir || p.description,
              image_url: mainImg,
              images: allImgs,
              rating: p.rating || 5.0,
              reviews_count: p.reviews_count || 0,
            };
          });
        }

        // Products must come only from the database. Remove records cached by
        // an older version of the admin panel so deleted products do not
        // reappear for visitors.
        try {
          localStorage.removeItem('local_added_products');
        } catch (e) {}

        setProducts(combined);
        try {
          sessionStorage.setItem('catalogue_products_cache', JSON.stringify(combined));
          localStorage.setItem('catalogue_products_cache_v2', JSON.stringify({ savedAt: Date.now(), products: combined }));
        } catch {}
      } catch (err: any) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  // Filter & Sort Products
  const filteredProducts = products
    .filter((p) => {
      const matchesCategory = selectedCategory === 'Bütün' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main style={{ flexGrow: 1, padding: '40px 0 80px 0', backgroundColor: 'var(--bg-main)' }}>
        <div className="container">
          {/* Header & Title */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '2.4rem', marginBottom: '8px' }}>Bütün Məhsullar</h1>
            <p style={{ color: 'var(--text-muted)' }}>Mebel Dünyasının ən yeni və populyar kolleksiyası ilə tanış olun.</p>
          </div>

          {/* Filter Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--white)',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '32px',
              boxShadow: 'var(--shadow-diffuse)',
            }}
          >
            {/* Categories Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.88rem',
                    fontWeight: '500',
                    border: '1.5px solid',
                    borderColor: selectedCategory === cat ? 'var(--accent-primary)' : 'var(--border-color)',
                    backgroundColor: selectedCategory === cat ? 'var(--accent-primary)' : 'transparent',
                    color: selectedCategory === cat ? 'var(--white)' : 'var(--text-main)',
                    transition: 'var(--transition)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search & Sort */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Search */}
              <div style={{ position: 'relative', minWidth: '200px' }}>
                <input
                  type="text"
                  placeholder="Məhsul axtar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingRight: '36px', paddingLeft: '14px', fontSize: '0.88rem' }}
                />
                <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="form-input"
                style={{ width: 'auto', fontSize: '0.88rem', padding: '10px 14px' }}
              >
                <option value="default">Sıralama: Standart</option>
                <option value="price-low">Qiymət: Ucuzdan Baha</option>
                <option value="price-high">Qiymət: Bahadan Ucuza</option>
                <option value="rating">Reytinqə Görə</option>
              </select>
            </div>
          </div>

          {/* Loading / Error / Empty / Grid States */}
          {loading ? (
            <div className="grid-responsive-products" aria-label="Məhsullar hazırlanır">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} style={{ background: 'var(--white)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <div style={{ aspectRatio: '1 / 0.78', background: 'linear-gradient(90deg, #f4f0ea 25%, #fbf9f6 50%, #f4f0ea 75%)', backgroundSize: '200% 100%', animation: 'skeleton-loading 1.4s infinite' }} />
                  <div style={{ padding: '18px' }}>
                    <div style={{ height: '12px', width: '38%', borderRadius: '999px', background: '#eee8df', marginBottom: '14px' }} />
                    <div style={{ height: '18px', width: '82%', borderRadius: '6px', background: '#eee8df', marginBottom: '18px' }} />
                    <div style={{ height: '18px', width: '45%', borderRadius: '6px', background: '#eee8df' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid-responsive-products">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} onAddToCart={handleAddToCart} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <PackageX size={48} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
              <h3>Axtarışa uyğun məhsul tapılmadı.</h3>
              <p style={{ marginTop: '8px' }}>Filtri dəyişərək yenidən cəhd edin.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <React.Suspense fallback={<div />}>
      <ProductsContent />
    </React.Suspense>
  );
}
