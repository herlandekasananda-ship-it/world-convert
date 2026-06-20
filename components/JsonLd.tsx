// components/JsonLd.tsx
'use client';


interface JsonLdProps {
  locale: string;
}

export default function JsonLd({ locale }: JsonLdProps) {
  const baseUrl = 'https://world-convert.vercel.app'; // ⚠️ Ganti dengan domain asli Anda

  // Deskripsi dinamis agar Google paham konteks lokal di tiap negara
  const descriptions: Record<string, string> = {
    id: "Platform agen pencairan koin WLD (Worldcoin) langsung ke rekening bank lokal dan e-wallet secara instan.",
    es: "Plataforma de agentes para retirar monedas WLD directamente a su cuenta bancaria local o billetera digital.",
    tl: "Ang platform para sa pag-withdraw ng WLD coins diretso sa iyong lokal na bank account o e-wallet.",
    en: "The premier agent platform to cash out WLD coins directly to your local bank account or digital wallet instantly."
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    '@id': `${baseUrl}/${locale}/#financial-service`,
    'name': 'WorldCair',
    'url': `${baseUrl}/${locale}`,
    'logo': `${baseUrl}/logo.png`,
    'image': `${baseUrl}/og-image.png`,
    'description': descriptions[locale] || descriptions['en'],
    'priceRange': '$$',
    // Memberitahu Google aset apa yang Anda transaksikan
    'currenciesAccepted': 'WLD, IDR, PHP, USD, EUR',
    'paymentAccepted': 'Bank Transfer, Digital Wallet, GCash, Dana, OVO',
    // Sinyal kuat untuk SEO Internasional bahwa Anda melayani global target
    'areaServed': [
      { '@type': 'Country', 'name': 'Indonesia' },
      { '@type': 'Country', 'name': 'Philippines' },
      { '@type': 'Country', 'name': 'Spain' },
      { '@type': 'Country', 'name': 'Global' }
    ],
    'potentialAction': {
      '@type': 'TradeAction',
      'name': 'Cash out Worldcoin',
      'target': `${baseUrl}/${locale}`
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}