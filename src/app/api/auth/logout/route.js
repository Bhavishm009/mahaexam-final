import { NextResponse } from "next/server";
import { COOKIE, sessionCookieOptions } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  const cookieOptions = sessionCookieOptions();
  response.cookies.set(COOKIE, "", {
    ...cookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
