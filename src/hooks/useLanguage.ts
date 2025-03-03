"use client";

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n'; // 使用我們自己的 i18n 導出
import { locales, Locale } from '@/lib/i18n-config';

export function useLanguage() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  
  // 切換語言的函數
  const changeLanguage = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
  };

  return {
    locale,
    changeLanguage,
    t: useTranslations(),
    mounted: true
  };
} 