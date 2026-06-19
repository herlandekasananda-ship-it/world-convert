// app/[locale]/layout.tsx
import { ReactNode } from 'react';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import Image from 'next/image';
import { NextIntlClientProvider } from 'next-intl'; 
import { getMessages } from 'next-intl/server'; // 🚀 TAMBAHKAN INI

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>; 
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  // 🚀 PERBAIKAN: Ambil data pesan lokalisasi (messages) secara asinkronus untuk Client Provider
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        {/* 🚀 PERBAIKAN: Berikan properti 'messages' agar LanguageSwitcher atau komponen client lainnya tidak crash */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          
          <header style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '1rem 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 50
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              
              {/* Logo & Nama Aplikasi */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden' }}>
                  <Image 
                    src="/logo.jpg" 
                    alt="WorldCair Logo" 
                    fill 
                    style={{ objectFit: 'cover' }} 
                    priority 
                  />
                </div>
                <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: '#1e293b', letterSpacing: '-0.025em' }}>
                  WorldCair
                </span>
              </div>
              
              {/* Dropdown Pemilih Bahasa */}
              <nav style={{ display: 'flex', alignItems: 'center' }}>
                <LanguageSwitcher />
              </nav>

            </div>
          </header>

          {/* Area Konten Utama Halaman */}
          <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {children}
          </main>

        </NextIntlClientProvider>
      </body>
    </html>
  );
}