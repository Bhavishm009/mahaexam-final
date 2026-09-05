import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken, createMfaSetupTicket } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  generateTotpSecret,
  generateTotpUri,
  generateQrCodeSvg,
  generateQrCodeDataUrl,
  generateBackupCodes,
  hashBackupCode,
} from "@/lib/totp";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE)?.value;
    const session = await verifySessionToken(token);

    if (!session || !session.sub) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { id: true, email: true, name: true, mfaEnabled: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate fresh TOTP secret & backup recovery codes
    const secretKey = generateTotpSecret();
    const backupCodes = generateBackupCodes(8);
    const backupCodesHashed = backupCodes.map(hashBackupCode);

    const userEmail = user.email || user.name || "user";
    const otpauthUri = generateTotpUri(secretKey, userEmail, "MahaExam");
    const [qrCodeSvg, qrCodeDataUrl] = await Promise.all([
      generateQrCodeSvg(otpauthUri, 220),
      generateQrCodeDataUrl(otpauthUri, 240),
    ]);

    // Sign setup ticket so the verification endpoint knows which secret is being activated
    const setupTicket = await createMfaSetupTicket({
      userId: user.id,
      secretKey,
      backupCodesHashed,
    });

    return NextResponse.json({
      success: true,
      secretKey,
      otpauthUri,
      qrCodeSvg,
      qrCodeDataUrl,
      backupCodes,
      setupTicket,
      mfaEnabled: user.mfaEnabled,
    });
  } catch (error) {
    console.error("MFA setup error:", error);
    return NextResponse.json({ error: "Failed to initiate MFA setup" }, { status: 500 });
  }
}
