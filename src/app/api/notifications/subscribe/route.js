import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

const MAX_DEVICES_PER_USER = 5;

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

    // 1. Upsert this specific device endpoint (endpoint is @unique, so same device never creates duplicates)
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

    // 2. Multi-device LRU management: If user is logged in, cap active devices to MAX_DEVICES_PER_USER
    if (userId) {
      const userActiveSubs = await prisma.pushSubscription.findMany({
        where: { userId, isActive: true },
        orderBy: { updatedAt: "desc" },
        select: { id: true },
      });

      if (userActiveSubs.length > MAX_DEVICES_PER_USER) {
        const excessSubs = userActiveSubs.slice(MAX_DEVICES_PER_USER);
        const excessIds = excessSubs.map((s) => s.id);
        await prisma.pushSubscription.deleteMany({
          where: { id: { in: excessIds } },
        });
      }
    }

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

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint required" }, { status: 400 });
    }

    await prisma.pushSubscription.deleteMany({
      where: { endpoint },
    });

    return NextResponse.json({ success: true, unsubscribed: true });
  } catch (error) {
    console.error("Push unsubscription error:", error);
    return NextResponse.json({ error: "Failed to remove push subscription" }, { status: 500 });
  }
}
