/**
 * Mengambil harga live koin WLD dalam USD (via OKX API) dan mengonversinya ke mata uang lokal
 * @param currencyCode Kode mata uang target (IDR, EUR, PHP, dll)
 * @returns Object berisi harga USD dan harga lokal
 */
export async function fetchWldPrices(currencyCode: string, signal?: AbortSignal) {
  try {
    // 1. Ambil harga live WLD/USDT dari OKX API (Aman di server Vercel US & IP Indonesia)
    const res = await fetch('https://www.okx.com/api/v5/market/ticker?instId=WLD-USDT', { 
      cache: 'no-store',
      signal 
    });
    
    const marketData = await res.json();
    
    // Struktur data OKX: data[0].last (harga terakhir)
    const rawPrice = marketData?.data?.[0]?.last;
    
    if (!rawPrice) {
      throw new Error("Format data OKX tidak valid atau koin tidak ditemukan");
    }

    const priceInUSD = parseFloat(rawPrice);

    if (currencyCode === 'USD') {
      return { priceInUSD, priceInLocal: priceInUSD };
    }

    // 2. Ambil rate konversi fiat (Menggunakan ExchangeRate-API)
    const fiatRes = await fetch('https://open.er-api.com/v6/latest/USD', { 
      next: { revalidate: 300 }, 
      signal 
    });
    const fiatData = await fiatRes.json();
    let targetRate = fiatData.rates?.[currencyCode];

    if (!targetRate) {
      throw new Error(`Rate untuk mata uang ${currencyCode} tidak ditemukan`);
    }

    // 3. Penyesuaian Akurasi Pasar P2P Crypto Lokal (Spread Premium)
    if (currencyCode === 'IDR') {
      targetRate = targetRate * 1.018; 
    } else if (currencyCode === 'PHP') {
      targetRate = targetRate * 1.012;
    }

    return {
      priceInUSD,
      priceInLocal: priceInUSD * targetRate
    };

  } catch (error) {
    console.error("Error fetching WLD prices from OKX:", error);
    throw error;
  }
}