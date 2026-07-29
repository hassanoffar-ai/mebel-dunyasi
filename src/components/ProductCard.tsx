'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { Product } from '@/lib/mockData';
import { useWishlist } from '@/context/WishlistContext';
import { optimizeImageUrl } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onToggleWishlist?: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart, onToggleWishlist }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product);
    if (onToggleWishlist) {
      onToggleWishlist(product.id);
    }
  };

  return (
    <div className="product-card">
      {/* Şəkil və Wishlist İkonu */}
      <div className="product-img-wrapper">
        <Link href={`/mehsullar/${product.id}`}>
          <img 
            src={optimizeImageUrl(product.image_url, 400)} 
            alt={product.name} 
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80';
            }}
          />
        </Link>
        <button
          className="product-wishlist-btn"
          onClick={handleWishlistClick}
          title={isWishlisted ? 'Sevimlilərdən çıxar' : 'Sevimlilərə əlavə et'}
          style={{ color: isWishlisted ? 'var(--error-color)' : 'var(--text-main)' }}
        >
          <Heart size={18} fill={isWishlisted ? 'var(--error-color)' : 'none'} />
        </button>
      </div>

      {/* Məhsul Məzmunu */}
      <div className="product-content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div className="product-category" style={{ fontSize: '0.75rem' }}>{product.category}</div>
          <Link href={`/mehsullar/${product.id}`}>
            <h3 className="product-title" style={{ fontSize: '1rem', margin: 0 }}>{product.name}</h3>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <Star size={13} fill="#C9A15D" color="#C9A15D" />
            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{product.rating}</span>
            <span>({product.reviews_count})</span>
          </div>
        </div>

        {/* Qiymət və Səbət Düyməsi */}
        <div className="product-price-row" style={{ marginTop: 0, gap: '12px', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <span className="product-price" style={{ fontSize: '1.05rem' }}>{product.price} ₼</span>
            {product.old_price && <div className="product-old-price" style={{ fontSize: '0.8rem' }}>{product.old_price} ₼</div>}
          </div>
          <button
            className="btn btn-gold"
            style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
            onClick={() => onAddToCart(product)}
            title="Səbətə Əlavə Et"
          >
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
