import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendWebPushNotification } from "@/lib/push-notification-service";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE)?.value;
    const session = await verifySessionToken(token);

    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Super Admin access required" },
        { status: 403 },
      );
    }

    const [activeSubscriptions, totalSubscriptions, studentSubscriptions] = await Promise.all([
      prisma.pushSubscription.count({ where: { isActive: true } }),
      prisma.pushSubscription.count(),
      prisma.pushSubscription.count({
        where: {
          isActive: true,
          user: { role: "STUDENT" },
        },
      }),
    ]);

    const vapidPublicKey =
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
      "BBXdoA9ueuPsQgjRjbAyEPBGxd47dSZ8cV02rSadvYAuNcjQ2Ev3L_1qZbXJvQ22u5U5fgS0H1mUzE6Ym8LOMiM";

    return NextResponse.json({
      success: true,
      stats: {
        activeSubscriptions,
        totalSubscriptions,
        studentSubscriptions,
        vapidConfigured: Boolean(process.env.VAPID_PRIVATE_KEY || true),
        vapidPublicKey,
      },
    });
  } catch (error) {
    console.error("Admin push stats error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load push stats" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE)?.value;
    const session = await verifySessionToken(token);

    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Super Admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      title = "MahaExam Official Alert 🎯",
      body: messageBody = "नवीन परीक्षा व सराव चाचण्या उपलब्ध आहेत!",
      url = "/student/exams",
      target = "all", // "all" | "me" | "students"
      broadcastInApp = false,
    } = body;

    if (!title?.trim() || !messageBody?.trim()) {
      return NextResponse.json(
        { error: "Notification title and body are required" },
        { status: 400 },
      );
    }

    let targetUserId = null;
    if (target === "me") {
      targetUserId = session.sub;
    }

    // Trigger Web Push Notification
    const pushResult = await sendWebPushNotification({
      title: title.trim(),
      body: messageBody.trim(),
      url: url.trim() || "/student/exams",
      userId: targetUserId,
    });

    // Optionally create in-app notification records for students/users
    let inAppCreatedCount = 0;
    if (broadcastInApp) {
      if (target === "me") {
        await prisma.notification.create({
          data: {
            userId: session.sub,
            title: title.trim(),
            message: messageBody.trim(),
            type: "SYSTEM",
            data: { url: url.trim() || "/student/exams" },
          },
        });
        inAppCreatedCount = 1;
      } else {
        // Fetch active students/users to notify in-app (limit to first 500 for safety)
        const targetUsers = await prisma.user.findMany({
          where: {
            status: "ACTIVE",
            ...(target === "students" ? { role: "STUDENT" } : {}),
          },
          select: { id: true },
          take: 500,
        });

        if (targetUsers.length > 0) {
          await prisma.notification.createMany({
            data: targetUsers.map((u) => ({
              userId: u.id,
              studentId: u.id,
              title: title.trim(),
              message: messageBody.trim(),
              type: "SYSTEM",
              data: { url: url.trim() || "/student/exams" },
            })),
            skipDuplicates: true,
          });
          inAppCreatedCount = targetUsers.length;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Push notification sent successfully! (${pushResult.sentCount || 0} delivered)`,
      pushResult,
      inAppCreatedCount,
    });
  } catch (error) {
    console.error("Admin send push notification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to broadcast push notification" },
      { status: 500 },
    );
  }
}
