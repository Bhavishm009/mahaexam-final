import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  verifyMfaTicket,
  createSessionToken,
  sessionCookieOptions,
  COOKIE,
} from "@/lib/auth";
import { verifyTotpToken, verifyBackupCode } from "@/lib/totp";

export async function POST(request) {
  try {
    const body = await request.json();
    const { mfaTicket, code } = body;

    if (!mfaTicket || !code) {
      return NextResponse.json(
        { error: "MFA session ticket and verification code are required." },
        { status: 400 }
      );
    }

    const payload = await verifyMfaTicket(mfaTicket);
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { error: "Authentication session expired. Please enter your email and password again." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
          },
        },
      },
    });

    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      return NextResponse.json(
        { error: "Two-factor authentication is not active for this account." },
        { status: 400 }
      );
    }

    const cleanCode = code.toString().trim();
    let verified = false;
    let usedBackupCodeIndex = -1;

    // 1. Try TOTP 6-digit code
    if (cleanCode.length === 6 && /^\d{6}$/.test(cleanCode)) {
      verified = verifyTotpToken(user.mfaSecret, cleanCode);
    }

    // 2. If not verified, check backup recovery codes
    if (!verified && Array.isArray(user.mfaRecoveryCodes) && user.mfaRecoveryCodes.length > 0) {
      const backupCheck = verifyBackupCode(cleanCode, user.mfaRecoveryCodes);
      if (backupCheck.valid) {
        verified = true;
        usedBackupCodeIndex = backupCheck.index;
      }
    }

    if (!verified) {
      return NextResponse.json(
        { error: "Invalid verification code. Please check your authenticator app or backup code." },
        { status: 400 }
      );
    }

    // If backup code was used, remove it from the user's remaining recovery codes
    if (usedBackupCodeIndex !== -1) {
      const remainingCodes = [...user.mfaRecoveryCodes];
      remainingCodes.splice(usedBackupCodeIndex, 1);
      await prisma.user.update({
        where: { id: user.id },
        data: { mfaRecoveryCodes: remainingCodes },
      });
    }

    // Issue full session token & cookie
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
      usedBackupCode: usedBackupCodeIndex !== -1,
    });

    response.cookies.set(COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("MFA verify login error:", error);
    return NextResponse.json({ error: "Failed to complete MFA verification" }, { status: 500 });
  }
}
