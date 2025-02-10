import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/expenses/:path*",
    "/activities/:path*",
  ]
} 