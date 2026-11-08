import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth/token";

const AUTH_PAGES = ["/login", "/register"];
const PUBLIC_PAGES = ["/offline"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAuthPage = AUTH_PAGES.includes(pathname);
  const hasToken = Boolean(request.cookies.get(AUTH_COOKIE)?.value);

  if (PUBLIC_PAGES.includes(pathname)) return NextResponse.next();

  if (!hasToken && !isAuthPage) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (hasToken && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|icons/|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|txt|xml|webmanifest)$).*)",
  ],
};
