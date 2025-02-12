import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

export const config = {
  matcher: [
    "/transactions/:path*",
    "/dashboard/:path*",
    "/((?!share|api|login|_next/static|_next/image|favicon.ico).*)",
  ]
} 