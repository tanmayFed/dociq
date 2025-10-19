import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip Next internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get("session_id")?.value;

  const unauthRoutes = ["/login", "/register"];
  const protectedRoutes = ["/dashboard"];

  if (!sessionCookie && protectedRoutes.some((r) => pathname.startsWith(r))) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If session exists and the user is trying to visit an unauth page, redirect to dashboard.
  // Note: don't treat "/" as a startsWith matcher because every path starts with '/'.
  const isRoot = pathname === "/";
  const isUnauth =
    isRoot ||
    unauthRoutes.some((r) => pathname === r || pathname.startsWith(r));
  const isAlreadyDashboard =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  if (sessionCookie && isUnauth && !isAlreadyDashboard) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Apply middleware to all pages except Next internals and API routes
export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|api).*)",
};
