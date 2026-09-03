import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware() {},
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
)

export const config = {
  matcher: ["/"],
}