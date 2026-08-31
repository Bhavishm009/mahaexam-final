import { NextResponse } from "next/server";
import { verifySessionToken, COOKIE } from "@/lib/auth";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const protectedPath =
    pathname.startsWith("/student") ||
    pathname.startsWith("/coaching") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/exam");
  if (!protectedPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/student") && session.role !== "STUDENT") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    pathname.startsWith("/coaching") &&
    !["COACHING_ADMIN", "TEACHER", "SUPER_ADMIN"].includes(session.role)
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/admin") && session.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/coaching/:path*", "/admin/:path*", "/exam/:path*"],
};
