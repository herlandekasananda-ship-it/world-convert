// components/LanguageSwitcher.tsx
'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '../i18n/routing';
import { ChangeEvent } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const onSelectChange = (nextLocale: string) => {
    // Mengalihkan halaman ke bahasa yang dipilih tanpa kehilangan rute aktif
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <label htmlFor="locale-select" style={{ fontSize: '0.875rem', color: '#475569', fontWeight: '500' }}>
        🌐 Language:
      </label>
      <select
        id="locale-select"
        defaultValue={locale}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onSelectChange(e.target.value)}
        style={{
          padding: '0.4rem 0.8rem',
          borderRadius: '0.375rem',
          border: '1px solid #cbd5e1',
          backgroundColor: '#ffffff',
          color: '#1e293b',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '0.875rem',
          outline: 'none'
        }}
      >
        <option value="en">🇺🇸 English</option>
        <option value="es">🇪🇸 Español</option>
        <option value="tl">🇵🇭 Filipino</option>
      </select>
    </div>
  );
}