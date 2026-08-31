import { NextResponse } from "next/server";
import { loginUser } from "@/lib/auth-repository";
import { createSessionToken, sessionCookieOptions, COOKIE } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const user = await loginUser({ email: body.email, password: body.password });
    const token = await createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
    });
    response.cookies.set(COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
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
