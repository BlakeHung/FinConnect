import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/lib/i18n';

// 中間件配置
export default createMiddleware({
  // 支持的語言列表
  locales,
  
  // 默認語言
  defaultLocale,
  
  // 語言前綴策略 (always: 所有語言都會有前綴)
  localePrefix: 'always',

  // 添加錯誤處理
  localeDetection: true,
  
  // 添加備用語言
  alternateLinks: true
});

export const config = {
  // 匹配所有路徑，除了 api 路由、靜態文件等
  matcher: [
    // 匹配所有路徑除了 api、_next、_vercel、靜態文件等
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // 匹配根路徑
    '/'
  ]
}; 