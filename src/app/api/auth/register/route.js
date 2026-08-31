import { NextResponse } from "next/server";
import { registerUser, registerCoachingOrganization } from "@/lib/auth-repository";
import { createSessionToken, sessionCookieOptions, COOKIE } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    let user;

    if (body.role === "COACHING_ADMIN" || body.isCoaching || body.organizationName) {
      user = await registerCoachingOrganization({
        organizationName: body.organizationName || body.name + " Academy",
        adminName: body.name || body.adminName,
        email: body.email,
        phone: body.phone,
        district: body.district,
        password: body.password,
      });
    } else {
      user = await registerUser({
        name: body.name,
        email: body.email,
        phone: body.phone,
        password: body.password,
        targetExam: body.targetExam,
      });
    }

    const token = await createSessionToken(user);
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
        },
      },
      { status: 201 },
    );
    response.cookies.set(COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
    const messages = {
      USER_EXISTS: "An account already exists with this email or mobile number.",
      PASSWORD_TOO_SHORT: "Password must be at least 6 characters.",
      EMAIL_OR_PHONE_REQUIRED: "Email or mobile number is required.",
      ORGANIZATION_NAME_REQUIRED: "Coaching institute / academy name is required.",
    };
    return NextResponse.json(
      { error: messages[error.message] || "Unable to create account. " + error.message },
      { status: 400 },
    );
  }
}
