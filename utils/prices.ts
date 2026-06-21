/**
 * Mengambil harga live koin WLD melalui internal API Route Next.js
 */
export async function fetchWldPrices(currencyCode: string, signal?: AbortSignal) {
  try {
    // Menembak ke API lokal kita sendiri, otomatis aman dari CORS dan blokir internet HP
    const res = await fetch(`/api/prices?currency=${currencyCode}`, { 
      cache: 'no-store',
      signal 
    });
    
    if (!res.ok) {
      throw new Error("Gagal mengambil data dari server lokal");
    }

    return await res.json(); // Mengembalikan objek { priceInUSD, priceInLocal }
  } catch (error) {
    console.error("Error fetching WLD prices:", error);
    throw error;
  }
}