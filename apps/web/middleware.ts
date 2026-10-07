import { type NextRequest, NextResponse } from "next/server";

/**
 * Route protection middleware.
 *
 * All authenticated role-workspace routes are protected.
 * The middleware reads the `bluechain_auth` cookie set by auth-context.tsx
 * on login/logout.  If absent, the user is redirected to /login with a
 * `from` query parameter so they can be sent back after authenticating.
 *
 * Public routes (/, /about, /docs, /map, /registry/*, /login, /register,
 * /_next/*, /favicon.ico) are always allowed through.
 */

const PROTECTED_PREFIXES = [
  "/ngo",
  "/admin",
  "/field",
  "/buyer",
  "/verifier",
  "/super",
  "/government",
  "/notifications",
  "/onboarding",
  "/settings",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run on protected prefixes
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get("bluechain_auth");

  if (!authCookie?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image  (image optimisation)
     * - favicon.ico
     * - public assets (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)).*)",
  ],
};
