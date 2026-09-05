import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
export async function GET() {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !s.sub || s.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const notifications = await prisma.notification.findMany({
    where: { studentId: s.sub },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const studentSafe = notifications.filter((n) => {
    const titleLower = (n.title || "").toLowerCase();
    const msgLower = (n.message || "").toLowerCase();
    return !(
      titleLower.includes("database") ||
      msgLower.includes("database") ||
      titleLower.includes("failover") ||
      msgLower.includes("failover")
    );
  });

  return NextResponse.json({ notifications: studentSafe });
}
export async function POST(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await request.json();
  await prisma.notification.updateMany({
    where: { id, studentId: s.sub },
    data: { readAt: new Date() },
  });
  return NextResponse.json({ success: true });
}
