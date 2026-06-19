// lib/db.ts
import { JSONFilePreset } from 'lowdb/node';

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

// 2. SINKRONISASI GLOBAL: Menyediakan cetakan awal untuk 'en' DAN 'id' 
const defaultData: DatabaseSchema = { 
  konten: [
    {
      page: "home",
      locale: "en",
      title: "Fast & Secure World App Cash Out Service",
      content: "Convert your World App (WLD) balance into real cash instantly. We provide the safest, fastest, and most reliable withdrawal service with competitive rates."
    },
    {
      page: "home",
      locale: "id", // 🔴 Ditambahkan agar versi Indonesia tidak kosong/error 404
      title: "Jasa Pencairan World App Cepat & Aman",
      content: "Ubah saldo World App (WLD) Anda menjadi uang tunai nyata secara instan. Kami menyediakan layanan penarikan paling aman, cepat, dan terpercaya dengan rate kompetitif."
    }
  ] 
};

// 3. Fungsi untuk mengambil database
export async function getDatabase() {
  // JSONFilePreset otomatis membaca (atau membuat jika belum ada) file db.json di root project
  const db = await JSONFilePreset<DatabaseSchema>('db.json', defaultData);
  return db;
}