import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch all completed attempts with linked result models
  const attempts = await prisma.examAttempt.findMany({
    where: {
      studentId: s.sub,
      status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] },
    },
    include: {
      exam: {
        select: {
          id: true,
          title: true,
          totalQuestions: true,
          totalMarks: true,
          durationMinutes: true,
          examType: true,
        },
      },
      examResult: true,
      resultSummary: true,
      result: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  const normalized = attempts.map((att) => {
    const r = att.resultSummary || att.examResult || att.result || {};
    const total = att.exam?.totalMarks || r.totalMarks || 100;
    const score = att.score ?? r.obtainedMarks ?? r.score ?? 0;
    const percentage =
      att.percentage ?? r.percentage ?? (total > 0 ? Math.round((score / total) * 100) : 0);
    const correct = r.correct ?? r.correctCount ?? 0;
    const wrong = r.wrong ?? r.wrongCount ?? 0;
    const unanswered =
      r.unanswered ??
      r.unansweredCount ??
      Math.max(0, (att.exam?.totalQuestions || 0) - (correct + wrong));
    const passed = r.passed ?? percentage >= 40;

    return {
      id: att.id,
      attemptId: att.id,
      resultId: r.id || att.id,
      examId: att.examId,
      exam: att.exam || { id: att.examId, title: "Online Examination" },
      score,
      totalMarks: total,
      percentage,
      correct,
      wrong,
      unanswered,
      passed,
      rank: r.rank || null,
      percentile: r.percentile || null,
      evaluatedAt: att.submittedAt || att.updatedAt,
    };
  });

  return NextResponse.json({ results: normalized });
}
