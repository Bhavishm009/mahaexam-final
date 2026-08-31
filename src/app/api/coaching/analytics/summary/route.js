import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["COACHING_ADMIN", "TEACHER", "SUPER_ADMIN"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const where = s.organizationId ? { organizationId: s.organizationId } : {};
  const [students, activeBatches, exams, results] = await Promise.all([
    prisma.user.count({ where: { ...where, role: "STUDENT", status: { not: "SUSPENDED" } } }),
    prisma.batch.count({ where: { ...where, status: { not: "ARCHIVED" } } }),
    prisma.exam.count({ where }),
    prisma.examResult.findMany({
      where: { exam: where },
      select: { percentage: true, passed: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 1000,
    }),
  ]);
  const avg = results.length ? results.reduce((a, r) => a + r.percentage, 0) / results.length : 0;
  const pass = results.length
    ? (results.filter((r) => r.passed === true).length / results.length) * 100
    : 0;
  const monthly = {};
  for (const r of results) {
    const key = new Date(r.createdAt).toISOString().slice(0, 7);
    if (!monthly[key]) {
      monthly[key] = { attempts: 0, total: 0 };
    }
    monthly[key].attempts++;
    monthly[key].total += r.percentage;
  }
  return NextResponse.json({
    students,
    activeBatches,
    exams,
    attempts: results.length,
    averagePercentage: +avg.toFixed(2),
    passRate: +pass.toFixed(2),
    monthly: Object.entries(monthly).map(([month, v]) => ({
      month,
      attempts: v.attempts,
      averagePercentage: +(v.total / v.attempts).toFixed(2),
    })),
  });
}
