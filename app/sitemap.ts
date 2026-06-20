// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ⚠️ GANTI dengan domain asli platform Anda saat naik production
  const baseUrl = 'https://world-convert.com'; 
  
  // 4 Negara target utama Anda
  const locales = ['id', 'es', 'tl', 'en'];

  // Jika Anda memiliki rute statis lain (misal: /about, /terms), tambahkan di sini
  const routes = ['', '/about', '/terms']; 

  const sitemapEntries = routes.flatMap((route) => {
    return locales.map((locale) => {
      // Menyusun URL utama untuk rute dan bahasa saat ini
      const currentUrl = `${baseUrl}/${locale}${route}`;

      // Menyusun alternatif bahasa (X-Default & Hreflang) untuk bot Google
      const languagesAlternate = locales.reduce((acc, loc) => {
        acc[loc] = `${baseUrl}/${loc}${route}`;
        return acc;
      }, {} as Record<string, string>);

      return {
        url: currentUrl,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily' as const, // Google disarankan cek setiap hari karena rate koin berubah
        priority: route === '' ? 1.0 : 0.8, // Halaman utama (home) diberi prioritas tertinggi (1.0)
        alternates: {
          languages: languagesAlternate,
        },
      };
    });
  });

  return sitemapEntries;
}