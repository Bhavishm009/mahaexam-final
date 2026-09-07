import { NextResponse } from "next/server";
import { verifySessionToken, COOKIE } from "@/lib/auth";

/**
 * Next.js Request Proxy (Official convention in Next.js, replacing deprecated middleware)
 * Runs server-side before routes are rendered to protect authenticated dashboards.
 */
export async function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(COOKIE)?.value;
  const session = await verifySessionToken(token);

  const authPages = ["/login", "/register", "/coaching/login", "/coaching/register"];
  const isAuthPage = authPages.includes(pathname);

  // 1. If user is already authenticated and visits login/register, redirect to their role dashboard
  if (session && isAuthPage) {
    const target =
      session.role === "SUPER_ADMIN" || session.role === "ADMIN"
        ? "/admin"
        : session.role === "COACHING_ADMIN" || session.role === "TEACHER"
          ? "/coaching/dashboard"
          : "/student/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 2. Public auth endpoints that must never be blocked
  if (pathname === "/coaching/login" || pathname === "/coaching/register") {
    return NextResponse.next();
  }

  // 3. Protected Dashboard Pages
  const isProtectedPage =
    pathname.startsWith("/student") ||
    pathname.startsWith("/coaching") ||
    pathname.startsWith("/admin");

  if (isProtectedPage) {
    // If unauthenticated or session expired, redirect to login with return path & expired flag
    if (!session) {
      const nextDestination = pathname + (search || "");
      const loginTarget = pathname.startsWith("/coaching") ? "/coaching/login" : "/login";
      const loginUrl = new URL(
        `${loginTarget}?next=${encodeURIComponent(nextDestination)}&expired=1`,
        request.url,
      );
      return NextResponse.redirect(loginUrl);
    }

    // Role Enforcement: Block students from Super Admin & Coaching areas
    if (pathname.startsWith("/admin") && session.role === "STUDENT") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
    if (pathname.startsWith("/coaching") && session.role === "STUDENT") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/student/:path*", "/admin/:path*", "/coaching/:path*"],
};
