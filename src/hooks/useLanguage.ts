"use client";

import { useEffect, useState } from 'react';
import { Locale, translations } from '@/lib/i18n';
import { getClientLocale, setLocale } from '@/lib/i18n/utils';

export function useLanguage() {
  const [mounted, setMounted] = useState(false);
  const [locale, setCurrentLocale] = useState<Locale>('zh');

  useEffect(() => {
    setCurrentLocale(getClientLocale());
    setMounted(true);
  }, []);

  const changeLanguage = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  // 提供預設的中文翻譯和當前語言的翻譯
  return {
    locale,
    changeLanguage,
    t: mounted ? translations[locale] : translations['zh'],
    mounted, // 導出 mounted 狀態，讓組件可以知道是否已經掛載
  };
} 