import { NextResponse } from 'next/server';

export const revalidate = 30; // Cache respons selama 30 detik di Vercel Edge/CDN

const BINANCE_URL = 'https://api.binance.com/api/v3/ticker/price?symbol=WLDUSDT';
const FIAT_URL = 'https://open.er-api.com/v6/latest/USD';

// Fallback data jika salah satu atau kedua API down
const FALLBACK_PRICES: Record<string, { currency: string; rate: number; priceUSD: number }> = {
  id: { currency: 'IDR', rate: 15400, priceUSD: 3.15 }, // Perkiraan kasaran, dihitung dinamis nanti
  es: { currency: 'EUR', rate: 0.92, priceUSD: 3.15 },
  tl: { currency: 'PHP', rate: 58.7, priceUSD: 3.15 },
  en: { currency: 'USD', rate: 1.0, priceUSD: 3.15 },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = (searchParams.get('locale') || 'en') as 'id' | 'en' | 'es' | 'tl';

  // Set timeout aman 5 detik menggunakan AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const [marketRes, fiatRes] = await Promise.all([
      fetch(BINANCE_URL, { cache: 'no-store', signal: controller.signal }),
      fetch(FIAT_URL, { next: { revalidate: 300 }, signal: controller.signal }) // Cache fiat lebih lama karena jarang berubah
    ]);

    clearTimeout(timeoutId);

    if (!marketRes.ok || !fiatRes.ok) {
      throw new Error('Gagal mengambil data dari upstream API');
    }

    const marketData = await marketRes.json();
    const fiatData = await fiatRes.json();

    const priceUSD = parseFloat(marketData.price || '0');
    if (!priceUSD) throw new Error('Format data Binance tidak valid');

    let rate = 1;
    let currencyCode = 'USD';

    switch (locale) {
      case 'id':
        currencyCode = 'IDR';
        rate = fiatData.rates?.IDR || 15400;
        break;
      case 'es':
        currencyCode = 'EUR';
        rate = fiatData.rates?.EUR || 0.92;
        break;
      case 'tl':
        currencyCode = 'PHP';
        rate = fiatData.rates?.PHP || 58.7;
        break;
      default:
        currencyCode = 'USD';
        rate = 1;
    }

    const localPrice = priceUSD * rate;

    return NextResponse.json({
      priceUSD,
      localPrice,
      currency: currencyCode,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=59',
      }
    });

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('API Route Error, menggunakan fallback:', error);

    // Ambil basis fallback sesuai kebutuhan halaman
    const fallback = FALLBACK_PRICES[locale] || FALLBACK_PRICES['en'];
    
    // Fallback statis sesuai instruksi spesifik halaman Anda jika dihitung manual
    const specificFallbackLocal: Record<string, number> = { id: 48500, es: 2.95, tl: 185, en: 3.15 };

    return NextResponse.json({
      priceUSD: fallback.priceUSD,
      localPrice: specificFallbackLocal[locale] || 3.15,
      currency: fallback.currency,
      isFallback: true
    });
  }
}