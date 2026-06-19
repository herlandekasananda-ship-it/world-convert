// i18n/routing.ts
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // 1. 🚀 PERBAIKAN: Daftarkan semua bahasa yang didukung di db.json (id, en, es, tl)
  locales: ['id', 'en', 'es', 'tl'],
  
  // 2. Bahasa utama jika pengunjung tidak mengetik kode bahasa di URL
  defaultLocale: 'id',

  // 3. Peta URL dinamis berdasarkan bahasa lokal masing-masing negara
  pathnames: {
    '/': '/',
    '/tarik-worldcoin-ke-cash': {
      id: '/tarik-worldcoin-ke-cash',
      en: '/withdraw-worldcoin-to-cash',
      es: '/cambiar-worldcoin-a-efectivo',
      tl: '/i-cash-out-ang-worldcoin'
    }
  }
});

// Export fungsi navigasi agar mempermudah pembuatan komponen <Link> nanti
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);