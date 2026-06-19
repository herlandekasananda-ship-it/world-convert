// lib/db.ts
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path'; // 🚀 Wajib diimpor

export interface KontenData {
  page: string;
  locale: string;
  title: string;
  content: string;
}

export interface DataSchema {
  konten: KontenData[];
}

let db: Low<DataSchema> | null = null;

export async function getDatabase() {
  if (!db) {
    // 🚀 SOLUSI UTAMA VERCEL: Menggunakan process.cwd() agar sistem tahu db.json ada di folder utama proyek
    const file = path.join(process.cwd(), 'db.json');
    const adapter = new JSONFile<DataSchema>(file);
    
    db = new Low<DataSchema>(adapter, { konten: [] });
    await db.read();
  } else {
    // Paksa baca ulang data setiap ada request baru
    await db.read();
  }
  return db;
}