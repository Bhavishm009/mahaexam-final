import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
export async function GET() {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const rows = await prisma.coachingExamAggregate.findMany({
    where: { organizationId: s.organizationId },
    orderBy: { updatedAt: "desc" },
    include: { exam: { select: { title: true } } },
  });
  return NextResponse.json({ rows });
}
