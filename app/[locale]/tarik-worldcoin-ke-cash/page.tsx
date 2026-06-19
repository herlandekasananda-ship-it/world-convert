// app/[locale]/tarik-worldcoin-ke-cash/page.tsx
import { getDatabase, KontenData } from '@/lib/db';
import { Link } from '@/i18n/routing';

interface Props {
  params: Promise<{ locale: string }>;
}

// 🚀 Daftarkan parameter statis agar tidak 404 saat build di Vercel
export async function generateStaticParams() {
  return [
    { locale: 'id' },
    { locale: 'en' },
    { locale: 'es' },
    { locale: 'tl' }
  ];
}

export default async function PencairanPage({ params }: Props) {
  const { locale } = await params;
  const db = await getDatabase();

  // 1. Sinkronisasi Otomatis dengan Lowdb berdasarkan page 'pencairan' & locale aktif
  const dataPencairan = db.data.konten.find(
    (item: KontenData) => item.page === 'pencairan' && item.locale === locale
  );

  // 2. Kamus Label Komponen Formulir (ID, EN, ES, TL)
  const getLabel = (key: string) => {
    const dictionary: Record<string, Record<string, string>> = {
      btnKembali: { id: "← Kembali", en: "← Back", es: "← Volver", tl: "← Bumalik" },
      labelWallet: { id: "Alamat Dompet WLD (Optimism / World Chain)", en: "WLD Wallet Address (Optimism / World Chain)", es: "Dirección de Billetera WLD", tl: "WLD Wallet Address" },
      labelMetode: { id: "Pilih Metode Penarikan", en: "Select Withdrawal Method", es: "Seleccionar Método de Retiro", tl: "Pilihin ang Pamamaraan ng Pag-withdraw" },
      labelJumlah: { id: "Jumlah WLD yang Dicairkan", en: "Amount of WLD to Cash Out", es: "Cantidad de WLD a Retirar", tl: "Halaga ng WLD na I-cash Out" },
      btnSubmit: { id: "Proses Pencairan", en: "Process Withdrawal", es: "Procesar Retiro", tl: "Iproses ang Pag-withdraw" }
    };
    return dictionary[key]?.[locale] || dictionary[key]?.[ 'en'];
  };

  return (
    <div style={{ padding: '2rem 1rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', color: '#1e293b' }}>
      
      {/* Tombol Kembali ke Home */}
      <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem', display: 'inline-block', marginBottom: '2rem' }}>
        {getLabel('btnKembali')}
      </Link>

      {/* Konten Dinamis dari db.json */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ color: '#0f172a', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
          {dataPencairan?.title || 'Formulir Pencairan'}
        </h1>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: '1.6' }}>
          {dataPencairan?.content || 'Loading...'}
        </p>
      </div>

      {/* Komponen Tampilan Formulir */}
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        
        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{getLabel('labelWallet')}</label>
          <input type="text" placeholder="0x..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{getLabel('labelJumlah')}</label>
          <input type="number" placeholder="Min. 3 WLD" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{getLabel('labelMetode')}</label>
          <select style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', boxSizing: 'border-box' }}>
            <option>DANA / OVO / GoPay / LinkAja</option>
            <option>Bank Transfer (BCA, Mandiri, BRI, BNI)</option>
            <option>International / Local E-Wallet Option</option>
          </select>
        </div>

        <button type="button" style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '0.85rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}>
          {getLabel('btnSubmit')}
        </button>

      </form>
    </div>
  );
}