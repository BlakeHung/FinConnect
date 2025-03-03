import { useTranslations, useLocale } from 'next-intl';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from './index';

// 創建導航工具
export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation({ 
  locales, 
  defaultLocale 
});

// 獲取當前語言
export function useClientLocale() {
  return useLocale();
}

// 獲取翻譯函數
export function useClientTranslation(namespace = 'common') {
  return useTranslations(namespace);
}

// 切換語言
export function useSetLocale() {
  const router = useRouter();
  const pathname = usePathname();
  
  return (locale: string) => {
    router.replace(pathname, { locale });
  };
} 