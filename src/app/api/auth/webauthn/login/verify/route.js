import { NextResponse } from "next/server";
import { COOKIE, sessionCookieOptions } from "@/lib/auth";
import { verifyPasskeyLoginAndCreateSession } from "@/lib/webauthn-service";

export async function POST(request) {
  try {
    const credentialData = await request.json();
    const { user, token } = await verifyPasskeyLoginAndCreateSession(credentialData);

    const response = NextResponse.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user,
      token,
    });

    response.cookies.set(COOKIE, token, sessionCookieOptions());
    return response;
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
