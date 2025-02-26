import { Locale, availableLocales, translations } from '@/lib/i18n';

export function getDefaultLocale(): Locale {
  // 如果在客戶端
  if (typeof window !== 'undefined') {
    // 先檢查 URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlLocale = urlParams.get('lang') as Locale;
    if (availableLocales.includes(urlLocale)) {
      return urlLocale;
    }

    // 再檢查 localStorage
    const savedLocale = localStorage.getItem('lang') as Locale;
    if (availableLocales.includes(savedLocale)) {
      return savedLocale;
    }

    // 最後檢查瀏覽器語言
    const browserLocale = navigator.language;
    return browserLocale.includes('zh') ? 'zh' : 'en';
  }

  // 如果在伺服器端，預設使用中文
  return 'zh';
}

export function getTranslation(locale: Locale) {
  return translations[locale];
} 