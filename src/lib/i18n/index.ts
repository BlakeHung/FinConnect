import { en } from './en';
import { zh } from './zh';

// 定義支持的語言
export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];

// 默認語言
export const defaultLocale: Locale = 'zh';

export const translations = {
  en,
  zh,
} as const;

// 用來確保兩個語言檔的 key 完全相同
type EnKeys = keyof typeof en;
type ZhKeys = keyof typeof zh;
type CheckKeys = EnKeys extends ZhKeys ? ZhKeys extends EnKeys ? true : false : false;
const keysAreEqual: CheckKeys = false;

// 獲取特定語言的翻譯
export async function getMessages(locale: Locale) {
  try {
    return (await import(`./${locale}`)).default;
  } catch (error) {
    console.error(`Error loading messages for locale: ${locale}`, error);
    return {};
  }
} 