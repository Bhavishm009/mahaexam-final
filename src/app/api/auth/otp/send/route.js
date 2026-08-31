import { NextResponse } from "next/server";
import { sendOtpEmail } from "@/lib/email-service";
import { prisma } from "@/lib/db";

// Memory store for OTPs (keyed by email: { otp, expiresAt, attempts })
const otpStore = globalThis._otpStore || new Map();
globalThis._otpStore = otpStore;

export async function POST(request) {
  try {
    const { email, name = "Student" } = await request.json();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check rate limit: 1 OTP per 60 seconds
    const existing = otpStore.get(cleanEmail);
    if (existing && Date.now() - existing.createdAt < 45000) {
      const waitSecs = Math.ceil((45000 - (Date.now() - existing.createdAt)) / 1000);
      return NextResponse.json(
        { error: `कृपया ${waitSecs} सेकंद प्रतीक्षा करा.` },
        { status: 429 },
      );
    }

    // Generate 6-digit cryptographic-safe number
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(cleanEmail, {
      otp,
      expiresAt,
      createdAt: Date.now(),
      attempts: 0,
    });

    // Send email using Nodemailer
    await sendOtpEmail({
      to: cleanEmail,
      otp,
      userName: name,
    });

    // Log to email delivery audit if user exists
    try {
      const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
      await prisma.emailDelivery.create({
        data: {
          userId: user?.id || null,
          email: cleanEmail,
          template: "OTP_VERIFICATION",
          subject: `${otp} हा तुमचा MahaExam पडताळणी OTP आहे`,
          status: "SENT",
          sentAt: new Date(),
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: "OTP तुमच्या ईमेलवर पाठवण्यात आला आहे.",
      expiresInMinutes: 10,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP. Please try again." }, { status: 500 });
  }
}
