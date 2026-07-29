import Link from 'next/link';
import { Header, Footer } from '@/components/Navigation';
import { TreePine, Armchair, Palette, Sparkles } from 'lucide-react';

const MATERIALS = [
  {
    icon: TreePine,
    title: 'Təbii Ağac',
    image: 'https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=900&q=85',
    text: 'Palıd və qoz ağacının təbii teksturası hər mebelə özünəməxsus xarakter verir. Seçilmiş ağaclarımız davamlılıq və zamansız görünüş üçün işlənir.',
    examples: 'Palıd · Qoz · Fıstıq',
  },
  {
    icon: Armchair,
    title: 'Parça və Dəri',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85',
    text: 'Yumşaq kətan, məxmər və seçilmiş dəri örtüklər rahat toxunuş, dərin rəng və gündəlik istifadə üçün uyğun balans yaradır.',
    examples: 'Kətan · Məxmər · Dəri',
  },
  {
    icon: Palette,
    title: 'Rəng və Örtüklər',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85',
    text: 'İsti neytral tonlar, mat səthlər və təbii ağac rəngləri interyerinizlə asan uyğunlaşan sakit və zərif harmoniya yaradır.',
    examples: 'Təbii tonlar · Mat səthlər · Rəng seçimləri',
  },
];

export default function MaterialsPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      <Header />
      <main style={{ flexGrow: 1 }}>
        <section style={{ position: 'relative', overflow: 'hidden', minHeight: '410px', display: 'grid', placeItems: 'center', textAlign: 'center', padding: '84px 20px' }}>
          <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=85" alt="Açıq tonlu mebel interyeri" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(1.18) saturate(0.75)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(252, 248, 242, 0.76)' }} />
          <div style={{ position: 'relative', maxWidth: '720px' }}>
            <Sparkles size={32} color="var(--accent-primary)" style={{ marginBottom: '14px' }} />
            <span style={{ display: 'block', color: 'var(--accent-primary)', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', marginBottom: '12px' }}>Mebel Dünyası seçimi</span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.4rem, 5vw, 4rem)', color: 'var(--text-main)', marginBottom: '14px' }}>Materiallar</h1>
            <p style={{ margin: '0 auto', color: 'var(--text-muted)', fontSize: '1.08rem', lineHeight: 1.7 }}>
              Hər detalda təbiiliyi, rahatlığı və uzunmüddətli keyfiyyəti önə çəkən seçilmiş materiallar.
            </p>
          </div>
        </section>

        <section style={{ padding: '72px 0 88px' }}>
          <div className="container">
            <div style={{ maxWidth: '760px', textAlign: 'center', margin: '0 auto 42px' }}>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Keyfiyyəti hiss edin</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.9rem, 4vw, 2.7rem)', margin: '10px 0 14px' }}>Eviniz üçün doğru material seçimi</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>Dizaynın gözəlliyi yalnız görünüşdən ibarət deyil — toxunduğunuz, istifadə etdiyiniz və illərlə yaşatdığınız materiallardan başlayır.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '24px' }}>
              {MATERIALS.map(({ icon: Icon, title, text, examples, image }) => (
                <article key={title} style={{ background: 'var(--white)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-diffuse)' }}>
                  <img src={image} alt={title} style={{ width: '100%', height: '205px', objectFit: 'cover', filter: 'brightness(1.08) saturate(0.82)' }} />
                  <div style={{ padding: '28px' }}>
                  <div style={{ width: '50px', height: '50px', display: 'grid', placeItems: 'center', borderRadius: '50%', background: 'var(--bg-secondary)', color: 'var(--accent-primary)', marginBottom: '18px' }}>
                    <Icon size={27} />
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '12px' }}>{title}</h2>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '18px' }}>{text}</p>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.88rem' }}>{examples}</span>
                  </div>
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
