import { NextResponse, type NextRequest } from "next/server";

const LOGIN_PATHS = [
  /^\/account(\/|$)/,
  /^\/checkout(\/|$)/,
  /^\/orders(\/|$)/,
];
const ADMIN_PATH = /^\/admin(\/|$)/;

/** Reads the JWT payload without verifying (the API verifies; this is only routing). */
function roleFromToken(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(part)).role ?? null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const access = req.cookies.get("access_token")?.value;
  const loggedIn = Boolean(access || req.cookies.get("refresh_token")?.value);

  const needsAdmin = ADMIN_PATH.test(pathname);
  const needsLogin = needsAdmin || LOGIN_PATHS.some((r) => r.test(pathname));
  if (!needsLogin) return NextResponse.next();

  if (!loggedIn || (needsAdmin && access && roleFromToken(access) !== "admin")) {
    const url = req.nextUrl.clone();
    url.pathname = loggedIn ? "/" : "/login";
    url.search = loggedIn ? "" : `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account",
    "/account/:path*",
    "/checkout",
    "/checkout/:path*",
    "/orders",
    "/orders/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
