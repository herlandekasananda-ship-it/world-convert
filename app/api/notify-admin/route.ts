import { NextResponse } from 'next/server';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { createClient } from '@supabase/supabase-js';

// 1. Inisialisasi Expo Server SDK
const expo = new Expo();

// 2. Inisialisasi Klien Supabase menggunakan Environment Variables server Anda
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function POST(request: Request) {
  try {
    // 3. Ambil data payload transaksi yang dikirim oleh frontend web
    const body = await request.json();
    const { jumlahWld, namaPemilik } = body;

    // Validasi input data dasar
    if (!jumlahWld || !namaPemilik) {
      return NextResponse.json(
        { error: 'Gagal memproses, data transaksi tidak lengkap.' }, 
        { status: 400 }
      );
    }

    // 4. Ambil semua token perangkat admin yang aktif dari database Supabase
    const { data: adminTokens, error: tokenError } = await supabase
      .from('admin_tokens')
      .select('token');

    if (tokenError) {
      console.error("🚨 Supabase Error:", tokenError.message);
      throw tokenError;
    }

    // Jika tidak ada token terdaftar di database, hentikan proses dengan aman
    if (!adminTokens || adminTokens.length === 0) {
      return NextResponse.json(
        { message: 'Notifikasi dilewati, tidak ada token admin yang terdaftar di database.' }, 
        { status: 200 }
      );
    }

    // 5. Susun struktur pesan push notification untuk setiap token admin
    const messages: ExpoPushMessage[] = [];
    
    for (const item of adminTokens) {
      // Validasi formal: memastikan string token adalah format Expo yang valid (ExponentPushToken[...])
      if (!Expo.isExpoPushToken(item.token)) {
        console.error(`⚠️ Token tidak valid terdeteksi di database (diabaikan): ${item.token}`);
        continue;
      }

      // Masukkan ke dalam antrean kirim
      messages.push({
        to: item.token,
        sound: 'default',
        title: '📊 Antrean Pencairan Baru Masuk!',
        body: `Ada masuk ${jumlahWld} WLD dari an. ${namaPemilik}. Segera cek dashboard admin!`,
        priority: 'high',
        data: { 
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          type: 'new_transaction'
        },
      });
    }

    // 6. Kirim pesan ke Expo Gateway dengan metode Chunking otomatis
    // Ini membagi token secara aman per batch (maksimal 100 token per kirim) agar tidak diblokir server Expo
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("🚨 Gagal mengirim batch notifikasi ke Expo:", error);
      }
    }

    // Kembalikan respons sukses ke frontend web
    return NextResponse.json({ 
      success: true, 
      message: 'Push notification berhasil diteruskan ke sistem antrean Expo.',
      totalDikirim: messages.length 
    }, { status: 200 });

  } catch (error: unknown) {
    // 🛠️ PERBAIKAN: Mengamankan tipe data error agar lolos dari validasi strict ESLint TypeScript
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error("🚨 Internal API Error:", errorMessage);
    
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada internal server API.', detail: errorMessage }, 
      { status: 500 }
    );
  }
}