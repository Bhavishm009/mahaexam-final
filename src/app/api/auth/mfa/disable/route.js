import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifyTotpToken } from "@/lib/totp";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE)?.value;
    const session = await verifySessionToken(token);

    if (!session || !session.sub) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const body = await request.json();
    const { password, code } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { id: true, passwordHash: true, mfaSecret: true, mfaEnabled: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.mfaEnabled) {
      return NextResponse.json({ success: true, message: "MFA is already disabled." });
    }

    // Require either account password or valid TOTP code to disable MFA
    let authenticated = false;

    if (password && user.passwordHash) {
      authenticated = await bcrypt.compare(password, user.passwordHash);
    } else if (code && user.mfaSecret) {
      authenticated = verifyTotpToken(user.mfaSecret, code);
    }

    if (!authenticated) {
      return NextResponse.json(
        { error: "Incorrect password or 6-digit code. Verification failed." },
        { status: 400 },
      );
    }

    // Disable MFA
    await prisma.user.update({
      where: { id: session.sub },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        mfaRecoveryCodes: [],
      },
    });

    return NextResponse.json({
      success: true,
      mfaEnabled: false,
      message: "Two-factor authentication has been disabled.",
    });
  } catch (error) {
    console.error("MFA disable error:", error);
    return NextResponse.json({ error: "Failed to disable MFA" }, { status: 500 });
  }
}
