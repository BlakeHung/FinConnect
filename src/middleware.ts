import createMiddleware from 'next-intl/middleware';
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { locales, defaultLocale } from './lib/i18n-config';

// 創建 next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

// 結合 next-auth 和 next-intl 的 middleware
export default function middleware(req) {
  const publicPatterns = ['/login', '/edm/activities'];
  const isPublicPage = publicPatterns.some(pattern => 
    req.nextUrl.pathname.startsWith(pattern) || 
    req.nextUrl.pathname.match(/^\/(zh|en)\/login/) ||
    req.nextUrl.pathname.match(/^\/(zh|en)\/edm\/activities/)
  );

  // 對於公共頁面，只應用 intlMiddleware
  if (isPublicPage) {
    return intlMiddleware(req);
  }

  // 對於需要認證的頁面，先檢查認證
  const authCheck = withAuth(
    () => {
      return NextResponse.next();
    },
    {
      callbacks: {
        authorized: ({ token }) => !!token,
      },
    }
  );

  // 先應用 auth middleware
  const authResponse = authCheck(req);
  
  // 如果未授權，重定向到登入頁面
  if (authResponse.status === 401) {
    const locale = req.cookies.get('NEXT_LOCALE')?.value || defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  // 如果授權，應用 intlMiddleware
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    // 匹配所有路徑，除了靜態資源和API路由
    '/((?!api/auth|_next/static|_next/image|favicon.ico|favicon-16.svg|favicon-32.svg|og-image-1200x630.svg|og-image-800x800.svg|og-image-600x600.svg|apple-touch.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif).*)',
  ],
} 