// utils/binance.ts

/**
 * Mengambil harga live koin WLD dalam USD dan mengonversinya ke mata uang lokal
 * @param currencyCode Kode mata uang target (IDR, EUR, PHP, dll)
 * @returns Object berisi harga USD dan harga lokal
 */
export async function fetchWldPrices(currencyCode: string, signal?: AbortSignal) {
  // 1. Ambil harga live WLD/USDT dari Binance
  const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=WLDUSDT', { 
    cache: 'no-store',
    signal 
  });
  const marketData = await res.json();
  
  if (!marketData?.price) {
    throw new Error("Format data Binance tidak valid");
  }

  const priceInUSD = parseFloat(marketData.price);

  // Jika mata uang yang diminta adalah USD, tidak perlu konversi fiat tambahan
  if (currencyCode === 'USD') {
    return { priceInUSD, priceInLocal: priceInUSD };
  }

  // 2. Ambil rate konversi mata uang fiat eksternal
  const fiatRes = await fetch('https://open.er-api.com/v6/latest/USD', { signal });
  const fiatData = await fiatRes.json();
  const targetRate = fiatData.rates?.[currencyCode];

  if (!targetRate) {
    throw new Error(`Rate untuk mata uang ${currencyCode} tidak ditemukan`);
  }

  return {
    priceInUSD,
    priceInLocal: priceInUSD * targetRate
  };
}