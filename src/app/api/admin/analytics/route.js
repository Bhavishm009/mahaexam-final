import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
export async function GET() {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const [students, coaching, exams, results] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT", status: "ACTIVE" } }),
    prisma.organization.count(),
    prisma.exam.count(),
    prisma.examResult.findMany({ select: { percentage: true, passed: true, obtainedMarks: true } }),
  ]);
  const avg = results.length ? results.reduce((a, r) => a + r.percentage, 0) / results.length : 0;
  return NextResponse.json({
    students,
    coaching,
    exams,
    completedResults: results.length,
    averagePercent: avg,
    passPercentage: results.length
      ? (results.filter((r) => r.passed).length / results.length) * 100
      : 0,
  });
}
