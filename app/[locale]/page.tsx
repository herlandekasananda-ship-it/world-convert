// app/[locale]/page.tsx
import { getDatabase, KontenData } from '@/lib/db';
import Image from 'next/image';
import { Link } from '@/i18n/routing'; 

interface Props {
  params: Promise<{ locale: string }>;
}

// 🚀 TAMBAHKAN FUNGSI INI: Memberitahu Next.js rute bahasa apa saja yang sah saat Build Time
export async function generateStaticParams() {
  return [
    { locale: 'id' },
    { locale: 'en' },
    { locale: 'es' },
    { locale: 'tl' }
  ];
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const db = await getDatabase();

  // 1. Ambil konten dari Lowdb berdasarkan locale yang aktif
  const dataHalaman = db.data.konten.find(
    (item: KontenData) => item.page === 'home' && item.locale === locale
  );

  // 2. Sistem Kamus Label Statis 4 Bahasa (ID, EN, ES, TL)
  const getLabel = (key: string) => {
    const dictionary: Record<string, Record<string, string>> = {
      badge: {
        id: "⚡ Terpercaya & Tercepat Global",
        en: "⚡ Trusted & Fastest Globally",
        es: "⚡ Confiable y Más Rápido Global",
        tl: "⚡ Maaasahan at Pinakamabilis Global"
      },
      btnCair: {
        id: "Cairkan Sekarang",
        en: "Withdraw Now",
        es: "Retirar Ahora",
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
        es: "Reseñas honestas de clientes globales que han retirado sus monedas con éxito.",
        tl: "Mga tapat na pagsusuri mula sa mga global na customer na matagumpay na nag-withdraw."
      }
    };

    return dictionary[key]?.[locale] || dictionary[key]?.[ 'en'];
  };

  // 3. Testimoni Dinamis Berbasis Bahasa
  const dummyComments = [
    { 
      id: 1, 
      name: "Alejandro M.", 
      role: "Verified Orb User", 
      country: "ES", 
      rating: "⭐⭐⭐⭐⭐",
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
      rating: "⭐⭐⭐⭐⭐",
      text: locale === 'id' ? "Rate-nya sangat kompetitif dan transparan." :
            locale === 'es' ? "La tarifa resultó ser muy competitiva y transparente." :
            locale === 'tl' ? "Ang rate ay napakahusay at transparent." :
            "The rate turned out to be highly competitive and transparent."
    }
  ];

  const globalFlags = [
    { code: "id", name: "Indonesia" },
    { code: "es", name: locale === 'es' ? "España" : "Spain/Spanyol" },
    { code: "ph", name: locale === 'tl' ? "Pilipinas" : "Philippines" },
    { code: "us", name: "United States" },
    { code: "ar", name: "Argentina" },
    { code: "jp", name: "Japan" }
  ];

  return (
    <div style={{ padding: '2rem 1rem', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', color: '#1e293b' }}>
      
      {/* 1. HERO SECTION */}
      <section style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4rem', padding: '1rem' }}>
        <div style={{ flex: '1 1 450px' }}>
          <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600 }}>
            {getLabel('badge')}
          </span>
          <h1 style={{ color: '#2563eb', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1.25rem', marginTop: '1rem', lineHeight: '1.2', letterSpacing: '-0.02em' }}>
            {dataHalaman?.title || 'Worldcoin Cash Out'}
          </h1>
          <p style={{ color: '#475569', fontSize: '1.125rem', lineHeight: '1.75', whiteSpace: 'pre-line', marginBottom: '2rem' }}>
            {dataHalaman?.content || 'Content Not Found'}
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link 
              href="/tarik-worldcoin-ke-cash"
              style={{ 
                backgroundColor: '#2563eb', 
                color: '#ffffff', 
                padding: '0.75rem 1.5rem', 
                borderRadius: '8px', 
                fontWeight: 'bold', 
                fontSize: '1rem', 
                cursor: 'pointer', 
                textDecoration: 'none',
                display: 'inline-block',
                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' 
              }}
            >
              {getLabel('btnCair')}
            </Link>
            <button style={{ backgroundColor: '#ffffff', color: '#475569', padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
              {getLabel('btnRate')}
            </button>
          </div>
        </div>

        <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '450px', height: '300px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <Image 
              src="https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=600&auto=format&fit=crop" 
              alt="Crypto Dashboard" 
              fill
              style={{ objectFit: 'cover' }}
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* 2. TRUST METRICS */}
      <section style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-around', textAlign: 'center', marginBottom: '4rem' }}>
        <div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>$2.5M+</div>
          <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>{getLabel('metric1')}</div>
        </div>
        <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '2rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>&lt; 5 Min</div>
          <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>{getLabel('metric2')}</div>
        </div>
        <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '2rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>15,000+</div>
          <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>{getLabel('metric3')}</div>
        </div>
      </section>

      {/* 3. SECTION BENDERA */}
      <section style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.5rem' }}>{getLabel('flagTitle')}</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>{getLabel('flagSub')}</p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          {globalFlags.map((flag) => (
            <div key={flag.code} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ffffff', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '24px', height: '18px', position: 'relative', overflow: 'hidden', borderRadius: '2px' }}>
                <Image 
                  src={`https://flagcdn.com/w40/${flag.code}.png`} 
                  alt={`Flag`}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#334155' }}>{flag.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. COMMENTS */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.5rem' }}>{getLabel('commentTitle')}</h2>
          <p style={{ color: '#64748b' }}>{getLabel('commentSub')}</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center' }}>
          {dummyComments.map((comment) => (
            <div key={comment.id} style={{ flex: '1 1 300px', maxWidth: '360px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#0f172a' }}>{comment.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{comment.role}</div>
                </div>
                <div style={{ marginLeft: 'auto', width: '20px', height: '15px', position: 'relative' }}>
                  <Image 
                    src={`https://flagcdn.com/w20/${comment.country.toLowerCase()}.png`} 
                    alt="Flag" 
                    fill
                  />
                </div>
              </div>
              <div style={{ color: '#fbbf24', marginBottom: '0.5rem', fontSize: '0.875rem' }}>{comment.rating}</div>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                &ldquo;{comment.text}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}