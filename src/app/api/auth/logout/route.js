import { NextResponse } from "next/server";
import { COOKIE, sessionCookieOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  const cookiesToClear = [
    COOKIE,
    "mahaexam_session",
    "maha_exam_session",
    "token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "next-auth.csrf-token",
    "__Host-next-auth.csrf-token",
    "authjs.csrf-token",
    "__Host-authjs.csrf-token",
    "next-auth.callback-url",
    "__Secure-next-auth.callback-url",
    "authjs.callback-url",
    "__Secure-authjs.callback-url",
  ];

  const cookieOptions = sessionCookieOptions();

  for (const name of cookiesToClear) {
    try {
      response.cookies.delete(name);
    } catch {}
    try {
      response.cookies.set(name, "", {
        ...cookieOptions,
        maxAge: 0,
        expires: new Date(0),
      });
    } catch {}
  }

  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  );

  return response;
}
