import { getRequestConfig } from 'next-intl/server';
import { getMessages, locales, defaultLocale } from '@/lib/i18n';

export default getRequestConfig(async ({ locale }) => {
  // 確保 locale 是支持的語言之一
  if (!locales.includes(locale as any)) {
    locale = defaultLocale; // 使用默認語言
  }
  
  return {
    locale, // 明確返回 locale
    messages: await getMessages(locale as any),
    timeZone: 'Asia/Taipei' // 可選：設置時區
  };
});