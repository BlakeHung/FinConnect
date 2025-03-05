import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/lib/i18n';

// 中間件配置
export default createMiddleware({
  // 支持的語言列表
  locales,
  
  // 默認語言
  defaultLocale,
  
  // 語言前綴策略 (always: 所有語言都會有前綴)
  localePrefix: 'always'
});

export const config = {
  // 匹配所有路徑，除了 api 路由、靜態文件等
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}; 