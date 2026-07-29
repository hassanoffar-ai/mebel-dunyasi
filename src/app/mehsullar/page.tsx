'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header, Footer } from '@/components/Navigation';
import { ProductCard } from '@/components/ProductCard';
import { Product, MOCK_PRODUCTS } from '@/lib/mockData';
import { supabase } from '@/lib/supabase';
import { Search, Filter, SlidersHorizontal, Clock, AlertTriangle, PackageX } from 'lucide-react';

import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Bütün');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'rating'>('default');

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const categories = ['Bütün', 'Qonaq Otağı', 'Yataq Otağı', 'Mətbəx', 'Uşaq Otağı', 'Masa və Stullar'];

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const { data } = await supabase.from('products').select('*');
        if (data && data.length > 0) {
          setProducts(data as Product[]);
        } else {
          setProducts(MOCK_PRODUCTS);
        }
      } catch (err: any) {
        setProducts(MOCK_PRODUCTS);
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
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Clock size={40} className="animate-spin" style={{ margin: '0 auto 12px auto', color: 'var(--accent-primary)' }} />
              <h3>Məhsullar yüklənir...</h3>
            </div>
          ) : errorMsg ? (
            <div style={{ backgroundColor: '#FDE8E8', color: '#E53E3E', padding: '20px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <AlertTriangle size={32} style={{ margin: '0 auto 8px auto' }} />
              <p style={{ fontWeight: '600' }}>{errorMsg}</p>
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
    <React.Suspense fallback={
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
        <Clock size={40} className="animate-spin" style={{ margin: '0 auto 12px auto', color: 'var(--accent-primary)' }} />
        <h3>Səhifə yüklənir...</h3>
      </div>
    }>
      <ProductsContent />
    </React.Suspense>
  );
}
