'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Header, Footer } from '@/components/Navigation';
import { ProductCard } from '@/components/ProductCard';
import { MOCK_PRODUCTS, Product } from '@/lib/mockData';
import { supabase } from '@/lib/supabase';
import { Star, Heart, ShoppingBag, Truck, ShieldCheck, RotateCcw, Check, Plus, Minus, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { optimizeImageUrl } from '@/lib/utils';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = (params?.id as string) || '1';

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('İsti Bej');
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  // Form State for Review
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatusMsg, setReviewStatusMsg] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addedToCartMsg, setAddedToCartMsg] = useState(false);

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const isWishlisted = product ? isInWishlist(product.id) : false;
  const [loading, setLoading] = useState(true);
  const [approvedReviews, setApprovedReviews] = useState<any[]>([]);

  // Initial Product Data Fetch
  useEffect(() => {
    async function getProduct() {
      setLoading(true);
      try {
        let activeProduct: Product | null = null;
        
        // Fetch independent data concurrently to avoid a request waterfall.
        const [{ data: p, error }, { data: relData }] = await Promise.all([
          supabase.from('products').select('*, product_images(*)').eq('id', productId).maybeSingle(),
          supabase.from('products').select('*, product_images(*)').neq('id', productId).limit(4),
        ]);
        
        if (p && !error) {
          const productImages = p.product_images ? [...p.product_images].sort((a: any, b: any) => (a.sira || 0) - (b.sira || 0)) : [];

          const pImgs = productImages.length > 0 ? productImages.map((img: any) => img.sekil_url) : (p.xususiyyetler?.images || p.images || [p.xususiyyetler?.image_url || p.image_url || p.sekil_url]);
          const mainImg = productImages.find((img: any) => img.esas_sekil)?.sekil_url || pImgs[0] || p.xususiyyetler?.image_url || p.image_url || p.sekil_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=60';

          activeProduct = {
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
            images: pImgs,
            rating: p.rating || 5.0,
            reviews_count: p.reviews_count || 0,
          };
        }

        // 2. Try to fallback to localStorage if database query failed or row doesn't exist yet
        if (!activeProduct) {
          try {
            const stored = localStorage.getItem('local_added_products');
            if (stored) {
              const localList: Product[] = JSON.parse(stored);
              const found = localList.find((lp) => lp.id === productId);
              if (found) {
                activeProduct = found;
              }
            }
          } catch (e) {}
        }

        if (activeProduct) {
          setProduct(activeProduct);
          setSelectedImage(activeProduct.image_url);

          if (relData && relData.length > 0) {
            const mappedRel: Product[] = relData.map((p: any) => {
              const pImgs = p.product_images ? [...p.product_images].sort((a: any, b: any) => (a.sira || 0) - (b.sira || 0)) : [];
              const mainImg = pImgs.find((img: any) => img.esas_sekil)?.sekil_url || pImgs[0]?.sekil_url || p.xususiyyetler?.image_url || p.image_url || p.sekil_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=60';
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
                images: [mainImg],
                rating: p.rating || 5.0,
                reviews_count: p.reviews_count || 0,
              };
            });
            setRelatedProducts(mappedRel);
          }
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.log('Error fetching product data:', err);
      } finally {
        setLoading(false);
      }
    }
    getProduct();
  }, [productId]);

  // Fetch approved reviews
  useEffect(() => {
    async function loadProductReviews() {
      if (!productId) return;
      try {
        const { data } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', productId)
          .or('status.eq.tesdiqlendi,status.eq.confirmed')
          .order('created_at', { ascending: false });

        if (data) setApprovedReviews(data);
      } catch (err) {}
    }
    loadProductReviews();
  }, [productId]);

  if (loading) {
    return <div style={{ padding: '80px', textAlign: 'center' }}>Yüklənir...</div>;
  }

  if (!product) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
        <Header />
        <main style={{ flexGrow: 1, padding: '80px 20px', textAlign: 'center' }}>
          <h2>Məhsul tapılmadı</h2>
          <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Axtardığınız məhsul mövcud deyil və ya ləğv edilib.</p>
          <Link href="/mehsullar" className="btn btn-gold" style={{ marginTop: '24px', display: 'inline-block' }}>
            Məhsullara Qayıt
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Thumbnails gallery (product images from DB)
  const thumbnails = (product.images && product.images.length > 0 ? product.images : [product.image_url]).filter(Boolean);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewStatusMsg('');

    try {
      const { data: authData } = await supabase.auth.getUser();
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          user_id: authData.user?.id,
          user_name: reviewName,
          user_email: authData.user?.email,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Rəy göndərilə bilmədi.');

      setReviewStatusMsg('Rəyiniz göndərildi, admin təsdiqindən sonra dərc olunacaq.');
      setReviewName('');
      setReviewComment('');
    } catch (err: any) {
      setReviewStatusMsg(`Rəy göndərilə bilmədi: ${err.message || 'yenidən cəhd edin.'}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Header />

      <main style={{ flexGrow: 1, padding: '40px 0 80px 0' }}>
        <div className="container">
          {/* 1. BREADCRUMB */}
          <nav style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
            <Link href="/" style={{ color: 'var(--text-muted)' }}>Ana Səhifə</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link href="/#products" style={{ color: 'var(--text-muted)' }}>{product.category}</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{product.name}</span>
          </nav>

          {/* 2. ƏSAS BÖLMƏ (2 Sütun) */}
          <div className="product-detail-grid">
            {/* SOL: Şəkil Qalereyası */}
            <div className="product-detail-col-left">
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  maxWidth: '460px',
                  maxHeight: '480px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg-secondary)',
                  margin: '0 auto 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <img
                  src={optimizeImageUrl(selectedImage, 800)}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-md)',
                    transition: 'transform 400ms ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <button
                  className="product-wishlist-btn"
                  onClick={() => product && toggleWishlist(product)}
                  title={isWishlisted ? 'Sevimlilərdən çıxar' : 'Sevimlilərə əlavə et'}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    color: isWishlisted ? 'var(--error-color)' : 'var(--text-main)',
                  }}
                >
                  <Heart size={20} fill={isWishlisted ? 'var(--error-color)' : 'none'} />
                </button>
              </div>

              {/* Thumbnails (Only show if there are multiple images) */}
              {thumbnails.length > 1 && (
                <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {thumbnails.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        border: selectedImage === img ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <img src={optimizeImageUrl(img, 150)} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SAĞ: Məhsul Məlumatları */}
            <div className="product-detail-col-right" style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-serif)', marginBottom: '12px', lineHeight: 1.2 }}>
                {product.name}
              </h1>

              {/* Reytinq */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', cursor: 'pointer' }}
                onClick={() => setActiveTab('reviews')}
              >
                <div style={{ display: 'flex', color: '#C9A15D' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="#C9A15D" />
                  ))}
                </div>
                <span style={{ fontWeight: '600' }}>{product.rating}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>({product.reviews_count} müştəri rəyi)</span>
              </div>

              {/* Qiymət */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <span style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent-gold)' }}>
                  {product.price} ₼
                </span>
                {product.old_price && (
                  <span style={{ fontSize: '1.2rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                    {product.old_price} ₼
                  </span>
                )}
              </div>

              {/* Qısa Təsvir */}
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '28px' }}>
                Yüksək keyfiyyətli təbii materiallardan hazırlanmış minimalist və müasir mebel parçası. Evinizin interyerinə zəriflik və komfort qatır.
              </p>

              {/* Rəng Seçimi */}
              <div style={{ marginBottom: '24px' }}>
                <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '10px' }}>
                  Rəng Seçimi: <span style={{ color: 'var(--accent-primary)' }}>{selectedColor}</span>
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['İsti Bej', 'Klassik Qəhvəyi', 'Krem'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-sm)',
                        border: selectedColor === color ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        backgroundColor: selectedColor === color ? 'var(--bg-secondary)' : 'var(--white)',
                        fontWeight: '500',
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Say Seçici & Stok Statusu */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--white)',
                  }}
                >
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={{ padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer' }}
                  >
                    <Minus size={16} />
                  </button>
                  <span style={{ width: '40px', textAlign: 'center', fontWeight: '600' }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    style={{ padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success-color)', fontSize: '0.9rem', fontWeight: '600' }}>
                  <Check size={18} />
                  <span>Stokda var</span>
                </div>
              </div>

              {/* Düymələr */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '36px' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '14px 24px' }}
                  onClick={() => {
                    if (product) {
                      addToCart(product, quantity, selectedColor);
                      setAddedToCartMsg(true);
                      setTimeout(() => setAddedToCartMsg(false), 3000);
                    }
                  }}
                >
                  <ShoppingBag size={20} />
                  Səbətə Əlavə Et
                </button>
              </div>

              {addedToCartMsg && (
                <div
                  style={{
                    backgroundColor: 'var(--success-bg)',
                    color: 'var(--success-color)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    border: '1px solid var(--success-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} />
                    <span>Məhsul səbətə əlavə olundu!</span>
                  </div>
                  <Link href="/sebet" style={{ color: 'var(--success-color)', textDecoration: 'underline' }}>
                    Səbətə Bax
                  </Link>
                </div>
              )}

              {/* Əlavə Məlumat İkonları */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <Truck size={18} color="var(--accent-primary)" />
                  <span>Bakı şəhəri daxilində <strong>Pulsuz Çatdırılma</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <ShieldCheck size={18} color="var(--accent-primary)" />
                  <span>2 İllik <strong>Rəsmi Zəmanət</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <RotateCcw size={18} color="var(--accent-primary)" />
                  <span>14 gün ərzində <strong>Rahat Qaytarma Şərti</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. TAB BÖLMƏSİ */}
          <div style={{ marginBottom: '80px', backgroundColor: 'var(--white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '32px', boxShadow: 'var(--shadow-diffuse)' }}>
            <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '28px' }}>
              <button
                onClick={() => setActiveTab('desc')}
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: activeTab === 'desc' ? 'var(--accent-primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'desc' ? '2px solid var(--accent-gold)' : 'none',
                  paddingBottom: '8px',
                  cursor: 'pointer',
                  background: 'none',
                  borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                }}
              >
                Təsvir
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: activeTab === 'specs' ? 'var(--accent-primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'specs' ? '2px solid var(--accent-gold)' : 'none',
                  paddingBottom: '8px',
                  cursor: 'pointer',
                  background: 'none',
                  borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                }}
              >
                Xüsusiyyətlər
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: activeTab === 'reviews' ? 'var(--accent-primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'reviews' ? '2px solid var(--accent-gold)' : 'none',
                  paddingBottom: '8px',
                  cursor: 'pointer',
                  background: 'none',
                  borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                }}
              >
                Rəylər ({product.reviews_count})
              </button>
            </div>

            {/* TAB CONTENT: Təsvir */}
            {activeTab === 'desc' && (
              <div style={{ lineHeight: 1.8, color: 'var(--text-muted)' }}>
                <p style={{ marginBottom: '16px' }}>
                  Bu mebel kolleksiyası modern interyerləriniz üçün estetik zəriflik və maksimal funksionallığı özündə birləşdirir. Hər bir detal xüsusi ustalıqla hazırlanmış və yüksək keyfiyyət standartlarına cavab verir.
                </p>
                <p>
                  Dayanıqlı karkas yapısı və asan təmizlənən premium parça örtüyü uzunömürlü istifadəni təmin edir. Ətraf mühitə zərərsiz təbii cilalama materialları istifadə olunmuşdur.
                </p>
              </div>
            )}

            {/* TAB CONTENT: Xüsusiyyətlər */}
            {activeTab === 'specs' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 0', fontWeight: '600', width: '200px' }}>Material:</td>
                    <td style={{ color: 'var(--text-muted)' }}>Təbii Palıd Ağacı / Premium Velvet Parça</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 0', fontWeight: '600' }}>Ölçülər (E x H x D):</td>
                    <td style={{ color: 'var(--text-muted)' }}>220 sm x 85 sm x 95 sm</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 0', fontWeight: '600' }}>İstehsalçı Ölkə:</td>
                    <td style={{ color: 'var(--text-muted)' }}>Türkiyə / Avropa Standartı</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 0', fontWeight: '600' }}>Zəmanət Müddəti:</td>
                    <td style={{ color: 'var(--text-muted)' }}>24 Ay</td>
                  </tr>
                </tbody>
              </table>
            )}

            {/* TAB CONTENT: Rəylər & Rəy Forması */}
            {activeTab === 'reviews' && (
              <div>
                {/* Mövcud Təsdiqlənmiş Rəylər Siyahısı */}
                <div style={{ marginBottom: '40px' }}>
                  {approvedReviews.length === 0 ? (
                    <div style={{ padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                      Hələ ki bu məhsul üçün təsdiqlənmiş rəy yoxdur. İlk rəyi siz yazın!
                    </div>
                  ) : (
                    approvedReviews.map((rev) => {
                      let displayName = rev.user_name || rev.ad_soyad || 'Müştəri';
                      let displayComment = rev.metn || rev.comment || '';
                      try {
                        if (rev.metn && rev.metn.startsWith('{')) {
                          const parsed = JSON.parse(rev.metn);
                          displayName = parsed.user_name || displayName;
                          displayComment = parsed.comment || displayComment;
                        }
                      } catch (e) {}
                      
                      return (
                        <div key={rev.id} style={{ padding: '20px 0', borderBottom: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '600' }}>{displayName}</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              {rev.created_at ? new Date(rev.created_at).toLocaleDateString('az-AZ') : 'Təsdiqlənib'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', color: '#C9A15D', marginBottom: '8px' }}>
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} fill={i < (rev.ulduz || rev.rating || 5) ? '#C9A15D' : 'none'} color="#C9A15D" />
                            ))}
                          </div>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            "{displayComment}"
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Rəy Yaz Forması */}
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '28px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '16px' }}>Rəy Yazın</h3>

                  {reviewStatusMsg && (
                    <div className="alert alert-success" style={{ marginBottom: '20px' }}>
                      <CheckCircle2 size={18} />
                      <span>{reviewStatusMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleReviewSubmit}>
                    <div className="form-group">
                      <label className="form-label">Ulduz Qiymətləndirməsi</label>
                      <div style={{ display: 'flex', gap: '6px', cursor: 'pointer' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={24}
                            fill={star <= reviewRating ? '#C9A15D' : 'none'}
                            color="#C9A15D"
                            onClick={() => setReviewRating(star)}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Ad və Soyadınız</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Nümunə: Aysel Əliyeva"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Rəyiniz</label>
                      <textarea
                        className="form-input"
                        rows={4}
                        placeholder="Məhsul haqqında fikirlərinizi bölüşün..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                      <Send size={16} />
                      {submittingReview ? 'Göndərilir...' : 'Rəyi Göndər'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* 4. "BUNLARI DA BƏYƏNƏ BİLƏRSİNİZ" BÖLMƏSİ */}
          <div>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', marginBottom: '32px' }}>
              Bunları da Bəyənə Bilərsiniz
            </h2>
            <div className="product-grid">
              {relatedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} onAddToCart={(p) => addToCart(p)} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
