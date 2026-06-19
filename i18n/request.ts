// i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validasi agar memastikan bahasa yang diminta ada di daftar routing
  if (!locale || !routing.locales.includes(locale as never)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    // Kita biarkan messages kosong {} karena teksnya kita ambil langsung dari Lowdb!
    messages: {}
  };
});