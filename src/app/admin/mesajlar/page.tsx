'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, MailOpen, Phone, MessageCircle, Archive, Trash2, ArrowLeft, Send } from 'lucide-react';
import '@/app/admin/admin.css';

interface ContactMessage {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  is_read: boolean;
  date: string;
}

const MOCK_MESSAGES: ContactMessage[] = [
  {
    id: '1',
    full_name: 'Kamran Məmmədov',
    email: 'kamran@example.com',
    phone: '+994 50 111 22 33',
    subject: 'Xüsusi Mebel Sifarişi',
    message: 'Salam, 3 metrlik xüsusi ölçülü palıd yemək masası sifariş etmək istəyirik. Mağazanızda nümunəyə baxmaq mümkündür?',
    is_read: false,
    date: '10:45',
  },
  {
    id: '2',
    full_name: 'Sevinc Əliyeva',
    email: 'sevinc@example.com',
    phone: '+994 55 444 55 66',
    subject: 'Məhsul haqqında sual',
    message: 'Minimalist Velvet divanın digər rəng seçimləri (məsələn, boz və ya göy) mövcuddurmu?',
    is_read: false,
    date: 'Dünən',
  },
  {
    id: '3',
    full_name: 'Elnur Qasımov',
    email: 'elnur@example.com',
    phone: '+994 70 888 99 00',
    subject: 'Təklif və əməkdaşlıq',
    message: 'Salam, biz tikinti və interyer dizayn studiyasıyıq. Korporativ əməkdaşlıq şərtlərinizlə tanış olmaq istərdik.',
    is_read: true,
    date: '26 İyul',
  },
];

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>(MOCK_MESSAGES);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(MOCK_MESSAGES[0]);

  // Supabase Fetch
  useEffect(() => {
    async function loadMessages() {
      try {
        const { data, error } = await supabase.from('contact_messages').select('*');
        if (data && data.length > 0 && !error) {
          setMessages(data as any);
          setSelectedMessage(data[0] as any);
        }
      } catch (err) {
        console.log('Using mock messages data');
      }
    }
    loadMessages();
  }, []);

  const unreadCount = messages.filter((m) => !m.is_read).length;

  const handleSelectMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (!msg.is_read) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m))
      );
      try {
        await supabase.from('contact_messages').update({ is_read: true }).eq('id', msg.id);
      } catch (err) {}
    }
  };

  const handleDeleteMessage = async (id: string) => {
    const updated = messages.filter((m) => m.id !== id);
    setMessages(updated);
    if (selectedMessage?.id === id) {
      setSelectedMessage(updated[0] || null);
    }
    try {
      await supabase.from('contact_messages').delete().eq('id', id);
    } catch (err) {}
  };

  return (
    <div>
      {/* Üst Bar */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '600' }}>Əlaqə Mesajları</h2>
        <p style={{ color: 'var(--admin-text-sub)', fontSize: '0.9rem' }}>Müştərilərdən gələn sual və təklifləri oxuyun və cavablandırın</p>
      </div>

      {/* INBOX 2 SÜTUNLU LAYOUT (Sol siyahı, Sağ mesaj detalı) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', minHeight: '600px' }}>
        {/* SOL SÜTUN (5 Sütun): Mesaj Siyahısı */}
        <div style={{ gridColumn: 'span 5', backgroundColor: 'white', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', overflow: 'hidden', boxShadow: 'var(--admin-shadow)' }}>
          <div style={{ padding: '16px 20px', backgroundColor: '#FAF7F2', borderBottom: '1px solid var(--admin-border)', fontWeight: '600', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Gələn Mesajlar</span>
            {unreadCount > 0 && (
              <span style={{ backgroundColor: 'var(--admin-warning)', color: 'white', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '999px' }}>
                {unreadCount} oxunmamış
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleSelectMessage(msg)}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--admin-border)',
                  cursor: 'pointer',
                  backgroundColor: selectedMessage?.id === msg.id ? '#F5EFE6' : msg.is_read ? 'white' : '#FCFBF9',
                  transition: 'background-color 150ms ease',
                  position: 'relative',
                }}
              >
                {/* Oxunmamış Qızılı Nöqtə Indicator */}
                {!msg.is_read && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '8px',
                      top: '22px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--admin-warning)',
                    }}
                  />
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.92rem', fontWeight: msg.is_read ? '500' : '700' }}>{msg.full_name}</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-sub)' }}>{msg.date}</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: msg.is_read ? '500' : '600', color: 'var(--admin-accent)', marginBottom: '4px' }}>
                  {msg.subject}
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-sub)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {msg.message}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* SAĞ SÜTUN (7 Sütun): Seçilmiş Mesajın Tam Detalı */}
        <div style={{ gridColumn: 'span 7', backgroundColor: 'white', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', padding: '28px', boxShadow: 'var(--admin-shadow)', display: 'flex', flexDirection: 'column' }}>
          {selectedMessage ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Header Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--admin-border)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '2px' }}>{selectedMessage.subject}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--admin-text-sub)' }}>Tarix: {selectedMessage.date}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button class="admin-action-btn delete" onClick={() => handleDeleteMessage(selectedMessage.id)} title="Mesajı Sil">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Göndərən Məlumatı */}
              <div style={{ backgroundColor: 'var(--admin-bg)', padding: '16px', borderRadius: 'var(--admin-radius)', marginBottom: '24px', fontSize: '0.9rem' }}>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Göndərən:</strong> {selectedMessage.full_name}
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Email:</strong> <a href={`mailto:${selectedMessage.email}`} style={{ color: 'var(--admin-accent)' }}>{selectedMessage.email}</a>
                </div>
                {selectedMessage.phone && (
                  <div>
                    <strong>Tel:</strong> <a href={`tel:${selectedMessage.phone}`} style={{ color: 'var(--admin-accent)' }}>{selectedMessage.phone}</a>
                  </div>
                )}
              </div>

              {/* Tam Mesaj Mətni */}
              <div style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--admin-text-main)', flexGrow: 1, marginBottom: '28px' }}>
                {selectedMessage.message}
              </div>

              {/* Cavab Yaz Düymələri */}
              <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '20px', display: 'flex', gap: '12px' }}>
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                  class="btn btn-primary"
                  style={{ textDecoration: 'none', padding: '12px 24px', fontSize: '0.9rem' }}
                >
                  <Send size={16} /> Email ilə Cavab Yaz
                </a>

                {selectedMessage.phone && (
                  <a
                    href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    class="btn"
                    style={{ backgroundColor: '#25D366', color: 'white', textDecoration: 'none', padding: '12px 24px', fontSize: '0.9rem' }}
                  >
                    <MessageCircle size={16} /> WhatsApp ilə Yaz
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--admin-text-sub)' }}>
              <Mail size={48} style={{ marginBottom: '12px' }} />
              <p>Baxmaq üçün soldan bir mesaj seçin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
