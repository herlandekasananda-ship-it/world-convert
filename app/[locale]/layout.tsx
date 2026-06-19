import { ReactNode } from 'react';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import Image from 'next/image';
import { NextIntlClientProvider } from 'next-intl'; 

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>; // Sesuai dengan ekspektasi generator Next.js
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  return (
    <html lang={locale}>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <NextIntlClientProvider locale={locale}>
          <header style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '1rem 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 50
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden' }}>
                  <Image src="/logo.jpg" alt="WorldCair Logo" fill style={{ objectFit: 'cover' }} priority />
                </div>
                <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: '#1e293b', letterSpacing: '-0.025em' }}>
                  WorldCair
                </span>
              </div>
              <nav style={{ display: 'flex', alignItems: 'center' }}>
                <LanguageSwitcher />
              </nav>
            </div>
          </header>
          <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {children}
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}