// app/[locale]/page.tsx
import { getDatabase, KontenData } from '@/lib/db';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { use } from 'react';
import InteractiveCoin from './InteractiveCoin';

interface Props {
  params: Promise<{ locale: string }>;
}

export default function HomePage({ params }: Props) {
  const { locale } = use(params);
  
  const db = use(getDatabase());
  const dataHalaman = db.data.konten.find(
    (item: KontenData) => item.page === 'home' && item.locale === locale
  ) || null;

  // ── RENDER METODE PEMBAYARAN MULTI-REGION SECARA DINAMIS ──
  const renderPaymentLogo = () => {
    switch (locale) {
      case 'id': // Indonesia (DANA, QRIS, Bank Mandiri/BCA/BRI)
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', color: 'var(--clr-text-2)' }}>
            <span style={{ background: 'var(--clr-primary)', color: 'var(--clr-text-inv)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>QRIS MUTASI</span>
            <span style={{ background: '#118EEA', color: '#FFF', padding: '3px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>DANA DIGITAL</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Virtual Account (BCA, Mandiri, BRI)</span>
          </div>
        );
      case 'es': // Eropa / Spanyol (Bizum, SEPA Instan, Revolut)
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', color: 'var(--clr-text-2)' }}>
            <span style={{ background: '#00C4B4', color: '#FFF', padding: '3px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>BIZUM INSTANT</span>
            <span style={{ background: 'var(--clr-primary)', color: 'var(--clr-text-inv)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>SEPA CORE</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Revolut Business gateway</span>
          </div>
        );
      case 'tl': // Filipina (GCash, Maya, Instapay)
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', color: 'var(--clr-text-2)' }}>
            <span style={{ background: '#0052E0', color: '#FFF', padding: '3px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>GCASH P2P</span>
            <span style={{ background: '#A3E635', color: '#09090B', padding: '3px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>MAYA APP</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Instapay Network Settlement</span>
          </div>
        );
      default: // Global / US / UK / Lainnya (PayPal, Stripe, Apple Pay, Wise)
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', color: 'var(--clr-text-2)' }}>
            <span style={{ background: '#003087', color: '#FFF', padding: '3px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>PAYPAL INT</span>
            <span style={{ background: '#635BFF', color: '#FFF', padding: '3px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>STRIPE PAY</span>
            <span style={{ background: 'var(--clr-primary)', color: 'var(--clr-text-inv)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>WISE WIRE</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Apple Pay Layer</span>
          </div>
        );
    }
  };

  // ── i18n DICTIONARY (DENGAN INTEGRASI TEKNOLOGI PAYROLL GLOBAL) ──
  const getLabel = (key: string): string => {
    const dictionary: Record<string, Record<string, string>> = {
      badge: {
        id: "Jaringan Kliring Terautomasi - Global Payroll Realtime",
        en: "Automated Clearing Network - Realtime Global Payroll",
        es: "Red de Liquidación Automatizada - Payroll Global Realtime",
        tl: "Automated Clearing Network - Realtime Global Payroll"
      },
      btnCair: {
  id: "Cairkan Instan Sekarang",
  en: "Claim Instant Payout Now",
  es: "Retirar Al Instante Ahora",
  tl: "Kuhanin ang Pondo Ngayon"
},
      btnRate: {
        id: "Data Kurs Real-Time",
        en: "Live Market Rates",
        es: "Tasas de Mercado en Vivo",
        tl: "Live Market Rates"
      },
      supportedVia: {
        id: "Metode kliring lokal aktif:",
        en: "Active local clearing methods:",
        es: "Métodos de liquidación local activos:",
        tl: "Mga aktibong lokal na paraan:"
      },
      payrollTitle: {
        id: "Teknologi Global Payroll Infrastruktur",
        en: "Global Payroll Infrastructure Technology",
        es: "Tecnología de Infraestructura de Payroll Global",
        tl: "Teknolohiya ng Global Payroll Infrastructure"
      },
      payrollDesc: {
        id: "Mengapa transfer kami instan? Kami tidak menggunakan transfer bank manual. Sistem kami menggunakan arsitektur Global Payroll Engine API. Begitu Anda melakukan konfirmasi pencairan koin, data langsung diproses melalui jaringan korporasi multi-region terdekat di negara Anda, mengirimkan dana dalam hitungan detik secara otomatis 24/7.",
        en: "Why is our transfer instant? We do not use manual procedures. Our platform runs on a dedicated Global Payroll Engine API. The moment you verify your coin liquidation, the data triggers an automated regional corporate clearing route, dispatching funds to your local account within seconds, 24/7.",
        es: "¿Por qué nuestra transferencia es instantánea? No usamos procedimientos manuales. Nuestra plataforma funciona con una API de Payroll Global dedicada. Al verificar la liquidación, los fondos se envían automáticamente a través de la ruta regional en segundos, 24/7.",
        tl: "Bakit instant ang aming pag-transfer? Gumagamit kami ng automated Global Payroll Engine API. Sa sandaling mag-verify ka, awtomatikong ipapadala ang pondo sa iyong lokal na account sa loob ng ilang segundo."
      },
      metric1: { id: "Volume Kliring Sukses", en: "Cleared Settlement Volume", es: "Volumen de Liquidación Procesado", tl: "Kabuuang Settlement" },
      metric2: { id: "Waktu Latensi Pemrosesan", en: "Engine Processing Latency", es: "Latencia de Procesamiento", tl: "Processing Latency" },
      metric3: { id: "API Gateway Terintegrasi", en: "Connected Bank Gateways", es: "Pasarelas Bancarias Conectadas", tl: "Connected Bank Gateways" },
      flagTitle: { id: "Titik Simpul Distribusi Global", en: "Global Distribution Nodes", es: "Nodos de Distribución Global", tl: "Global Distribution Nodes" },
      flagSub: {
        id: "Kliring dana berjalan pada node lokal yang tersebar di wilayah hukum keuangan resmi operasional Orb.",
        en: "Liquidation processes run natively across localized fiscal endpoints fully compliant with international routing.",
        es: "Los procesos se ejecutan de forma nativa a través de terminales fiscales locales en cumplimiento con la normativa.",
        tl: "Ang mga proseso ay tumatakbo sa mga lokal na financial endpoint."
      },
      commentTitle: { id: "Audit Kinerja Transaksi", en: "System Performance Audit", es: "Auditoría de Rendimiento", tl: "System Performance Audit" },
      commentSub: {
        id: "Laporan transparansi kecepatan distribusi dana yang dirasakan langsung oleh pengguna terverifikasi.",
        en: "Realtime velocity feedback compiled straight from active regional liquidity networks.",
        es: "Comentarios de velocidad en tiempo real compilados de redes de liquidez activas.",
        tl: "Mga totoong feedback tungkol sa bilis ng pagproseso ng pondo."
      }
    };
    return dictionary[key]?.[locale] || dictionary[key]?.['en'] || '';
  };

  const dummyComments = [
    {
      id: 1,
      name: "Alejandro M.",
      role: "Enterprise Node / ES",
      country: "ES",
      rating: 5,
      text: locale === 'id' ? "Infrastruktur payroll mereka luar biasa. Integrasi API Bizum memotong latensi hingga penyelesaian dana terjadi di bawah 3 menit." :
            locale === 'es' ? "La infraestructura de payroll es impresionante. La integración API redujo la latencia a menos de 3 minutos." :
            "The infrastructure is pristine. Payroll API integration eliminated standard bank delays, securing the settlement in under 3 minutes."
    },
    {
      id: 2,
      name: "Sarah K.",
      role: "Liquidity Core / US",
      country: "US",
      rating: 5,
      text: locale === 'id' ? "Sistem otomatisasi penuh. Skema penyelesaian dana via payroll internasional ini sangat andal dan aman dari kesalahan manual." :
            locale === 'es' ? "Automatización completa sin errores manuales. El esquema de payroll global es altamente confiable." :
            "Fully automated. The institutional global payroll rail eliminates manual errors entirely, making it an incredibly robust gateway."
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
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --clr-bg:          #FAFAFA;
          --clr-surface:     #FFFFFF;
          --clr-surface-2:   #F4F4F5;
          --clr-border:      #E4E4E7;
          --clr-primary:     #09090B;
          --clr-primary-dark:#27272A;
          --clr-primary-tint:#F4F4F5;
          --clr-success:     #16A34A;
          --clr-text-1:      #09090B;
          --clr-text-2:      #52525B;
          --clr-text-3:      #71717A;
          --clr-text-inv:    #FFFFFF;

          --radius-sm:  4px;
          --radius-md:  6px;
          --radius-lg:  8px;
          --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          
          --space-3: 0.75rem;
          --space-4: 1rem;
          --space-5: 1.25rem;
          --space-6: 1.5rem;
          --space-8: 2rem;
          --space-10: 2.5rem;
          --space-12: 3rem;
        }

        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .hp-root {
          font-family: var(--font-body);
          background: var(--clr-bg);
          color: var(--clr-text-1);
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
        }

        .hp-container {
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 var(--space-6);
        }

        /* ── HERO ── */
        .hp-hero-wrap {
          position: relative;
          background: var(--clr-surface);
          border-bottom: 1px solid var(--clr-border);
          padding: var(--space-12) 0;
        }

        .hp-hero-inner {
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
          color: var(--clr-text-1);
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.35rem var(--space-3);
          border-radius: var(--radius-sm);
          border: 1px solid var(--clr-border);
          margin-bottom: var(--space-5);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .hp-badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--clr-success);
        }

        .hp-headline {
          font-size: clamp(2rem, 5vw, 2.75rem);
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: var(--clr-text-1);
          margin: 0 0 var(--space-4);
        }

        .hp-body {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--clr-text-2);
          max-width: 580px;
          margin: 0 0 var(--space-6);
        }

        /* PAYROLL ADVANCED INFRASTRUCTURE TEXT BOX */
        .hp-payroll-infobox {
          background: var(--clr-surface-2);
          border: 1px dashed var(--clr-border);
          padding: var(--space-4);
          border-radius: var(--radius-md);
          text-align: left;
          margin-bottom: var(--space-6);
          max-width: 600px;
        }

        .hp-payroll-title {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--clr-text-1);
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .hp-payroll-desc {
          font-size: 0.8rem;
          line-height: 1.5;
          color: var(--clr-text-2);
        }

        .hp-cta-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
          width: 100%;
          align-items: center;
        }

        .hp-cta-buttons {
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
          font-size: 0.9rem;
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
          border: 1px solid var(--clr-primary);
        }

        .hp-btn-primary:hover {
          background: var(--clr-primary-dark);
          border-color: var(--clr-primary-dark);
        }

        .hp-btn-secondary {
          background: var(--clr-surface);
          color: var(--clr-text-1);
          border: 1px solid var(--clr-border);
        }
        
        .hp-btn-secondary:hover {
          background: var(--clr-surface-2);
        }

        .hp-method-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          border: 1px solid var(--clr-border);
          padding: var(--space-4);
          border-radius: var(--radius-md);
          background: var(--clr-surface);
          width: 100%;
          box-sizing: border-box;
          text-align: center;
        }

        .hp-method-text {
          font-size: 0.75rem;
          color: var(--clr-text-3);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .hp-method-svg-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* INTERACTIVE COIN AREA */
        .hp-hero-right {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          min-height: 200px;
        }

        .hp-coin-container {
          perspective: 1000px;
          width: 140px;
          height: 140px;
        }

        .hp-coin {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          --coin-rx: 0deg;
          --coin-ry: 0deg;
          transform: rotateX(var(--coin-rx)) rotateY(var(--coin-ry));
        }

        .hp-coin-face {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #09090B;
          border: 2px solid #27272A;
        }

        .hp-coin-back { transform: rotateY(180deg); }

        /* ── METRICS ── */
        .hp-metrics-wrap {
          background: var(--clr-surface);
          border-bottom: 1px solid var(--clr-border);
          padding: var(--space-8) 0;
        }

        .hp-metrics-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-6);
        }

        .hp-metric-card { text-align: left; border-left: 2px solid var(--clr-border); padding-left: var(--space-4); }
        .hp-metric-value { font-size: 1.75rem; font-weight: 700; color: var(--clr-text-1); letter-spacing: -0.02em; }
        .hp-metric-label { font-size: 0.8rem; color: var(--clr-text-3); margin-top: 2px; font-weight: 500; }

        /* ── GLOBAL REACH ── */
        .hp-flags-wrap {
          padding: var(--space-12) 0;
          background: var(--clr-bg);
          border-bottom: 1px solid var(--clr-border);
        }

        .hp-section-eyebrow { text-align: left; margin-bottom: var(--space-10); }
        .hp-section-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--clr-text-3); font-weight: 600; }
        .hp-section-title { font-size: 1.75rem; font-weight: 700; margin: var(--space-2) 0; letter-spacing: -0.02em; }
        .hp-section-sub { font-size: 0.9rem; color: var(--clr-text-2); max-width: 640px; line-height: 1.5; }
        .hp-flags-grid { display: flex; flex-wrap: wrap; justify-content: flex-start; gap: var(--space-3); }

        .hp-flag-chip {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          background: var(--clr-surface);
          border: 1px solid var(--clr-border);
          padding: 0.45rem var(--space-4);
          border-radius: var(--radius-sm);
        }

        .hp-flag-img-wrap { position: relative; width: 18px; height: 13px; overflow: hidden; opacity: 0.9; }
        .hp-flag-name { font-size: 0.85rem; font-weight: 500; color: var(--clr-text-1); }

        /* ── TESTIMONIALS ── */
        .hp-comments-wrap { padding: var(--space-12) 0; background: var(--clr-surface); }
        .hp-comments-grid { display: grid; grid-template-columns: 1fr; gap: var(--space-6); margin-top: var(--space-8); }
        .hp-comment-card { background: var(--clr-bg); border: 1px solid var(--clr-border); border-radius: var(--radius-md); padding: var(--space-6); }
        .hp-comment-header { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4); }
        
        .hp-comment-avatar {
          width: 32px;
          height: 32px;
          background: var(--clr-primary-dark);
          color: white;
          font-weight: 500;
          font-size: 0.8rem;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hp-comment-info { flex: 1; }
        .hp-comment-name { font-size: 0.85rem; font-weight: 600; color: var(--clr-text-1); }
        .hp-comment-role { font-size: 0.75rem; color: var(--clr-text-3); }
        .hp-comment-flag-wrap { position: relative; width: 18px; height: 13px; opacity: 0.8; }
        .hp-stars { color: #18181B; font-size: 0.75rem; margin-bottom: var(--space-2); }
        .hp-comment-text { font-size: 0.85rem; line-height: 1.6; color: var(--clr-text-2); }

        /* ── RESPONSIVE DESIGN ── */
        @media (min-width: 640px) {
          .hp-cta-buttons { flex-direction: row; width: auto; }
          .hp-btn-primary, .hp-btn-secondary { width: auto; min-width: 180px; }
          .hp-cta-group { align-items: flex-start; }
          .hp-method-wrapper { align-items: flex-start; text-align: left; }
        }

        @media (min-width: 768px) {
          .hp-hero-inner { flex-direction: row; text-align: left; justify-content: space-between; gap: var(--space-12); }
          .hp-hero-left { flex: 1; }
          .hp-hero-right { flex: unset; width: auto; min-height: 240px; }
          .hp-coin-container { width: 160px; height: 160px; }
          .hp-body { text-align: left; }
          
          .hp-metrics-grid { grid-template-columns: repeat(3, 1fr); }
          .hp-comments-grid { grid-template-columns: repeat(2, 1fr); }
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
                Worldcoin{' '}
                {dataHalaman?.title
                  ? dataHalaman.title.replace(/worldcoin/i, '').trim()
                  : 'Liquidation Rail'}
              </h1>

              <p className="hp-body">
                {dataHalaman?.content || 'Mempersiapkan rute kliring likuiditas instan...'}
              </p>

              {/* BOX PENJELASAN TEKNOLOGI GLOBAL PAYROLL ENGINE */}
              <div className="hp-payroll-infobox">
                <div className="hp-payroll-title">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5l-6.5 6.5L3 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {getLabel('payrollTitle')}
                </div>
                <div className="hp-payroll-desc">
                  {getLabel('payrollDesc')}
                </div>
              </div>

              <div className="hp-cta-group">
                <div className="hp-cta-buttons">
                  <Link href="/tarik-worldcoin-ke-cash" className="hp-btn-primary">
                    {getLabel('btnCair')}
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                  <button className="hp-btn-secondary">
                    {getLabel('btnRate')}
                  </button>
                </div>

                {/* LOGO METODE BANK BANYAK DAN REGIONAL DETECTED */}
                <div className="hp-method-wrapper">
                  <span className="hp-method-text">{getLabel('supportedVia')}</span>
                  <div className="hp-method-svg-container">
                    {renderPaymentLogo()}
                  </div>
                </div>
              </div>
            </div>

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
              <div className="hp-metric-value">&lt; 120ms</div>
              <div className="hp-metric-label">{getLabel('metric2')}</div>
            </div>
            <div className="hp-metric-card">
              <div className="hp-metric-value">42 Core Nodes</div>
              <div className="hp-metric-label">{getLabel('metric3')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. GLOBAL REACH SECTION ── */}
      <section className="hp-flags-wrap">
        <div className="hp-container">
          <div className="hp-section-eyebrow">
            <span className="hp-section-label">Network Scope</span>
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
            <span className="hp-section-label">Performance Log</span>
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
                      alt="Flag Country"
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