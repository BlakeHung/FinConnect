import { en } from './en';
import { zh } from './zh';
import { notFound } from 'next/navigation';

// 定義支持的語言
export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];

// 默認語言
export const defaultLocale: Locale = 'zh';

// 添加這個函數
export function setRequestLocale(locale: Locale) {
  if (!locales.includes(locale)) notFound();
}

export const translations = {
  en,
  zh,
} as const;

// 獲取特定語言的翻譯
export async function getMessages(locale: Locale) {
  if (!locales.includes(locale)) {
    console.error(`Invalid locale: ${locale}`);
    return translations[defaultLocale];
  }

  try {
    const messages = translations[locale];
    if (!messages) {
      console.error(`No messages found for locale: ${locale}`);
      return translations[defaultLocale];
    }
    return messages;
  } catch (error) {
    console.error(`Error loading messages for locale: ${locale}`, error);
    return translations[defaultLocale];
  }
} 