import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
export async function GET() {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const [total, easy, medium, hard] = await Promise.all([
    prisma.question.count({ where: { organizationId: s.organizationId } }),
    prisma.question.count({ where: { organizationId: s.organizationId, difficulty: "EASY" } }),
    prisma.question.count({ where: { organizationId: s.organizationId, difficulty: "MEDIUM" } }),
    prisma.question.count({ where: { organizationId: s.organizationId, difficulty: "HARD" } }),
  ]);
  return NextResponse.json({ total, easy, medium, hard });
}
