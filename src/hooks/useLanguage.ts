"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Locale, availableLocales, translations } from '@/lib/i18n';
import { getDefaultLocale } from '@/lib/i18n/utils';

export function useLanguage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState<Locale>(getDefaultLocale());

  useEffect(() => {
    const urlLocale = searchParams.get('lang') as Locale;
    if (availableLocales.includes(urlLocale) && urlLocale !== locale) {
      setLocale(urlLocale);
      localStorage.setItem('lang', urlLocale);
    }
  }, [searchParams]);

  const changeLanguage = (newLocale: Locale) => {
    // 更新 URL
    const params = new URLSearchParams(window.location.search);
    params.set('lang', newLocale);
    router.push(`${window.location.pathname}?${params.toString()}`);
    
    // 更新 localStorage
    localStorage.setItem('lang', newLocale);
    setLocale(newLocale);
  };

  return {
    locale,
    changeLanguage,
    t: translations[locale],
  };
} 