// app/[locale]/page.tsx
import { getDatabase, KontenData } from '@/lib/db';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { use } from 'react';
import InteractiveCoin from './InteractiveCoin'; // Mengimpor koin interaktif

interface Props {
  params: Promise<{ locale: string }>;
}

export default function HomePage({ params }: Props) {
  // Unwrapping params secara asinkron di Server Component
  const { locale } = use(params);
  
  // Mengambil database langsung di server side
  const db = use(getDatabase());
  const dataHalaman = db.data.konten.find(
    (item: KontenData) => item.page === 'home' && item.locale === locale
  ) || null;

  // ── i18n dictionary ──────────────────────────────────────
  const getLabel = (key: string): string => {
    const dictionary: Record<string, Record<string, string>> = {
      badge: {
        id: "Terpercaya & Tercepat Global",
        en: "Trusted & Fastest Globally",
        es: "Confiable y Más Rápido Global",
        tl: "Maaasahan at Pinakamabilis Global"
      },
      btnCair: {
        id: "Cairkan Sekarang",
        en: "Withdraw Now",
        es: "Retirar Sekarang",
        tl: "Mag-cash Out Ngayon"
      },
      btnRate: {
        id: "Lihat Rate Hari Ini",
        en: "Check Today's Rate",
        es: "Ver Tarifa de Hoy",
        tl: "Suriin ang Rate Ngayon"
      },
      metric1: { id: "Total Pencairan Sukses", en: "Total Successful Withdrawals", es: "Retiros Exitosos Totales", tl: "Kabuuang Matagumpay na Pag-withdraw" },
      metric2: { id: "Rata-rata Waktu Proses", en: "Average Processing Time", es: "Tiempo Promedio de Proceso", tl: "Karaniwang Oras ng Proseso" },
      metric3: { id: "Pengguna Aktif Global", en: "Global Active Users", es: "Usuarios Activos Globales", tl: "Mga Aktibong User sa Global" },
      flagTitle: { id: "Didukung di Seluruh Dunia", en: "Supported Worldwide", es: "Soportado en Todo el Mundo", tl: "Suportado sa Buong Mundo" },
      flagSub: {
        id: "Kami melayani penukaran dan pencairan mata uang lokal di berbagai belahan negara resmi Orb.",
        en: "We serve exchanges and local currency withdrawals across various official Orb countries.",
        es: "Atendemos intercambios y retiros en moneda local en varios países oficiales di Orb.",
        tl: "Nagsisilbi kami ng mga palitan at pag-withdraw ng lokal na pera sa iba't ibang opisyal na bansa ng Orb."
      },
      commentTitle: { id: "Apa Kata Mereka?", en: "What They Say", es: "¿Qué Dicen Ellos?", tl: "Ano ang Sinasabi Nila" },
      commentSub: {
        id: "Ulasan jujur dari pelanggan global yang telah berhasil mencairkan koin mereka.",
        en: "Honest reviews from global customers who have successfully withdrawn their coins.",
        es: "Reseñas honestas di clientes globales yang han retirado sus monedas con éxito.",
        tl: "Mga tapat na pagsusuri mula sa mga global na customer na matagumpay na nag-withdraw."
      }
    };
    return dictionary[key]?.[locale] || dictionary[key]?.['en'] || '';
  };

  const dummyComments = [
    {
      id: 1,
      name: "Alejandro M.",
      role: "Verified Orb User",
      country: "ES",
      rating: 5,
      text: locale === 'id' ? "Prosesnya sangat cepat! Hanya butuh 3 menit sampai saldo masuk." :
            locale === 'es' ? "¡El proceso es extremadamente rápido! Solo tomó 3 minutos." :
            locale === 'tl' ? "Napakabilis ng proseso! Tumagal lamang ng 3 minuto." :
            "The process is extremely fast! It only took 3 minutes for the balance to hit."
    },
    {
      id: 2,
      name: "Sarah K.",
      role: "Trader",
      country: "US",
      rating: 5,
      text: locale === 'id' ? "Rate-nya sangat kompetitif dan transparan." :
            locale === 'es' ? "La tarifa resultó ser muy competitiva y transparente." :
            locale === 'tl' ? "Ang rate ay napakahusay at transparent." :
            "The rate turned out to be highly competitive and transparent."
    }
  ];

  const globalFlags = [
    { code: "id", name: "Indonesia" },
    { code: "es", name: locale === 'es' ? "España" : "Spain" },
    { code: "ph", name: locale === 'tl' ? "Pilipinas" : "Philippines" },
    { code: "us", name: "United States" },
    { code: "ar", name: "Argentina" },
    { code: "jp", name: "Japan" }
  ];

  return (
    <div className="hp-root">
      {/* CSS diletakkan di dalam container utama agar hidrasi HTML berjalan valid */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --clr-bg:          #F8FAFC;
          --clr-surface:     #FFFFFF;
          --clr-surface-2:   #F1F5F9;
          --clr-border:      #E2E8F0;
          --clr-border-soft: rgba(226, 232, 240, 0.6);
          --clr-primary:     #2563EB;
          --clr-primary-dark:#1D4ED8;
          --clr-primary-glow:rgba(37, 99, 235, 0.15);
          --clr-primary-tint:#EFF6FF;
          --clr-accent:      #0EA5E9;
          --clr-success:     #10B981;
          --clr-text-1:      #0F172A;
          --clr-text-2:      #334155;
          --clr-text-3:      #64748B;
          --clr-text-inv:    #FFFFFF;

          --shadow-xs:  0 1px 2px rgba(15,23,42,0.06);
          --shadow-sm:  0 2px 8px rgba(15,23,42,0.08);
          --shadow-md:  0 4px 16px rgba(15,23,42,0.10);
          --shadow-lg:  0 8px 32px rgba(15,23,42,0.12);
          --shadow-primary: 0 4px 16px rgba(37,99,235,0.2);

          --radius-md:  12px;
          --radius-lg:  20px;
          --radius-xl:  24px;
          --radius-full: 9999px;

          --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          
          --space-2: 0.5rem;
          --space-3: 0.75rem;
          --space-4: 1rem;
          --space-5: 1.25rem;
          --space-6: 1.5rem;
          --space-8: 2rem;
          --space-10: 2.5rem;
          --space-12: 3rem;
        }

        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .hp-root {
          font-family: var(--font-body);
          background: var(--clr-bg);
          color: var(--clr-text-1);
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
        }

        .hp-container {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 var(--space-5);
        }

        /* ── HERO ── */
        .hp-hero-wrap {
          position: relative;
          background: var(--clr-surface);
          border-bottom: 1px solid var(--clr-border);
          overflow: hidden;
          padding: var(--space-10) 0 var(--space-8);
        }

        .hp-hero-wrap::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, #CBD5E1 1px, transparent 1px);
          background-size: 24px 24px;
          opacity: 0.35;
          pointer-events: none;
        }

        .hp-hero-inner {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column-reverse;
          gap: var(--space-8);
          align-items: center;
          text-align: center;
        }

        .hp-hero-left { width: 100%; }

        .hp-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          background: var(--clr-primary-tint);
          color: var(--clr-primary);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.35rem var(--space-3);
          border-radius: var(--radius-full);
          border: 1px solid rgba(37, 99, 235, 0.15);
          margin-bottom: var(--space-4);
        }

        .hp-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--clr-success);
          box-shadow: 0 0 0 2px rgba(16,185,129,0.2);
          animation: pulse-dot 2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0 2px rgba(16,185,129,0.2); }
          50%       { box-shadow: 0 0 0 5px rgba(16,185,129,0.05); }
        }

        .hp-headline {
          font-size: clamp(1.85rem, 6vw, 2.75rem);
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -0.02em;
          color: var(--clr-text-1);
          margin: 0 0 var(--space-3);
        }

        .hp-headline-accent {
          background: linear-gradient(135deg, var(--clr-primary) 0%, var(--clr-accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hp-body {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--clr-text-2);
          margin: 0 0 var(--space-6);
        }

        .hp-cta-row {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          width: 100%;
        }

        .hp-btn-primary, .hp-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          font-size: 0.95rem;
          font-weight: 600;
          padding: 0.8rem var(--space-6);
          border-radius: var(--radius-md);
          text-decoration: none;
          width: 100%;
          box-sizing: border-box;
          transition: all 0.15s ease;
        }

        .hp-btn-primary {
          background: var(--clr-primary);
          color: var(--clr-text-inv);
          box-shadow: var(--shadow-primary);
          border: none;
        }

        .hp-btn-secondary {
          background: var(--clr-surface);
          color: var(--clr-text-2);
          border: 1px solid var(--clr-border);
        }

        /* INTERACTIVE COIN STYLES */
        .hp-hero-right {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          min-height: 180px;
          margin-bottom: var(--space-2);
          touch-action: none;
        }

        .hp-coin-glow {
          position: absolute;
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .hp-coin-shadow {
          position: absolute;
          bottom: 0px;
          width: 90px;
          height: 8px;
          background: rgba(15,23,42,0.08);
          border-radius: 50%;
          filter: blur(5px);
        }

        .hp-coin-container {
          perspective: 1000px;
          width: 130px;
          height: 130px;
        }

        .hp-coin {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          --coin-rx: 0deg;
          --coin-ry: 0deg;
          transform: rotateX(var(--coin-rx)) rotateY(var(--coin-ry));
          transition: transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .hp-coin-face {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 35% 35%, #1e2533 0%, #0c0f18 100%);
          border: 4px solid #111827;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2), inset 0 1px 4px rgba(255,255,255,0.1);
        }

        .hp-coin-back { transform: rotateY(180deg); }

        /* ── METRICS ── */
        .hp-metrics-wrap {
          background: var(--clr-surface);
          border-bottom: 1px solid var(--clr-border);
          padding: var(--space-6) 0;
        }

        .hp-metrics-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-4);
          text-align: center;
        }

        .hp-metric-card { padding: var(--space-4); }
        .hp-metric-value { font-size: 2rem; font-weight: 700; color: var(--clr-primary); }
        .hp-metric-label { font-size: 0.85rem; color: var(--clr-text-3); margin-top: var(--space-2); }

        /* ── GLOBAL REACH ── */
        .hp-flags-wrap {
          padding: var(--space-10) 0;
          background: var(--clr-bg);
          border-bottom: 1px solid var(--clr-border);
        }

        .hp-section-eyebrow { text-align: center; margin-bottom: var(--space-8); }
        .hp-section-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--clr-primary); font-weight: 700; }
        .hp-section-title { font-size: 1.5rem; font-weight: 700; margin: var(--space-2) 0; }
        .hp-section-sub { font-size: 0.9rem; color: var(--clr-text-3); max-width: 600px; margin: 0 auto; }
        .hp-flags-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-3); }

        .hp-flag-chip {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          background: var(--clr-surface);
          border: 1px solid var(--clr-border);
          padding: 0.5rem var(--space-4);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-xs);
        }

        .hp-flag-img-wrap { position: relative; width: 20px; height: 15px; border-radius: 2px; overflow: hidden; }
        .hp-flag-name { font-size: 0.85rem; font-weight: 500; color: var(--clr-text-2); }

        /* ── TESTIMONIALS ── */
        .hp-comments-wrap { padding: var(--space-10) 0; background: var(--clr-surface); }
        .hp-comments-grid { display: flex; flex-direction: column; gap: var(--space-4); margin-top: var(--space-6); }
        .hp-comment-card { background: var(--clr-bg); border: 1px solid var(--clr-border-soft); border-radius: var(--radius-lg); padding: var(--space-5); box-shadow: var(--shadow-sm); }
        .hp-comment-header { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3); }
        
        .hp-comment-avatar {
          width: 36px;
          height: 36px;
          background: var(--clr-primary);
          color: white;
          font-weight: 600;
          font-size: 0.85rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hp-comment-info { flex: 1; }
        .hp-comment-name { font-size: 0.9rem; font-weight: 600; color: var(--clr-text-1); }
        .hp-comment-role { font-size: 0.75rem; color: var(--clr-text-3); }
        .hp-comment-flag-wrap { position: relative; width: 20px; height: 15px; }
        .hp-stars { color: #F59E0B; font-size: 0.85rem; margin-bottom: var(--space-2); }
        .hp-comment-text { font-size: 0.85rem; line-height: 1.5; color: var(--clr-text-2); }

        /* ── RESPONSIVE RESPONSIVE ── */
        @media (min-width: 640px) {
          .hp-cta-row { flex-direction: row; }
          .hp-btn-primary, .hp-btn-secondary { width: auto; flex: 1; }
        }

        @media (min-width: 768px) {
          .hp-hero-wrap { padding: var(--space-12) 0; }
          .hp-hero-inner { flex-direction: row; text-align: left; justify-content: space-between; gap: var(--space-12); }
          .hp-hero-left { flex: 1; text-align: left; }
          .hp-hero-right { flex: unset; width: auto; min-height: 240px; }
          .hp-coin-container { width: 180px; height: 180px; }
          .hp-coin-glow { width: 240px; height: 240px; }
          .hp-coin-shadow { width: 120px; }
          .hp-cta-row { justify-content: flex-start; }
          .hp-btn-primary, .hp-btn-secondary { flex: unset; width: auto; }
          
          .hp-metrics-grid { grid-template-columns: repeat(3, 1fr); }
          .hp-comments-grid { flex-direction: row; flex-wrap: wrap; justify-content: center; }
          .hp-comment-card { flex: 1 1 300px; max-width: 450px; }
          .hp-section-title { font-size: 2rem; }
        }
      `}} />

      {/* ── 1. HERO SECTION ── */}
      <section className="hp-hero-wrap">
        <div className="hp-container">
          <div className="hp-hero-inner">

            <div className="hp-hero-left">
              <div className="hp-badge">
                <span className="hp-badge-dot" aria-hidden="true" />
                {getLabel('badge')}
              </div>

              <h1 className="hp-headline">
                <span className="hp-headline-accent">Worldcoin</span>{' '}
                {dataHalaman?.title
                  ? dataHalaman.title.replace(/worldcoin/i, '').trim()
                  : 'Cash Out'}
              </h1>

              <p className="hp-body">
                {dataHalaman?.content || 'Loading Content...'}
              </p>

              <div className="hp-cta-row">
                <Link href="/tarik-worldcoin-ke-cash" className="hp-btn-primary">
                  {getLabel('btnCair')}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <button className="hp-btn-secondary">
                  {getLabel('btnRate')}
                </button>
              </div>
            </div>

            {/* Memanggil Komponen Client Koin */}
            <InteractiveCoin />

          </div>
        </div>
      </section>

      {/* ── 2. TRUST METRICS SECTION ── */}
      <div className="hp-metrics-wrap">
        <div className="hp-container">
          <div className="hp-metrics-grid">
            <div className="hp-metric-card">
              <div className="hp-metric-value">$2.5M+</div>
              <div className="hp-metric-label">{getLabel('metric1')}</div>
            </div>
            <div className="hp-metric-card">
              <div className="hp-metric-value">&lt;5 Min</div>
              <div className="hp-metric-label">{getLabel('metric2')}</div>
            </div>
            <div className="hp-metric-card">
              <div className="hp-metric-value">15K+</div>
              <div className="hp-metric-label">{getLabel('metric3')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. GLOBAL REACH SECTION ── */}
      <section className="hp-flags-wrap">
        <div className="hp-container">
          <div className="hp-section-eyebrow">
            <span className="hp-section-label">Global Reach</span>
            <h2 className="hp-section-title">{getLabel('flagTitle')}</h2>
            <p className="hp-section-sub">{getLabel('flagSub')}</p>
          </div>

          <div className="hp-flags-grid">
            {globalFlags.map((flag) => (
              <div key={flag.code} className="hp-flag-chip">
                <div className="hp-flag-img-wrap">
                  <Image
                    src={`https://flagcdn.com/w40/${flag.code}.png`}
                    alt={`Flag of ${flag.name}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="20px"
                  />
                </div>
                <span className="hp-flag-name">{flag.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. TESTIMONIALS SECTION ── */}
      <section className="hp-comments-wrap">
        <div className="hp-container">
          <div className="hp-section-eyebrow">
            <span className="hp-section-label">Testimonials</span>
            <h2 className="hp-section-title">{getLabel('commentTitle')}</h2>
            <p className="hp-section-sub">{getLabel('commentSub')}</p>
          </div>

          <div className="hp-comments-grid">
            {dummyComments.map((comment) => (
              <article key={comment.id} className="hp-comment-card">
                <div className="hp-comment-header">
                  <div className="hp-comment-avatar" aria-hidden="true">
                    {comment.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div className="hp-comment-info">
                    <div className="hp-comment-name">{comment.name}</div>
                    <div className="hp-comment-role">{comment.role}</div>
                  </div>
                  <div className="hp-comment-flag-wrap">
                    <Image
                      src={`https://flagcdn.com/w20/${comment.country.toLowerCase()}.png`}
                      alt={`Flag`}
                      fill
                      sizes="20px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                </div>

                <div className="hp-stars" aria-label={`${comment.rating} out of 5 stars`}>
                  {Array.from({ length: comment.rating }, (_, i) => (
                    <span key={i} className="hp-star" aria-hidden="true">★</span>
                  ))}
                </div>

                <p className="hp-comment-text">
                  &ldquo;{comment.text}&rdquo;
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}