 
// app/[locale]/layout.tsx
import { ReactNode } from 'react';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import Image from 'next/image';
import { NextIntlClientProvider } from 'next-intl'; 
import { getMessages } from 'next-intl/server';
import { Inter } from 'next/font/google'; // 🚀 PENGOPTIMALAN FONT UNTUK SEO
import { Metadata } from 'next';
import { Link } from '@/i18n/routing'; // 🚀 IMPORT LINK INTERNASIONAL UNTUK NAVIGASI CS

// Memuat font Inter secara efisien tanpa layout shift
const inter = Inter({ subsets: ['latin'], display: 'swap' });

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>; 
}

// 🌐 GENERATE METADATA DINAMIS UNTUK SEO INTERNASIONAL (UPGRADED)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = 'https://world-convert.vercel.app'; // ⚠️ Sesuaikan dengan domain asli Anda
  
  // 1. Konfigurasi Judul Halaman (Meta Title)
  const titles: Record<string, string> = {
    id: "world-convert - Pencairan Worldcoin Instan & Aman",
    es: "world-convert - Retiro de Worldcoin Instantáneo y Seguro",
    tl: "world-convert - Instant at Ligtas na Pag-withdraw ng Worldcoin",
    en: "world-convert - Instant & Secure Worldcoin Withdrawal"
  };

  // 2. Konfigurasi Deskripsi Halaman (Meta Description)
  const descriptions: Record<string, string> = {
    id: "Platform agen pencairan koin WLD (Worldcoin) langsung ke rekening bank lokal dan e-wallet secara instan.",
    es: "Plataforma de agentes para retirar monedas WLD directamente a su cuenta bancaria local o billetera digital.",
    tl: "Ang platform para sa pag-withdraw ng WLD coins diretso sa iyong lokal na bank account o e-wallet.",
    en: "The premier agent platform to cash out WLD coins directly to your local bank account or digital wallet instantly."
  };

  // 3. Konfigurasi Kata Kunci Target (Meta Keywords Upgrade)
  const keywords: Record<string, string> = {
    id: "pencairan worldcoin, agen wld, cara mencairkan worldcoin, jual worldcoin instan, rupiah, e-wallet, wld ke dana",
    es: "retirar worldcoin, cambiar wld, retiro instantaneo worldcoin, agente worldcoin, cuenta bancaria, billetera digital",
    tl: "withdraw worldcoin, paano magbenta ng wld, worldcoin philippines, cash out wld to gcash, ligtas na withdraw",
    en: "cash out worldcoin, withdraw wld, worldcoin agent, sell worldcoin instantly, crypto to local bank, secure wld swap"
  };

  const currentTitle = titles[locale] || titles['en'];
  const currentDesc = descriptions[locale] || descriptions['en'];
  const currentKeywords = keywords[locale] || keywords['en'];

  return {
    title: currentTitle,
    description: currentDesc,
    keywords: currentKeywords,
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'id-ID': `${baseUrl}/id`,
        'en-US': `${baseUrl}/en`,
        'es-ES': `${baseUrl}/es`,
        'fil-PH': `${baseUrl}/tl`,
      },
    },
    robots: { 
      index: true, 
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: currentTitle,
      description: currentDesc,
      url: `${baseUrl}/${locale}`,
      siteName: 'World-convert',
      locale: locale === 'tl' ? 'fil_PH' : locale === 'id' ? 'id_ID' : locale === 'es' ? 'es_ES' : 'en_US',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: currentTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: currentTitle,
      description: currentDesc,
      images: [`${baseUrl}/og-image.png`],
    },
  };
}

// ==========================================
// 🎨 CENTRALIZED THEME STYLES (Clean UI)
// ==========================================
const styles = {
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #f1f5f9',
    padding: '0.85rem 1.5rem',
    position: 'sticky' as const,
    top: 0,
    zIndex: 50,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02), 0 1px 2px -1px rgba(0, 0, 0, 0.02)'
  },
  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    cursor: 'pointer'
  },
  logoImageContainer: {
    position: 'relative' as const,
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  },
  logoText: {
    fontWeight: '800',
    fontSize: '1.25rem',
    color: '#0f172a',
    letterSpacing: '-0.03em'
  },
  rightNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  csButton: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: '700',
    padding: '0.5rem 0.9rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.1)',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center'
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem'
  }
};

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  const messages = await getMessages();

  // Label multibahasa untuk tombol Customer Service
  const csLabels: Record<string, string> = {
    id: "Hubungi CS",
    en: "Contact CS",
    es: "Soporte CS",
    tl: "I-contact ang CS"
  };

  return (
    <html lang={locale} className={inter.className}>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
        <NextIntlClientProvider messages={messages}>
          
          {/* Header Komponen Semantik */}
          <header style={styles.header}>
            <div style={styles.navContainer}>
              
              {/* Logo & Brand Identity */}
              <div style={styles.logoWrapper}>
                <div style={styles.logoImageContainer}>
                  <Image 
                    src="/logo.png" 
                    alt="world-convert Logo" 
                    fill 
                    style={{ objectFit: 'cover' }} 
                    sizes="38px" 
                    priority 
                  />
                </div>
                <span style={styles.logoText}>
                  World-convert
                </span>
              </div>
              
              {/* Kontainer Navigasi Kanan (CS + Language Selector) */}
              <div style={styles.rightNav}>
                
                {/* 🚀 TOMBOL CUSTOMER SERVICE MENYESUAIKAN BAHASA */}
                <Link href="/cs" style={styles.csButton}>
                  {csLabels[locale] || csLabels['en']}
                </Link>

                {/* Menu Navigasi Bahasa */}
                <nav aria-label="Language Selector">
                  <LanguageSwitcher />
                </nav>

              </div>

            </div>
          </header>

          {/* Area Konten Utama Halaman */}
          <main style={styles.mainContent}>
            {children}
          </main>

        </NextIntlClientProvider>
      </body>
    </html>
  );
}