/**
 * Mengambil harga live koin WLD dalam USD dan mengonversinya ke mata uang lokal
 * @param currencyCode Kode mata uang target (IDR, EUR, PHP, dll)
 * @returns Object berisi harga USD dan harga lokal
 */
export async function fetchWldPrices(currencyCode: string, signal?: AbortSignal) {
  // 1. Ambil harga live WLD/USDT dari Binance (Tetap real-time)
  const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=WLDUSDT', { 
    cache: 'no-store', // Harga crypto wajib real-time
    signal 
  });
  const marketData = await res.json();
  
  if (!marketData?.price) {
    throw new Error("Format data Binance tidak valid");
  }

  const priceInUSD = parseFloat(marketData.price);

  if (currencyCode === 'USD') {
    return { priceInUSD, priceInLocal: priceInUSD };
  }

  // 2. Ambil rate konversi mata uang fiat eksternal 
  // HEMAT DATA: Gunakan cache 5 menit (300 detik) agar tidak memakan paket data setiap 10 detik!
  const fiatRes = await fetch('https://open.er-api.com/v6/latest/USD', { 
    next: { revalidate: 300 }, // Untuk Next.js, atau biarkan default browser cache jika di client
    signal 
  });
  const fiatData = await fiatRes.json();
  let targetRate = fiatData.rates?.[currencyCode];

  if (!targetRate) {
    throw new Error(`Rate untuk mata uang ${currencyCode} tidak ditemukan`);
  }

  // 3. PENYESUAIAN AKURASI HARGA CRYPTO (CRYPTO PREMIUM)
  // Menambahkan penyesuaian nilai tukar agar sesuai dengan harga USDT/fiat di pasar P2P lokal
  if (currencyCode === 'IDR') {
    // Kurs P2P Rupiah biasanya berjarak ~1.5% sampai 2% lebih tinggi dari kurs bank internasional
    targetRate = targetRate * 1.018; 
  } else if (currencyCode === 'PHP') {
    // Kurs P2P Peso Filipina (GCash) biasanya berjarak ~1.2% lebih tinggi
    targetRate = targetRate * 1.012;
  }

  return {
    priceInUSD,
    priceInLocal: priceInUSD * targetRate
  };
}