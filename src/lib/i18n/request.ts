import { getRequestConfig } from 'next-intl/server';
import { getMessages, locales, defaultLocale, type Locale } from '@/lib/i18n';

export default getRequestConfig(async ({
  requestLocale
}) => {
  // 獲取 locale
  let locale = await requestLocale;

  // 確保傳入的 locale 是有效的
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: await getMessages(locale as Locale),
    timeZone: 'Asia/Taipei',
    now: new Date()
  };
});