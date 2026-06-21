// app/api/prices/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currencyCode = searchParams.get('currency') || 'USD';

  try {
    // 1. Ambil harga dari OKX (dilakukan di sisi server, jadi aman dari CORS browser)
    const res = await fetch('https://www.okx.com/api/v5/market/ticker?instId=WLD-USDT', { 
      cache: 'no-store'
    });
    
    const marketData = await res.json();
    const rawPrice = marketData?.data?.[0]?.last;
    
    if (!rawPrice) {
      return NextResponse.json({ error: "Format data OKX tidak valid" }, { status: 400 });
    }

    const priceInUSD = parseFloat(rawPrice);

    if (currencyCode === 'USD') {
      return NextResponse.json({ priceInUSD, priceInLocal: priceInUSD });
    }

    // 2. Ambil rate fiat
    const fiatRes = await fetch('https://open.er-api.com/v6/latest/USD', { 
      next: { revalidate: 300 }
    });
    const fiatData = await fiatRes.json();
    let targetRate = fiatData.rates?.[currencyCode];

    if (!targetRate) {
      return NextResponse.json({ error: `Rate ${currencyCode} tidak ditemukan` }, { status: 404 });
    }

    // 3. Spread Premium P2P
    if (currencyCode === 'IDR') {
      targetRate = targetRate * 1.018; 
    } else if (currencyCode === 'PHP') {
      targetRate = targetRate * 1.012;
    }

    return NextResponse.json({
      priceInUSD,
      priceInLocal: priceInUSD * targetRate
    });

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}