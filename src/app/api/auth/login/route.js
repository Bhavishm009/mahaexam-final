import { NextResponse } from "next/server";
import { loginUser } from "@/lib/auth-repository";
import {
  createSessionToken,
  createMfaTicket,
  sessionCookieOptions,
  COOKIE,
} from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const identifier = body.identifier || body.email || body.phone;
    const user = await loginUser({
      identifier,
      email: body.email || identifier,
      phone: body.phone || identifier,
      password: body.password,
    });

    // If user has MFA enabled, require 6-digit authenticator code before issuing session cookie
    if (user.mfaEnabled) {
      const mfaTicket = await createMfaTicket(user);
      return NextResponse.json({
        success: true,
        mfaRequired: true,
        mfaTicket,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    }

    const token = await createSessionToken(user);
    prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(() => {});

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        organizationId: user.organizationId,
      },
    });
    response.cookies.set(COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("Login error:", error);
    const messages = {
      INVALID_CREDENTIALS: "Invalid email or password.",
      USER_SUSPENDED: "Your account is currently suspended.",
    };
    return NextResponse.json(
      { error: messages[error.message] || "Unable to sign in." },
      { status: 401 },
    );
  }
}
