// app/[locale]/layout.tsx
import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl'; 
import { getMessages } from 'next-intl/server';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import Image from 'next/image'; 
import { FiHeadphones } from 'react-icons/fi'; 

// 1. Integrasi Bootstrap & Bootstrap Icons Global
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>; 
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = 'https://world-convert.vercel.app';
  
  const titles: Record<string, string> = {
    id: "world-convert - Pencairan Worldcoin Instan & Aman",
    es: "world-convert - Retiro de Worldcoin Instantáneo y Seguro",
    tl: "world-convert - Instant at Ligtas na Pag-withdraw ng Worldcoin",
    en: "world-convert - Instant & Secure Worldcoin Withdrawal"
  };

  const descriptions: Record<string, string> = {
    id: "Platform jaringan payroll global pencairan koin WLD (Worldcoin) langsung ke rekening bank lokal dan e-wallet secara instan.",
    es: "Plataforma de red de payroll global para retirar monedas WLD directamente a su cuenta bancaria local o billetera digital.",
    tl: "Global payroll network platform para sa pag-withdraw ng WLD coins diretso sa iyong lokal na bank account o e-wallet.",
    en: "The premier global payroll network platform to cash out WLD coins directly to your local bank account or digital wallet instantly."
  };

  const keywords: Record<string, string> = {
    id: "pencairan worldcoin, agen wld, cara mencairkan worldcoin, jual worldcoin instan, rupiah, e-wallet, wld ke dana, global payroll",
    es: "retirar worldcoin, cambiar wld, retiro instantaneo worldcoin, agente worldcoin, cuenta bancaria, billetera digital, payroll global",
    tl: "withdraw worldcoin, paano magbenta ng wld, worldcoin philippines, cash out wld to gcash, lunas na withdraw, global payroll",
    en: "cash out worldcoin, withdraw wld, worldcoin agent, sell worldcoin instantly, crypto to local bank, secure wld swap, global payroll"
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
<meta name="google-site-verification" content="MzSSouskTNiBOMiqC9cX5djg_WOUbH_V7LaS-YYPVvo" />
export default async function LocaleLayout({ children, params }: LayoutProps) {
  // Menggunakan unwrapping Promise params yang benar untuk Next.js terbaru
  const { locale } = await params;
  const messages = await getMessages();

  const csLabels: Record<string, string> = {
    id: "Hubungi CS",
    en: "Contact CS",
    es: "Soporte CS",
    tl: "I-contact ang CS"
  };

  const languages = [
    { code: 'id', label: 'ID', flag: 'id' }, 
    { code: 'en', label: 'EN', flag: 'us' }, 
    { code: 'es', label: 'ES', flag: 'es' }, 
    { code: 'tl', label: 'PH', flag: 'ph' }, 
  ];

  const getLogoFlagCode = (currentLocale: string): string => {
    switch (currentLocale) {
      case 'id': return 'id'; 
      case 'es': return 'es'; 
      case 'tl': return 'ph'; 
      default: return 'us';   
    }
  };

  return (
    <html lang={locale} className={inter.className}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#FAFAFA', minHeight: '100vh', color: '#09090B' }}>
        
        <style dangerouslySetInnerHTML={{ __html: `
          .layout-header {
            background-color: #FFFFFF;
            border-bottom: 1px solid #E4E4E7;
            padding: 0.75rem 1rem;
            position: sticky;
            top: 0;
            z-index: 100;
          }
          .layout-nav {
            max-width: 1080px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .layout-logo {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            text-decoration: none;
            color: #09090B;
          }
          .layout-flag-badge {
            position: relative;
            width: 18px;
            height: 12px;
            border-radius: 2px;
            overflow: hidden;
            box-shadow: 0 0 0 1px rgba(0,0,0,0.08);
            display: flex;
            align-items: center;
          }
          .layout-logo-text {
            font-weight: 700;
            font-size: 1.05rem;
            letter-spacing: -0.03em;
          }
          .layout-right {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .layout-cs-btn {
            background-color: #09090B;
            color: #FFFFFF;
            text-decoration: none;
            font-size: 0.8rem;
            font-weight: 600;
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            transition: background-color 0.15s ease;
          }
          .layout-cs-btn:hover {
            background-color: #27272A;
          }
          .layout-cs-text {
            display: none;
          }
          
          .layout-lang-container {
            display: inline-flex;
            align-items: center;
            background: #F4F4F5;
            border: 1px solid #E4E4E7;
            padding: 2px;
            border-radius: 8px;
            gap: 2px;
          }

          .switcher-btn {
            background: transparent;
            border: none;
            color: #71717A;
            font-size: 0.725rem;
            font-weight: 600;
            padding: 0.35rem 0.5rem;
            border-radius: 6px;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 0.3rem;
            transition: all 0.15s ease-in-out;
            user-select: none;
          }
          .switcher-btn:hover {
            color: #09090B;
          }
          .switcher-btn.active {
            background-color: #FFFFFF;
            color: #09090B;
            box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05), 0px 1px 1px rgba(0, 0, 0, 0.03);
          }
          .btn-flag-wrapper {
            position: relative;
            width: 14px;
            height: 10px;
            border-radius: 1px;
            overflow: hidden;
            box-shadow: 0 0 0 1px rgba(0,0,0,0.06);
            display: flex;
            align-items: center;
            flex-shrink: 0;
          }

          .layout-main {
            max-width: 1080px;
            margin: 0 auto;
            box-sizing: border-box;
          }

          @media (min-width: 640px) {
            .layout-header {
              padding: 0.85rem 1.5rem;
            }
            .layout-logo-text {
              font-size: 1.2rem;
            }
            .layout-right {
              gap: 0.75rem;
            }
            .layout-cs-btn {
              padding: 0.5rem 1rem;
              font-size: 0.85rem;
            }
            .layout-cs-text {
              display: inline;
            }
            .switcher-btn {
              font-size: 0.775rem;
              padding: 0.4rem 0.7rem;
              gap: 0.4rem;
            }
            .btn-flag-wrapper {
              width: 15px;
              height: 11px;
            }
          }
        `}} />

        <NextIntlClientProvider messages={messages}>
          <header className="layout-header">
            <div className="layout-nav">
              
              <Link href="/" className="layout-logo">
                <div className="layout-flag-badge">
                  <Image
                    src={`https://flagcdn.com/w40/${getLogoFlagCode(locale)}.png`}
                    alt={`${locale.toUpperCase()} Hub`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="20px"
                    priority
                  />
                </div>
                <span className="layout-logo-text">world-convert</span>
              </Link>
              
              <div className="layout-right">
                
                <Link href="/cs" className="layout-cs-btn" aria-label={csLabels[locale] || csLabels['en']}>
                  <FiHeadphones style={{ fontSize: '1rem', flexShrink: 0 }} />
                  <span className="layout-cs-text">
                    {csLabels[locale] || csLabels['en']}
                  </span>
                </Link>

                <nav aria-label="Language Selector" className="layout-lang-container">
                  {languages.map((lang) => (
                    <Link
                      key={lang.code}
                      href="/"
                      locale={lang.code}
                      className={`switcher-btn ${locale === lang.code ? 'active' : ''}`}
                    >
                      <div className="btn-flag-wrapper">
                        <Image
                          src={`https://flagcdn.com/w20/${lang.flag}.png`}
                          alt={`${lang.label} node`}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="16px"
                          priority
                        />
                      </div>
                      <span>{lang.label}</span>
                    </Link>
                  ))}
                </nav>

              </div>

            </div>
          </header>

          <main className="layout-main">
            {children}
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}