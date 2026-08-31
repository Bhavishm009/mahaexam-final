import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request) {
  try {
    const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    const userId = session?.sub || null;

    const body = await request.json();
    const { endpoint, keys, userAgent } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Invalid push subscription object" }, { status: 400 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userId,
        userAgent: userAgent || request.headers.get("user-agent") || null,
        ipAddress: ip,
        isActive: true,
      },
      update: {
        userId: userId || undefined,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: userAgent || request.headers.get("user-agent") || null,
        isActive: true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      subscribed: true,
      id: subscription.id,
      guest: !userId,
    });
  } catch (error) {
    console.error("Push subscription error:", error);
    return NextResponse.json({ error: "Failed to store push subscription" }, { status: 500 });
  }
}
