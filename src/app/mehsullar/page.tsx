'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header, Footer } from '@/components/Navigation';
import { ProductCard } from '@/components/ProductCard';
import { MOCK_PRODUCTS, Product } from '@/lib/mockData';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

import { useCart } from '@/context/CartContext';

export default function ProductsPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('Bütün');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'rating'>('default');

  const categories = ['Bütün', 'Qonaq Otağı', 'Yataq Otağı', 'Mətbəx'];

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

          {/* Product Grid / Row Layout */}
          {filteredProducts.length > 0 ? (
            <div className="grid-responsive-products">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} onAddToCart={handleAddToCart} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
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
