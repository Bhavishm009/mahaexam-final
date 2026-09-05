import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken, verifyMfaSetupTicket } from "@/lib/auth";
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
    const { code, setupTicket } = body;

    if (!code || !setupTicket) {
      return NextResponse.json(
        { error: "Verification code and setup ticket are required." },
        { status: 400 },
      );
    }

    const setupPayload = await verifyMfaSetupTicket(setupTicket);
    if (!setupPayload || setupPayload.userId !== session.sub) {
      return NextResponse.json(
        { error: "MFA setup session expired. Please scan the QR code again." },
        { status: 400 },
      );
    }

    const cleanCode = code.toString().trim();
    const isValid = verifyTotpToken(setupPayload.secretKey, cleanCode);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid 6-digit code. Please verify the code on your authenticator app." },
        { status: 400 },
      );
    }

    // Save MFA settings to database
    await prisma.user.update({
      where: { id: session.sub },
      data: {
        mfaEnabled: true,
        mfaSecret: setupPayload.secretKey,
        mfaRecoveryCodes: setupPayload.backupCodesHashed,
      },
    });

    return NextResponse.json({
      success: true,
      mfaEnabled: true,
      message: "Two-factor authentication has been successfully enabled!",
    });
  } catch (error) {
    console.error("MFA verify setup error:", error);
    return NextResponse.json({ error: "Failed to verify and activate MFA" }, { status: 500 });
  }
}
