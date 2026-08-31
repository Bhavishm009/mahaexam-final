import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
export async function GET() {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const results = await prisma.examResultSummary.findMany({
    where: { studentId: s.sub },
    orderBy: { evaluatedAt: "asc" },
    include: { exam: { select: { title: true, visibilityMode: true } } },
    take: 50,
  });
  const subject = await prisma.examResultSubject.findMany({
    where: { result: { studentId: s.sub } },
    include: { subject: true },
  });
  const by = new Map();
  for (const x of subject) {
    const k = x.subjectId;
    if (!by.has(k)) {
      by.set(k, {
        name: x.subject.name,
        attempts: 0,
        obtained: 0,
        total: 0,
        correct: 0,
        wrong: 0,
        unanswered: 0,
      });
    }
    const a = by.get(k);
    a.attempts++;
    a.obtained += x.obtained;
    a.total += x.total;
    a.correct += x.correct;
    a.wrong += x.wrong;
    a.unanswered += x.unanswered;
  }
  const subjects = [...by.values()]
    .map((x) => ({
      ...x,
      percentage: x.total ? Math.round((x.obtained / x.total) * 10000) / 100 : 0,
      accuracy:
        x.correct + x.wrong ? Math.round((x.correct / (x.correct + x.wrong)) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage);
  return NextResponse.json({
    results: results.map((r) => ({
      id: r.id,
      title: r.exam.title,
      percentage: r.percentage,
      rank: r.rank,
      percentile: r.percentile,
      free: r.exam.visibilityMode === "FREE_GLOBAL",
      evaluatedAt: r.evaluatedAt,
    })),
    subjects,
  });
}
