/**
 * Mengambil harga live koin WLD dalam USD dan mata uang lokal menggunakan CoinGecko API
 * @param currencyCode Kode mata uang target (IDR, EUR, PHP, dll)
 * @returns Object berisi harga USD dan harga lokal
 */
export async function fetchWldPrices(currencyCode: string, signal?: AbortSignal) {
  const localCurrencyLower = currencyCode.toLowerCase();
  
  // 1. Panggil API CoinGecko simple price
  // Mengambil harga worldcoin dalam USD dan mata uang lokal sekaligus dalam 1 kali request!
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=worldcoin&vs_currencies=usd,${localCurrencyLower}`;
  
  const res = await fetch(url, { 
    // HEMAT DATA & ANTI LIMIT: CoinGecko versi gratis memiliki rate limit ketat.
    // Menggunakan cache 60 detik sangat disarankan agar tidak terkena Error 429 (Too Many Requests).
    next: { revalidate: 60 }, 
    signal 
  });
  
  if (!res.ok) {
    throw new Error(`Gagal mengambil data dari CoinGecko (Status: ${res.status})`);
  }

  const data = await res.json();
  const wldData = data?.worldcoin;

  if (!wldData || typeof wldData.usd === 'undefined') {
    throw new Error("Format data CoinGecko tidak valid");
  }

  const priceInUSD = wldData.usd;
  
  // Jika mata uang lokal tidak ditemukan di response CoinGecko, gunakan fallback USD
  const priceInLocal = wldData[localCurrencyLower] ?? priceInUSD;

  return {
    priceInUSD,
    priceInLocal
  };
}