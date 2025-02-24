import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (req.nextUrl.pathname === "/login") {
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
     * - favicon.ico, favicon-16.svg, favicon-32.svg (favicon files)
     * - public-og-image.png (OG image)
     * - apple-touch.svg (apple touch icon)ㄋ
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|favicon-16.svg|favicon-32.svg|og-image.svg|apple-touch.svg).*)',
  ],
} 