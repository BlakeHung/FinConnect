import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (req.nextUrl.pathname === "/login" || req.nextUrl.pathname.startsWith('/edm/activities')) {
          return true
        }
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon files
     * - og images
     * - apple touch icon
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|favicon-16.svg|favicon-32.svg|og-image-1200x630.svg|og-image-800x800.svg|og-image-600x600.svg|apple-touch.svg).*)',
    "/edm/activities/:path*",
  ],
} 