import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSessionToken, sessionCookieOptions, COOKIE } from "@/lib/auth";

const otpStore = globalThis._otpStore || new Map();
globalThis._otpStore = otpStore;

export async function POST(request) {
  try {
    const { email, otp, autoLogin = false } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const record = otpStore.get(cleanEmail);
    if (!record) {
      return NextResponse.json(
        { error: "OTP सापडला नाही किंवा कालबाह्य झाला आहे. कृपया नवीन OTP मागवा." },
        { status: 400 },
      );
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanEmail);
      return NextResponse.json({ error: "OTP कालबाह्य (expired) झाला आहे." }, { status: 400 });
    }

    if (record.attempts >= 5) {
      otpStore.delete(cleanEmail);
      return NextResponse.json(
        { error: "अनेक चुकीचे प्रयत्न झाले आहेत. कृपया नवीन OTP मागवा." },
        { status: 429 },
      );
    }

    if (record.otp !== cleanOtp) {
      record.attempts += 1;
      return NextResponse.json({ error: "अवैध OTP कोड. कृपया पुन्हा तपासा." }, { status: 400 });
    }

    // OTP Verified! Remove from store
    otpStore.delete(cleanEmail);

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { organization: true },
    });

    const response = NextResponse.json({
      success: true,
      verified: true,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
          }
        : null,
    });

    if (autoLogin && user) {
      const token = await createSessionToken(user);
      response.cookies.set(COOKIE, token, sessionCookieOptions());
    }

    return response;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ error: "Failed to verify OTP." }, { status: 500 });
  }
}
