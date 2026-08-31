import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export async function POST() {
  // Production cron must send Authorization: Bearer <INTERNAL_CRON_SECRET>
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Use a secured production scheduler integration." },
      { status: 403 },
    );
  }
  const expired = await prisma.coachingSubscription.updateMany({
    where: { status: "ACTIVE", currentPeriodEnd: { lt: new Date() } },
    data: { status: "EXPIRED" },
  });
  return NextResponse.json({ updated: expired.count });
}
