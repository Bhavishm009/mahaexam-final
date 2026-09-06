import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { canManageQuestionBank, listQuestionsForExamBuilder } from "@/lib/question-bank-access";
import { prisma } from "@/lib/db";

export async function GET(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!canManageQuestionBank(s)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const u = new URL(request.url);
  const search = u.searchParams.get("search") || "";
  const difficulty = u.searchParams.get("difficulty") || "";
  const subjectId = u.searchParams.get("subjectId") || "";
  const limit = Math.min(Number(u.searchParams.get("limit") || 100), 250);

  const [questions, subjects] = await Promise.all([
    listQuestionsForExamBuilder(s, {
      search,
      difficulty,
      subjectId,
      limit,
    }),
    prisma.subject.findMany({
      include: {
        _count: { select: { questions: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return NextResponse.json({
    mode:
      s.role === "SUPER_ADMIN" || s.role === "ADMIN" ? "ALL_QUESTION_BANKS" : "OWN_QUESTION_BANK",
    questions,
    subjects: subjects.map((sub) => ({
      id: sub.id,
      name: sub.name,
      nameMr: sub.nameMr,
      questionCount: sub._count?.questions || 0,
    })),
  });
}
