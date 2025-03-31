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
  try {
    const messages = (await import(`./${locale}`)).default;
    return messages;
  } catch (error) {
    console.error(`Error loading messages for locale: ${locale}`, error);
    return {};
  }
} 