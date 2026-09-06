import { NextResponse } from "next/server";
import { verifySessionToken, COOKIE } from "@/lib/auth";

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE)?.value;
  const session = await verifySessionToken(token);

  const authPages = ["/login", "/register", "/coaching/login", "/coaching/register"];
  const isAuthPage = authPages.includes(pathname);

  // 1. If user is already authenticated and visits login/register pages, redirect to role dashboard
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

  // 3. API Route Protection
  if (pathname.startsWith("/api/admin")) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Students can NEVER access any admin APIs
    if (session.role === "STUDENT") {
      return NextResponse.json(
        { error: "Forbidden: Super Admin access required" },
        { status: 403 },
      );
    }
    // Allow coaching admin and teachers to access question paper editor endpoint
    const isExamQuestionsEndpoint = pathname.includes("/questions");
    if (
      (session.role === "COACHING_ADMIN" || session.role === "TEACHER") &&
      !isExamQuestionsEndpoint
    ) {
      return NextResponse.json(
        { error: "Forbidden: Super Admin access required" },
        { status: 403 },
      );
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/coaching")) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Students can NEVER access coaching administration APIs
    if (session.role === "STUDENT") {
      return NextResponse.json({ error: "Forbidden: Coaching access required" }, { status: 403 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/exam-builder")) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role === "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.next();
  }

  // 4. Page Route Protection
  const isProtectedPage =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/coaching") ||
    pathname.startsWith("/student") ||
    pathname.startsWith("/exam-builder") ||
    pathname.startsWith("/questions");

  if (!isProtectedPage) {
    return NextResponse.next();
  }

  // If unauthenticated, redirect to appropriate login portal with callback
  if (!session) {
    const loginTarget = pathname.startsWith("/coaching") ? "/coaching/login" : "/login";
    const url = new URL(loginTarget, request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 5. Strict Role Enforcement: Block Students from Admin & Coaching Pages
  // A) Admin pages (/admin, /admin/finance, /admin/global-exams, /admin/users, etc.)
  if (pathname.startsWith("/admin")) {
    const isAllowedCoachingEditor = pathname.includes("/questions");
    if (session.role === "STUDENT") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
    if (
      (session.role === "COACHING_ADMIN" || session.role === "TEACHER") &&
      !isAllowedCoachingEditor
    ) {
      return NextResponse.redirect(new URL("/coaching/dashboard", request.url));
    }
  }

  // B) Coaching pages (/coaching, /coaching/dashboard, /coaching/batches, /coaching/exams, etc.)
  if (pathname.startsWith("/coaching")) {
    if (session.role === "STUDENT") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
  }

  // C) Root Exam Builder (/exam-builder)
  if (pathname.startsWith("/exam-builder")) {
    if (session.role === "STUDENT") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
  }

  // D) Root Question Bank Management (/questions, /questions/bank, /questions/import)
  if (pathname.startsWith("/questions")) {
    if (session.role === "STUDENT") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
  }

  // E) Student Portal (/student/*)
  if (pathname.startsWith("/student")) {
    if (session.role !== "STUDENT" && session.role !== "SUPER_ADMIN" && session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/coaching/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/student",
    "/student/:path*",
    "/coaching",
    "/coaching/:path*",
    "/admin",
    "/admin/:path*",
    "/exam-builder",
    "/exam-builder/:path*",
    "/questions",
    "/questions/:path*",
    "/api/admin/:path*",
    "/api/coaching/:path*",
    "/api/exam-builder/:path*",
  ],
};
