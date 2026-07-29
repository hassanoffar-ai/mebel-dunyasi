'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Header, Footer } from '@/components/Navigation';
import { ShoppingBag, Calendar, MapPin, Phone, CreditCard, ChevronDown, ChevronUp, User, LogOut, ArrowRight, Package } from 'lucide-react';
import { toClientStatus } from '@/lib/statusHelper';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadUserDataAndOrders() {
      try {
        setLoading(true);
        // 1. Get Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        let currentUser = session?.user || null;

        // Fallback: Get mock user session
        if (!currentUser) {
          const mockUserStr = localStorage.getItem('mebel_user_session');
          if (mockUserStr) {
            try {
              currentUser = JSON.parse(mockUserStr);
            } catch (e) {}
          }
        }

        if (!currentUser) {
          router.push('/login?redirect=/profil');
          return;
        }

        setUser(currentUser);

        // 2. Fetch orders from backend API to bypass RLS limitations
        const emailParam = currentUser.email ? encodeURIComponent(currentUser.email) : '';
        const userIdParam = currentUser.id ? encodeURIComponent(currentUser.id) : '';
        
        const res = await fetch(`/api/orders?email=${emailParam}&user_id=${userIdParam}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setOrders(json.data);
          }
        }
      } catch (err) {
        console.error('Error loading profile data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserDataAndOrders();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('mebel_user_session');
    router.push('/');
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getStatusLabel = (status: string) => {
    const clientStatus = toClientStatus(status);
    const labels: Record<string, string> = {
      pending: 'Gözləmədə',
      confirmed: 'Təsdiqləndi',
      processing: 'Hazırlanır',
      shipped: 'Göndərildi',
      delivered: 'Çatdırıldı',
      cancelled: 'Ləğv Edildi',
    };
    return labels[clientStatus] || status;
  };

  const getStatusColor = (status: string) => {
    const clientStatus = toClientStatus(status);
    switch (clientStatus) {
      case 'confirmed':
      case 'delivered':
        return { bg: '#E6F4EA', text: '#137333' };
      case 'cancelled':
        return { bg: '#FCE8E6', text: '#C5221F' };
      case 'processing':
      case 'shipped':
        return { bg: '#FEF7E0', text: '#B06000' };
      default:
        return { bg: '#F1F3F4', text: '#5F6368' };
    }
  };

  return (
    <>
      <Header />
      <main className="profile-page-wrapper" style={{ minHeight: '80vh', backgroundColor: '#F8F9FA', padding: '40px 0' }}>
        <div className="container">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <div className="loader" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid var(--gold-color)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '30px', alignItems: 'start' }}>
              
              {/* Left Profile card */}
              <div style={{ backgroundColor: 'var(--white)', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ backgroundColor: '#F0E6D8', color: 'var(--gold-color)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
                    <User size={36} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-color)', marginBottom: '4px' }}>
                    {user?.user_metadata?.full_name || 'Dəyərli Müştəri'}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{user?.email}</p>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  {user?.user_metadata?.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--text-color)', fontSize: '0.95rem' }}>
                      <Phone size={18} style={{ color: 'var(--gold-color)' }} />
                      <span>{user.user_metadata.phone}</span>
                    </div>
                  )}
                  <button 
                    onClick={handleLogout}
                    style={{ 
                      width: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px', 
                      padding: '10px', 
                      border: '1px solid #D9534F', 
                      borderRadius: '8px', 
                      backgroundColor: 'transparent', 
                      color: '#D9534F', 
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#D9534F';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#D9534F';
                    }}
                  >
                    <LogOut size={18} />
                    Çıxış Et
                  </button>
                </div>
              </div>

              {/* Right Orders List */}
              <div style={{ backgroundColor: 'var(--white)', padding: '35px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-color)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShoppingBag size={24} style={{ color: 'var(--gold-color)' }} />
                  Sifarişlərim
                </h2>

                {orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Package size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '20px' }}>Hələ ki heç bir sifarişiniz yoxdur.</p>
                    <Link href="/mehsullar" className="btn btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', textDecoration: 'none' }}>
                      Alış-verişə Başla <ArrowRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {orders.map((order) => {
                      const isExpanded = !!expandedOrders[order.id];
                      const statusColor = getStatusColor(order.status);
                      const displayId = `MD-${order.id.slice(0, 6).toUpperCase()}`;

                      return (
                        <div 
                          key={order.id} 
                          style={{ 
                            border: '1px solid var(--border-color)', 
                            borderRadius: '8px', 
                            overflow: 'hidden',
                            transition: 'box-shadow 0.2s'
                          }}
                        >
                          {/* Order Header Summary */}
                          <div 
                            onClick={() => toggleOrderExpand(order.id)}
                            style={{ 
                              padding: '20px', 
                              backgroundColor: '#FAF7F4', 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                          >
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
                              <div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Sifariş Nömrəsi</span>
                                <span style={{ fontWeight: '700', color: 'var(--text-color)' }}>{displayId}</span>
                              </div>
                              <div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Tarix</span>
                                <span style={{ fontSize: '0.95rem', color: 'var(--text-color)' }}>
                                  {new Date(order.created_at).toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                              </div>
                              <div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Məbləğ</span>
                                <span style={{ fontWeight: '700', color: 'var(--gold-color)' }}>{Number(order.umumi_meblegh).toFixed(2)} AZN</span>
                              </div>
                              <div>
                                <span 
                                  style={{ 
                                    display: 'inline-block', 
                                    padding: '4px 12px', 
                                    borderRadius: '50px', 
                                    fontSize: '0.8rem', 
                                    fontWeight: '600', 
                                    backgroundColor: statusColor.bg, 
                                    color: statusColor.text 
                                  }}
                                >
                                  {getStatusLabel(order.status)}
                                </span>
                              </div>
                            </div>
                            <div style={{ color: 'var(--text-muted)' }}>
                              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                          </div>

                          {/* Order Expanded Details */}
                          {isExpanded && (
                            <div style={{ padding: '20px', backgroundColor: 'var(--white)', borderTop: '1px solid var(--border-color)' }}>
                              
                              {/* Order Delivery Information */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px dashed var(--border-color)' }}>
                                <div style={{ display: 'flex', gap: '8px', color: 'var(--text-color)', fontSize: '0.9rem' }}>
                                  <Phone size={16} style={{ color: 'var(--gold-color)', marginTop: '2px', flexShrink: 0 }} />
                                  <div>
                                    <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Əlaqə Telefonu</span>
                                    {order.telefon}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', color: 'var(--text-color)', fontSize: '0.9rem' }}>
                                  <MapPin size={16} style={{ color: 'var(--gold-color)', marginTop: '2px', flexShrink: 0 }} />
                                  <div>
                                    <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Çatdırılma Ünvanı</span>
                                    {order.catdirilma_unvani}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', color: 'var(--text-color)', fontSize: '0.9rem' }}>
                                  <CreditCard size={16} style={{ color: 'var(--gold-color)', marginTop: '2px', flexShrink: 0 }} />
                                  <div>
                                    <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Ödəniş Metodu</span>
                                    {order.odenis_usulu}
                                  </div>
                                </div>
                              </div>

                              {/* Products List in the Order */}
                              <div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-color)', marginBottom: '12px' }}>Sifariş Edilən Məhsullar</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  {order.order_items && order.order_items.length > 0 ? (
                                    order.order_items.map((item: any) => {
                                      const p = item.products;
                                      const mainImg = p?.product_images?.find((img: any) => img.esas_sekil)?.sekil_url || p?.product_images?.[0]?.sekil_url || '/placeholder.png';
                                      
                                      return (
                                        <div 
                                          key={item.id} 
                                          style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            padding: '10px 0',
                                            borderBottom: '1px solid #F1F3F4'
                                          }}
                                        >
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <div style={{ width: '50px', height: '50px', backgroundColor: '#F8F9FA', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative', flexShrink: 0 }}>
                                              <img 
                                                src={mainImg} 
                                                alt={p?.ad || 'Məhsul'} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => {
                                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=200';
                                                }}
                                              />
                                            </div>
                                            <div>
                                              <span style={{ fontWeight: '600', color: 'var(--text-color)', display: 'block', fontSize: '0.95rem' }}>{p?.ad || 'Məhsul'}</span>
                                              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.say} ədəd × {Number(item.vahid_qiymet).toFixed(2)} AZN</span>
                                            </div>
                                          </div>
                                          <span style={{ fontWeight: '600', color: 'var(--text-color)' }}>
                                            {(Number(item.say) * Number(item.vahid_qiymet)).toFixed(2)} AZN
                                          </span>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Məhsul məlumatları mövcud deyil.</div>
                                  )}
                                </div>
                              </div>

                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

            </div>
          )}
        </div>
      </main>
      <Footer />
      
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
