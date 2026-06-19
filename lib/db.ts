// lib/db.ts
import { JSONFilePreset } from 'lowdb/node';
import path from 'path'; // 🚀 TAMBAHKAN INI

// 1. Struktur data tetap sama (Strongly Typed)
export interface KontenData {
  page: string;
  locale: string;
  title: string;
  content: string;
}

export interface DatabaseSchema {
  konten: KontenData[];
}

// 2. SINKRONISASI GLOBAL: Menyediakan cetakan awal untuk 4 bahasa resmi Anda
const defaultData: DatabaseSchema = { 
  konten: [
    {
      page: "home",
      locale: "id",
      title: "Jasa Pencairan World App Cepat & Aman",
      content: "Ubah saldo World App (WLD) Anda menjadi uang tunai nyata secara instan. Kami menyediakan layanan penarikan paling aman, cepat, dan terpercaya dengan rate kompetitif.\n\n✅ Proses Instan (3-5 Menit)\n✅ Dukungan Profesional 24/7\n✅ Transaksi Aman & Privat"
    },
    {
      page: "home",
      locale: "en",
      title: "Fast & Secure World App Cash Out Service",
      content: "Convert your World App (WLD) balance into real cash instantly. We provide the safest, fastest, and most reliable withdrawal service with competitive rates.\n\n✅ Instant Processing\n✅ 24/7 Professional Support\n✅ Secure & Private Transactions"
    },
    {
      page: "home",
      locale: "es",
      title: "Servicio de Retiro de Fondos de World App",
      content: "Ofrecemos un servicio rápido, seguro y confiable para ayudarte a convertir el saldo disponible en tu cuenta de World App en dinero en efectivo.\n\n✅ Procesamiento rápido y eficiente.\n✅ Atención profesional y soporte personalizado.\n✅ Transacciones seguras con prioridad en la privacidad.\n✅ Tarifas competitivas y comunicación clara."
    },
    {
      page: "home",
      locale: "tl",
      title: "Mabilis at Ligtas na World App Cash Out Service",
      content: "Palitan ang iyong World App (WLD) balance ng totoong pera agad-agad. Nagbibigay kami ng pinakaligtas, pinakamabilis, at pinakamaaasahang serbisyo sa pag-withdraw sa magandang rate.\n\n✅ Instant na Proseso\n✅ 24/7 Propesyonal na Suporta\n✅ Ligtas at Pribadong Transaksyon"
    }
  ] 
};

// 3. Fungsi untuk mengambil database
export async function getDatabase() {
  // 🚀 PERBAIKAN VERCEL: Gabungkan process.cwd() agar rute file db.json menjadi absolut di server cloud
  const dbPath = path.join(process.cwd(), 'db.json');
  
  const db = await JSONFilePreset<DatabaseSchema>(dbPath, defaultData);
  
  // Pastikan data terbaru selalu dibaca ulang dari disk setiap kali fungsi dipanggil
  await db.read(); 
  
  return db;
}