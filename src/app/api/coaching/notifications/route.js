import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
export async function GET() {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const notifications = await prisma.coachingNotification.findMany({
    where: { organizationId: s.organizationId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ notifications });
}
