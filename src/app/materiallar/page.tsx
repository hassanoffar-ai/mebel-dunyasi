import Link from 'next/link';
import { Header, Footer } from '@/components/Navigation';
import { TreePine, Armchair, Palette, Sparkles } from 'lucide-react';

const MATERIALS = [
  {
    icon: TreePine,
    title: 'Təbii Ağac',
    text: 'Palıd və qoz ağacından hazırlanan mebellər möhkəmliyi, təbii teksturası və uzunömürlü görünüşü ilə seçilir.',
    examples: 'Palıd · Qoz · Fıstıq',
  },
  {
    icon: Armchair,
    title: 'Parça və Dəri',
    text: 'Rahatlıq və gündəlik istifadə üçün seçilən parçalar, eləcə də zərif görünüşlü dəri örtüklər fərqli interyerlərə uyğunlaşdırılır.',
    examples: 'Kətan · Məxmər · Dəri',
  },
  {
    icon: Palette,
    title: 'Rəng və Örtüklər',
    text: 'Təbii ağac tonları, mat səthlər və müasir rənglər kolleksiyaların üslubuna uyğun diqqətlə seçilir.',
    examples: 'Təbii tonlar · Mat səthlər · Rəng seçimləri',
  },
];

export default function MaterialsPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      <Header />
      <main style={{ flexGrow: 1 }}>
        <section style={{ background: 'linear-gradient(135deg, #2B1D14, #5A3A23)', color: 'white', padding: '84px 20px', textAlign: 'center' }}>
          <Sparkles size={32} color="var(--accent-gold)" style={{ marginBottom: '14px' }} />
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.3rem, 5vw, 3.8rem)', marginBottom: '14px' }}>Materiallar</h1>
          <p style={{ maxWidth: '620px', margin: '0 auto', color: '#E5D9C7', fontSize: '1.08rem', lineHeight: 1.7 }}>
            Mebellərimizdə istifadə olunan seçilmiş materialları kəşf edin.
          </p>
        </section>

        <section style={{ padding: '72px 0 88px' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              {MATERIALS.map(({ icon: Icon, title, text, examples }) => (
                <article key={title} style={{ background: 'var(--white)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '30px', boxShadow: 'var(--shadow-diffuse)' }}>
                  <div style={{ width: '54px', height: '54px', display: 'grid', placeItems: 'center', borderRadius: '50%', background: 'var(--bg-secondary)', color: 'var(--accent-primary)', marginBottom: '20px' }}>
                    <Icon size={27} />
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '12px' }}>{title}</h2>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '18px' }}>{text}</p>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.88rem' }}>{examples}</span>
                </article>
              ))}
            </div>
            <div style={{ marginTop: '48px', padding: '30px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.7rem', marginBottom: '10px' }}>Material seçimi üçün dəstək</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Məkanınıza və zövqünüzə uyğun material seçimində sizə kömək edək.</p>
              <Link href="/elaqe" className="btn btn-primary">Bizimlə Əlaqə Saxlayın</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
