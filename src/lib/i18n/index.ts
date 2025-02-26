import { en } from './en';
import { zh } from './zh';

export const availableLocales = ['en', 'zh'] as const;
export type Locale = typeof availableLocales[number];

export const translations = {
  en,
  zh,
} as const;

// 用來確保兩個語言檔的 key 完全相同
type EnKeys = keyof typeof en;
type ZhKeys = keyof typeof zh;
type CheckKeys = EnKeys extends ZhKeys ? ZhKeys extends EnKeys ? true : false : false;
const keysAreEqual: CheckKeys = true; 