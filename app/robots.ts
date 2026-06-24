import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://world-convert.vercel.app'; // Ganti dengan domain kustom Anda jika ada

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',          // Memblokir robot Google agar tidak menjelajahi route API internal Anda
        '/_next/',        // Memblokir folder sistem/build Next.js
        '/static/',       // Memblokir folder statis jika ada rahasia
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}