// app/[locale]/layout.tsx
import { ReactNode } from 'react';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import Image from 'next/image';
import { NextIntlClientProvider } from 'next-intl'; 
import { getMessages } from 'next-intl/server';
import { Inter } from 'next/font/google'; // 🚀 PENGOPTIMALAN FONT UNTUK SEO
import { Metadata } from 'next';

// Memuat font Inter secara efisien tanpa layout shift
const inter = Inter({ subsets: ['latin'], display: 'swap' });

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>; 
}

// 🌐 GENERATE METADATA DINAMIS UNTUK SEO INTERNASIONAL
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  
  // Konfigurasi meta tag per bahasa
  const titles: Record<string, string> = {
    id: "WorldCair - Pencairan Worldcoin Instan & Aman",
    es: "WorldCair - Retiro de Worldcoin Instantáneo y Seguro",
    tl: "WorldCair - Instant at Ligtas na Pag-withdraw ng Worldcoin",
    en: "WorldCair - Instant & Secure Worldcoin Withdrawal"
  };

  const descriptions: Record<string, string> = {
    id: "Platform agen pencairan koin WLD (Worldcoin) langsung ke rekening bank lokal dan e-wallet secara instan.",
    es: "Plataforma de agentes para retirar monedas WLD directamente a su cuenta bancaria local o billetera digital.",
    tl: "Ang platform para sa pag-withdraw ng WLD coins diretso sa iyong lokal na bank account o e-wallet.",
    en: "The premier agent platform to cash out WLD coins directly to your local bank account or digital wallet instantly."
  };

  const currentTitle = titles[locale] || titles['en'];
  const currentDesc = descriptions[locale] || descriptions['en'];

  return {
    title: currentTitle,
    description: currentDesc,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'id-ID': '/id',
        'en-US': '/en',
        'es-ES': '/es',
        'fil-PH': '/tl',
      },
    },
    robots: { index: true, follow: true },
  };
}

// ==========================================
// 🎨 CENTRALIZED THEME STYLES (Clean UI)
// ==========================================
const styles = {
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #f1f5f9',
    padding: '0.85rem 2rem',
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
    fontSize: '1.3rem',
    color: '#0f172a',
    letterSpacing: '-0.03em'
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

  return (
    <html lang={locale} className={inter.className}>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
        {/* Di Next-Intl versi terbaru, properti 'locale' di provider ini sudah tidak diperlukan */}
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
                    sizes="38px" // ✅ FIX: Ditambahkan agar Next.js tahu ukuran pasti gambar ini (38px) dan tidak komplain lagi
                    priority 
                  />
                </div>
                <span style={styles.logoText}>
                  World-convert
                </span>
              </div>
              
              {/* Menu Navigasi Bahasa */}
              <nav aria-label="Language Selector">
                <LanguageSwitcher />
              </nav>

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