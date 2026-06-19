// middleware.ts
import createMiddleware from 'next-intl/middleware';

// 🚀 Gunakan rute relatif murni untuk memastikan compiler tidak tersesat
import { routing } from './i18n/routing'; 

export default createMiddleware(routing);

export const config = {
  matcher: [
    '/',
    '/(id|en|es|tl)/:path*',
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};