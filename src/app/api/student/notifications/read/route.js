import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
export async function POST(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await request.json();
  const n = await prisma.studentNotification.updateMany({
    where: { id, userId: s.sub },
    data: { readAt: new Date() },
  });
  return NextResponse.json({ success: n.count > 0 });
}
