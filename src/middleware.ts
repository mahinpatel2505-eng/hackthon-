import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const pathname = req.nextUrl.pathname;
    const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/reset-password";

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.next();
    }

    if (!isAuth) {
      let from = pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }
  },
  {
    callbacks: {
      // Return true to always run the middleware function above
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/operations/:path*",
    "/products/:path*",
    "/api/operations/:path*",
    "/api/products/:path*",
    "/login",
    "/signup",
    "/reset-password"
  ],
};
