// middleware.ts
import createMiddleware from 'next-intl/middleware';
// Sesuaikan path import ini agar mengarah ke file routing.ts Anda dengan tepat
import { routing } from './i18n/routing'; 

export default createMiddleware(routing);

export const config = {
  // Amankan matcher agar hanya memproses halaman web, bukan file sistem/aset
  matcher: [
    // Jalankan middleware untuk root website
    '/',
    
    // Jalankan untuk semua halaman yang memiliki prefiks bahasa
    '/(id|en|es|tl)/:path*',
    
    // Skip atau lewati file internal Next.js, Vercel, dan file dengan ekstensi (gambar, favicon, dll)
    '/((?!_next|_vercel|api|static|.*\\..*).*)'
  ]
};