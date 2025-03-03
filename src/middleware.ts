import createMiddleware from 'next-intl/middleware';

// 中間件配置
export default createMiddleware({
  // 支持的語言列表
  locales: ['en', 'zh'],
  
  // 默認語言
  defaultLocale: 'zh',
  
  // 語言前綴策略 (as-needed: 只有非默認語言才會有前綴)
  localePrefix: 'as-needed'
});

export const config = {
  // 匹配所有路徑，除了 api 路由、靜態文件等
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}; 