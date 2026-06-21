/**
 * Mengambil harga live koin WLD dalam USD (via Bybit) dan mengonversinya ke mata uang lokal
 * @param currencyCode Kode mata uang target (IDR, EUR, PHP, dll)
 * @returns Object berisi harga USD dan harga lokal
 */
export async function fetchWldPrices(currencyCode: string, signal?: AbortSignal) {
  try {
    // 1. Ambil harga live WLD/USDT dari Bybit API (Lancar, tanpa blokir, & Real-time)
    const res = await fetch('https://api.bybit.com/v5/market/tickers?category=spot&symbol=WLDUSDT', { 
      cache: 'no-store',
      signal 
    });
    
    const marketData = await res.json();
    
    // Struktur data Bybit: result.list[0].lastPrice
    const rawPrice = marketData?.result?.list?.[0]?.lastPrice;
    
    if (!rawPrice) {
      throw new Error("Format data Bybit tidak valid atau koin tidak ditemukan");
    }

    const priceInUSD = parseFloat(rawPrice);

    if (currencyCode === 'USD') {
      return { priceInUSD, priceInLocal: priceInUSD };
    }

    // 2. Ambil rate konversi fiat (Menggunakan ExchangeRate-API yang stabil)
    // Di-cache 5 menit (300 detik) supaya kuota data user Anda hemat dan tidak boros!
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
      // Menyesuaikan harga dolar bank internasional ke harga USDT P2P Rupiah asli (~1.8% premium)
      targetRate = targetRate * 1.018; 
    } else if (currencyCode === 'PHP') {
      // Menyesuaikan ke harga P2P GCash Filipina (~1.2% premium)
      targetRate = targetRate * 1.012;
    }

    return {
      priceInUSD,
      priceInLocal: priceInUSD * targetRate
    };

  } catch (error) {
    console.error("Error fetching WLD prices:", error);
    throw error;
  }
}