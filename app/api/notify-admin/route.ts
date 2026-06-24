import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xyz.supabase.co";
// Gunakan Service Role Key jika ada, atau Anon Key di file .env server Anda
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-key";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jumlahWld, namaPemilik, metodeBayar, namaBank } = body;

    // 1. 🔍 AMBIL SEMUA TOKEN HP ADMIN YANG AKTIF DARI DATABASE SUPABASE
    const { data: adminTokens, error: tokenError } = await supabase
      .from('admin_tokens')
      .select('token');

    if (tokenError) {
      console.error("Gagal mengambil token admin dari database:", tokenError.message);
      return NextResponse.json({ error: 'Database token fetch failed' }, { status: 500 });
    }

    if (!adminTokens || adminTokens.length === 0) {
      console.warn("⚠️ Tidak ada token HP admin yang terdaftar di tabel 'admin_tokens'.");
      return NextResponse.json({ message: 'No admin tokens found in database' }, { status: 200 });
    }

    // 2. 🎛️ RANGKAI PESAN NOTIFIKASI SECARA DETAIL
    const namaTempat = namaBank ? namaBank.toUpperCase() : metodeBayar.toUpperCase();
    const titleMessage = `🚨 PESANAN BARU MASUK!`;
    const bodyMessage = `${namaPemilik} ingin mencairkan ${jumlahWld} WLD ke ${namaTempat}. Periksa panel admin sekarang!`;

    // 3. ✉️ BUAT ARRAY MESSAGES UNTUK EXPO SERVER
    // Menyaring token agar formatnya valid ("ExponentPushToken[...]")
    const messages = adminTokens
      .filter(item => item.token && item.token.startsWith('ExponentPushToken'))
      .map(item => ({
        to: item.token,
        sound: 'default',
        title: titleMessage,
        body: bodyMessage,
        data: { dataTerlampir: 'buka_aplikasi_admin' },
      }));

    if (messages.length === 0) {
      return NextResponse.json({ message: 'No valid Expo push tokens found' }, { status: 200 });
    }

    // 4. 🚀 TEMBAK KE SERVER EXPO (Sisi Backend Next.js Aman dari CORS)
    const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const expoResult = await expoResponse.json();
    console.log("✅ Laporan Pengiriman Expo API:", JSON.stringify(expoResult));

    return NextResponse.json({ success: true, sentCount: messages.length });
  } catch (error) {
    console.error("Error pada internal notify route:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}