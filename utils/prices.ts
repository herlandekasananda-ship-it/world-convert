/**
 * Mengambil harga live koin WLD dalam USD (via KuCoin) dan mengonversinya ke mata uang lokal
 * @param currencyCode Kode mata uang target (IDR, EUR, PHP, dll)
 * @returns Object berisi harga USD dan harga lokal
 */
export async function fetchWldPrices(currencyCode: string, signal?: AbortSignal) {
  try {
    // 1. Ambil harga live WLD/USDT dari KuCoin API (100% aman & lancar di Indonesia)
    const res = await fetch('https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=WLD-USDT', { 
      cache: 'no-store',
      signal 
    });
    
    const marketData = await res.json();
    
    // Struktur data KuCoin: data.price
    const rawPrice = marketData?.data?.price;
    
    if (!rawPrice) {
      throw new Error("Format data KuCoin tidak valid atau koin tidak ditemukan");
    }

    const priceInUSD = parseFloat(rawPrice);

    if (currencyCode === 'USD') {
      return { priceInUSD, priceInLocal: priceInUSD };
    }

    // 2. Ambil rate konversi fiat (Menggunakan ExchangeRate-API yang stabil)
    // Di-cache 5 menit (300 detik) agar hemat kuota data dan performa cepat
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
      // Menyesuaikan ke harga pasar USDT P2P Rupiah asli (~1.8% premium)
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
    console.error("Error fetching WLD prices from KuCoin:", error);
    throw error;
  }
}