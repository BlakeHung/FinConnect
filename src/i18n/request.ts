import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from '@/lib/i18n-config';

export default getRequestConfig(async ({ locale }) => {
  // 驗證語言是否支持
  if (!locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  // 加載翻譯
  const messages = (await import(`../messages/${locale}.json`)).default;

  return {
    messages,
    locale,
    timeZone: 'Asia/Taipei',
    now: new Date(),
  };
}); 