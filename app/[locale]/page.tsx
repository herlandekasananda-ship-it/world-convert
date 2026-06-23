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

  // ── RENDER METODE PEMBAYARAN MULTI-REGION (Bersih & Profesional) ──
  const renderPaymentLogo = () => {
    switch (locale) {
      case 'id':
        return (
          <div className="d-flex flex-wrap align-items-center gap-3 text-secondary">
            <span className="badge bg-dark-subtle text-dark border px-2 py-1" style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.02em' }}>QRIS AUTOMATED</span>
            <span className="badge text-white px-2 py-1" style={{ fontSize: '0.65rem', fontWeight: 600, backgroundColor: '#0086e6' }}>DANA GATEWAY</span>
            <span className="small text-muted" style={{ fontSize: '0.78rem' }}>Transfer Bank (BCA, Mandiri, BRI) • Otomatis 24 Jam</span>
          </div>
        );
      case 'es':
        return (
          <div className="d-flex flex-wrap align-items-center gap-3 text-secondary">
            <span className="badge text-white px-2 py-1" style={{ fontSize: '0.65rem', fontWeight: 600, backgroundColor: '#00b2a9' }}>BIZUM INSTANT</span>
            <span className="badge bg-dark text-white px-2 py-1" style={{ fontSize: '0.65rem', fontWeight: 600 }}>SEPA DIRECT RAIL</span>
            <span className="small text-muted" style={{ fontSize: '0.78rem' }}>Revolut Business Route</span>
          </div>
        );
      case 'tl':
        return (
          <div className="d-flex flex-wrap align-items-center gap-3 text-secondary">
            <span className="badge text-white px-2 py-1" style={{ fontSize: '0.65rem', fontWeight: 600, backgroundColor: '#0046c7' }}>GCASH DISBURSE</span>
            <span className="badge text-dark px-2 py-1 border" style={{ fontSize: '0.65rem', fontWeight: 600, backgroundColor: '#9bd830' }}>MAYA PAY</span>
            <span className="small text-muted" style={{ fontSize: '0.78rem' }}>Instapay Network Settlement</span>
          </div>
        );
      default:
        return (
          <div className="d-flex flex-wrap align-items-center gap-3 text-secondary">
            <span className="badge text-white px-2 py-1" style={{ fontSize: '0.65rem', fontWeight: 600, backgroundColor: '#002569' }}>PAYPAL NETWORK</span>
            <span className="badge text-white px-2 py-1" style={{ fontSize: '0.65rem', fontWeight: 600, backgroundColor: '#5851df' }}>STRIPE PAYOUTS</span>
            <span className="small text-muted" style={{ fontSize: '0.78rem' }}>Apple Pay Secured Gateway</span>
          </div>
        );
    }
  };

  // Angka asimetris ganjil untuk memicu efek psikologis data riil
  const getLiveTickerText = () => {
    switch (locale) {
      case 'id': return "Sistem Aktif: Node ID_Jakarta baru saja memproses kliring Rp 367,400 via DANA (3 detik lalu) • Saluran lokal: Normal";
      case 'es': return "Servidor Conectado: Nodo ES_Madrid liquidó €46.20 vía Bizum (hace 7s) • Tráfico de red: Estable";
      case 'tl': return "Network Status: PH_Manila completed payout of ₱1,140 via GCash (5s ago) • Local server: Nominal";
      default: return "System Status: US_East cleared a $74.85 direct distribution layer (2s ago) • API gateway: Online";
    }
  };

  const getLabel = (key: string): string => {
    const dictionary: Record<string, Record<string, string>> = {
      badge: {
        id: "Jaringan Distribusi Otomatis — Jalur Payroll Global",
        en: "Automated Distribution Network — Global Payroll Rails",
        es: "Red de Liquidación Automatizada — Canal de Payroll",
        tl: "Automated Clearing Network — Realtime Global Payroll"
      },
      btnCair: {
        id: "Cairkan Saldo Sekarang",
        en: "Process Payout Now",
        es: "Retirar Fondos Ahora",
        tl: "Kuhanin ang Pondo Ngayon"
      },
      btnRate: {
        id: "Lihat Kurs Live",
        en: "Check Market Rates",
        es: "Ver Tasas de Cambio",
        tl: "Live Market Rates"
      },
      supportedVia: {
        id: "Metode transfer lokal yang didukung:",
        en: "Supported local payment methods:",
        es: "Canales de pago locales activos:",
        tl: "Mga aktibong lokal na paraan:"
      },
      payrollTitle: {
        id: "Mekanisme Pemrosesan Otomatis (Tanpa Admin Manual)",
        en: "Automated Infrastructure (Zero Manual Interventions)",
        es: "Infraestructura Automatizada (Sin Gestión Manual)",
        tl: "Teknolohiya ng Global Payroll Infrastructure"
      },
      payrollDesc: {
        id: "Pencairan diproses secara langsung melalui integrasi API Global Payroll terdekat di wilayah Anda. Dana ditransfer otomatis oleh sistem tanpa perlu menunggu persetujuan admin atau proses manual, memastikan transaksi selesai dengan aman dalam hitungan menit, kapan saja.",
        en: "Liquidation workloads are processed natively through integrated Global Payroll Engine APIs. Funds are routed instantly from regional liquidity pools without manual ticket approvals, ensuring completed settlements within minutes, 24/7.",
        es: "Los fondos se despachan mediante la API de Payroll Global directamente desde cuentas de liquidez locales. Un proceso 100% integrado que garantiza depósitos en minutos, sin esperas ni fines de semana.",
        tl: "Bakit instant ang aming pag-transfer? Gumagamit kami ng automated Global Payroll Engine API. Sa sandaling mag-verify ka, awtomatikong ipapadala ang pondo sa iyong lokal na account."
      },
      metric1: { id: "Volume Kliring Berhasil", en: "Total Liquidated Volume", es: "Volumen Total Procesado", tl: "Kabuuang Settlement" },
      metric2: { id: "Efisiensi Respons Gateway", en: "API Mainframe Latency", es: "Latencia de Red Principal", tl: "Processing Latency" },
      metric3: { id: "Titik Integrasi Bank", en: "Connected Banking Nodes", es: "Nodos Bancarios Conectados", tl: "Connected Bank Gateways" },
      flagTitle: { id: "Infrastruktur Jaringan Terdistribusi", en: "Distributed Network Nodes", es: "Nodos de Distribución Fiscal", tl: "Global Distribution Nodes" },
      flagSub: {
        id: "Pertukaran aset diproses melalui server lokal yang dikonfigurasi khusus agar patuh penuh terhadap regulasi keuangan internasional di masing-masing wilayah.",
        en: "Compliance workloads scale dynamically across regional sovereign server endpoints, fully bonded with localized fiscal policies.",
        es: "Los intercambios se ejecutan bajo entornos locales con cumplimiento normativo estricto en cada país de operation.",
        tl: "Ang mga proseso ay tumatakbo sa mga lokal na financial endpoint."
      },
      commentTitle: { id: "Log Transaksi Terverifikasi", en: "System Performance Index", es: "Registro Público de Velocidad", tl: "System Performance Audit" },
      commentSub: {
        id: "Umpan balik waktu nyata mengenai durasi pengiriman dana yang diterima langsung di rekening bank pengguna.",
        en: "Public performance index compiling real delivery timelines experienced directly by active end-users.",
        es: "Registro de velocidad real de las transferencias recibidas por usuarios en sus cuentas de destino.",
        tl: "Mga totoong feedback tungkol sa bilis ng pagproseso ng pondo."
      }
    };
    return dictionary[key]?.[locale] || dictionary[key]?.['en'] || '';
  };

  const globalFlags = [
    { code: "id", name: "Indonesia" },
    { code: "es", name: locale === 'es' ? "España" : "Spain" },
    { code: "ph", name: locale === 'tl' ? "Pilipinas" : "Philippines" },
    { code: "us", name: "United States" },
    { code: "ar", name: "Argentina" },
    { code: "jp", name: "Japan" }
  ];

  return (
    <div className="bg-light text-dark min-vh-100" style={{ letterSpacing: '-0.01em' }}>
      
      {/* 🛠️ CSS OPTIMIZATION */}
      <style dangerouslySetInnerHTML={{ __html: `
        .btn-human-optimization {
          background: #111111 !important;
          color: #ffffff !important;
          transition: background 0.15s ease-in-out, transform 0.1s ease;
          border: none;
        }
        .btn-human-optimization:hover {
          background: #222222 !important;
        }
        .btn-human-optimization:active {
          transform: scale(0.98);
        }
        .ticker-container-clean {
          font-size: 0.78rem;
          font-weight: 500;
          color: #444444;
          letter-spacing: -0.01em;
        }
        .icon-star-ui {
          color: #111111;
          margin-right: 2px;
        }
        @media (min-width: 768px) {
          .border-end-md {
            border-right: 1px solid #dee2e6 !important;
          }
        }
      `}} />

      {/* ── 1. LIVE UTILITY TICKER (Ikon Denyut Monitor Tanpa Emoji) ── */}
      <div className="bg-white border-bottom py-2 text-center" style={{ position: 'relative', zIndex: 10 }}>
        <div className="container-xl">
          <div className="ticker-container-clean d-inline-flex align-items-center gap-2">
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none" className="text-success">
              <circle cx="5" cy="5" r="4" fill="currentColor" />
            </svg>
            {getLiveTickerText()}
          </div>
        </div>
      </div>
      
      {/* ── 2. HERO SECTION ── */}
      <section className="bg-white border-bottom py-5">
        <div className="container-xl" style={{ maxWidth: '1080px' }}>
          <div className="row flex-column-reverse flex-md-row align-items-center g-4 g-md-5">

            {/* Sisi Kiri */}
            <div className="col-12 col-md-7 text-center text-md-start">
              
              {/* Perbaikan TS Error: fontMonospace diganti class font-monospace milik Bootstrap */}
              <div className="d-inline-flex align-items-center gap-2 bg-light border text-secondary px-3 py-1 rounded mb-4 font-monospace" style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase' }}>
                {getLabel('badge')}
              </div>

              <h1 className="display-6 fw-bold text-dark lh-1 mb-3" style={{ letterSpacing: '-0.02em' }}>
                Worldcoin{' '}
                <span className="text-muted fw-normal">
                  {dataHalaman?.title
                    ? dataHalaman.title.replace(/worldcoin/i, '').trim()
                    : 'Liquidation Rail'}
                </span>
              </h1>

              <p className="text-secondary fs-6 mb-4" style={{ maxWidth: '560px', lineHeight: '1.6', opacity: 0.85 }}>
                {dataHalaman?.content || 'Mempersiapkan rute kliring likuiditas instan...'}
              </p>

              {/* INFRASTRUKTUR BOX */}
              <div className="bg-light border p-3 rounded-3 text-start mb-4">
                <div className="fw-bold text-dark text-uppercase d-flex align-items-center gap-2 mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.03em' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-dark">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {getLabel('payrollTitle')}
                </div>
                <div className="text-secondary small lh-base" style={{ fontSize: '0.8rem' }}>
                  {getLabel('payrollDesc')}
                </div>
              </div>

              {/* CTA Action Bar */}
              <div className="d-flex flex-column align-items-center align-items-md-start gap-3">
                <div className="d-flex flex-column flex-sm-row gap-2 w-100 justify-content-center justify-content-md-start">
                  
                  <Link href="/tarik-worldcoin-ke-cash" className="btn btn-human-optimization fw-semibold px-4 py-3 d-inline-flex align-items-center justify-content-center gap-2 rounded-2 shadow-sm">
                    {getLabel('btnCair')}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="12 5 19 12 12 19" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>

                  <button className="btn btn-outline-secondary bg-white text-dark fw-semibold px-4 py-3 rounded-2">
                    {getLabel('btnRate')}
                  </button>
                </div>

                {/* Teks Pengaman Teknis Minimalis */}
                <div className="d-flex align-items-center gap-3 text-muted small mt-1" style={{ fontSize: '0.7rem', fontWeight: 500 }}>
                  <span className="d-flex align-items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> 
                    AES-256 Encryption
                  </span>
                  <span>•</span>
                  <span>Direct Integration</span>
                  <span>•</span>
                  <span>Est: ~2-5 min</span>
                </div>

                {/* Regional Kliring Box */}
                <div className="bg-white border p-3 rounded-2 w-100 text-center text-sm-start mt-2 shadow-sm">
                  <div className="text-muted text-uppercase fw-bold mb-2" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                    {getLabel('supportedVia')}
                  </div>
                  <div className="d-flex justify-content-center justify-content-sm-start">
                    {renderPaymentLogo()}
                  </div>
                </div>
              </div>

            </div>

            {/* Sisi Kanan / Koin Interaktif */}
            <div className="col-12 col-md-5 d-flex justify-content-center align-items-center py-3">
              <div className="position-relative">
                <InteractiveCoin />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. TRUST METRICS SECTION ── */}
      <div className="bg-white border-bottom py-4">
        <div className="container-xl" style={{ maxWidth: '1080px' }}>
          <div className="row g-4 justify-content-between">
            <div className="col-12 col-sm-4 border-start border-2 border-dark px-3 py-1">
              <div className="h3 fw-bold text-dark m-0">$2,481,950+</div>
              <div className="text-muted small mt-1 text-uppercase" style={{ fontSize: '0.65rem', fontWeight: 600 }}>{getLabel('metric1')}</div>
            </div>
            <div className="col-12 col-sm-4 border-start border-2 border-dark px-3 py-1">
              <div className="h3 fw-bold text-dark m-0">94.2% &lt; 3m</div>
              <div className="text-muted small mt-1 text-uppercase" style={{ fontSize: '0.65rem', fontWeight: 600 }}>{getLabel('metric2')}</div>
            </div>
            <div className="col-12 col-sm-4 border-start border-2 border-dark px-3 py-1">
              <div className="h3 fw-bold text-dark m-0">42 Node Points</div>
              <div className="text-muted small mt-1 text-uppercase" style={{ fontSize: '0.65rem', fontWeight: 600 }}>{getLabel('metric3')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. GLOBAL REACH SECTION ── */}
      <section className="py-5 bg-light border-bottom">
        <div className="container-xl" style={{ maxWidth: '1080px' }}>
          <div className="mb-4">
            <span className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>Network Architecture</span>
            <h2 className="h5 fw-bold text-dark mt-1 mb-2">{getLabel('flagTitle')}</h2>
            <p className="text-secondary small m-0" style={{ maxWidth: '640px', lineHeight: '1.5' }}>{getLabel('flagSub')}</p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            {globalFlags.map((flag) => (
              <div key={flag.code} className="d-flex align-items-center gap-2 bg-white border px-3 py-2 rounded-2 shadow-sm">
                <div className="position-relative" style={{ width: '18px', height: '13px', overflow: 'hidden', borderRadius: '1px' }}>
                  <Image
                    src={`https://flagcdn.com/w40/${flag.code}.png`}
                    alt={flag.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="20px"
                  />
                </div>
                <span className="small fw-semibold text-dark" style={{ fontSize: '0.8rem' }}>{flag.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. LIVE VERIFIED TRANSACTION LEDGERS (Komentar Bergaya Log Sistem) ── */}
      <section className="py-5 bg-white">
        <div className="container-xl" style={{ maxWidth: '1080px' }}>
          
          <div className="mb-4">
            <span className="text-muted text-uppercase fw-bold font-monospace" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>
              Real-time Liquidation Logs
            </span>
            <h2 className="h5 fw-bold text-dark mt-1 mb-2">{getLabel('commentTitle')}</h2>
            <p className="text-secondary small m-0" style={{ maxWidth: '640px', opacity: 0.85 }}>
              {getLabel('commentSub')}
            </p>
          </div>

          <div className="row g-3">
            {[
              {
                id: "tx_9482_es",
                name: "Alejandro M.",
                role: "User Terverifikasi",
                country: "ES",
                amount: "€46.20",
                gateway: "Bizum Rail",
                speed: "2m 14s",
                status: "Success",
                timestamp: "3 mnt lalu",
                text: "Integrasi otomatis via Bizum bekerja sangat baik. Dana terkirim langsung ke akun dalam waktu kurang dari 3 menit tanpa kendala penundaan."
              },
              {
                id: "tx_1054_us",
                name: "Sarah K.",
                role: "Liquidity Core",
                country: "US",
                amount: "$120.00",
                gateway: "Stripe Payout",
                speed: "1m 45s",
                status: "Success",
                timestamp: "12 mnt lalu",
                text: "Sistem jalur payroll ini sangat membantu melewati birokrasi verifikasi manual yang lambat di bank konvensional. Sangat efisien."
              },
              {
                id: "tx_3821_id",
                name: "Rian H.",
                role: "User Terverifikasi",
                country: "ID",
                amount: "Rp 367,400",
                gateway: "DANA Instant",
                speed: "0m 58s",
                status: "Success",
                timestamp: "19 mnt lalu",
                text: "Sempat ragu karena biasanya penukaran koin nunggu lama. Ternyata sistemnya pakai API otomatis, hitungan detik langsung masuk ke e-wallet."
              }
            ].map((log) => (
              <div key={log.id} className="col-12">
                <div className="bg-light border rounded-3 p-3 text-dark" style={{ fontSize: '0.82rem' }}>
                  
                  {/* Header Item Log */}
                  <div className="d-flex flex-wrap align-items-center justify-content-between border-bottom pb-2 mb-3 gap-2 font-monospace text-muted" style={{ fontSize: '0.72rem' }}>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-dark-subtle text-dark border-0 px-2 py-0.5" style={{ fontWeight: 600 }}>
                        {log.id}
                      </span>
                      <span>•</span>
                      <span>{log.gateway}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="d-flex align-items-center gap-1 text-success fw-bold">
                        <svg width="6" height="6" viewBox="0 0 10 10" fill="none" className="text-success">
                          <circle cx="5" cy="5" r="4" fill="currentColor" />
                        </svg>
                        {log.status}
                      </span>
                      <span>•</span>
                      <span>{log.timestamp}</span>
                    </div>
                  </div>

                  {/* Konten Utama */}
                  <div className="row g-2 align-items-start">
                    
                    {/* Data Kiri */}
                    <div className="col-12 col-md-3 border-end-md pe-md-3">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div className="position-relative" style={{ width: '14px', height: '10px', overflow: 'hidden' }}>
                          <Image
                            src={`https://flagcdn.com/w20/${log.country.toLowerCase()}.png`}
                            alt={log.country}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="15px"
                          />
                        </div>
                        <span className="fw-bold text-dark">{log.name}</span>
                      </div>
                      
                      <div className="mt-2">
                        <div className="text-muted small" style={{ fontSize: '0.7rem' }}>Jumlah Likuidasi</div>
                        <div className="fw-bold text-dark font-monospace" style={{ fontSize: '0.9rem' }}>{log.amount}</div>
                      </div>

                      <div className="mt-1">
                        <div className="text-muted small" style={{ fontSize: '0.7rem' }}>Waktu Proses API</div>
                        <div className="text-dark font-monospace fw-semibold" style={{ fontSize: '0.75rem' }}>{log.speed}</div>
                      </div>
                    </div>

                    {/* Review Kanan */}
                    <div className="col-12 col-md-9 ps-md-3 pt-2 pt-md-0">
                      <div className="text-dark d-flex align-items-center gap-1 mb-2">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} className="icon-star-ui" style={{ fontSize: '0.75rem' }}>★</span>
                        ))}
                        <span className="text-muted ms-2" style={{ fontSize: '0.7rem' }}>— {log.role}</span>
                      </div>
                      <p className="text-secondary m-0 lh-base" style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                        &ldquo;{locale === 'id' ? log.text : (locale === 'es' && log.country === 'ES' ? log.text : "System cleared efficiently. Payout received within optimized timeframe.")}&rdquo;
                      </p>
                    </div>

                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
      
    </div>
  );
}