import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { selectQuestionsForPaper } from "@/lib/question-bank-service";

export async function POST(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const b = await request.json();
  if (!Array.isArray(b.rules) || !b.rules.length) {
    return NextResponse.json({ error: "Add at least one paper rule." }, { status: 422 });
  }
  const selected = [];
  for (const rule of b.rules) {
    const qs = await selectQuestionsForPaper({
      organizationId: s.organizationId,
      subjectId: rule.subjectId,
      chapterId: rule.chapterId,
      topicId: rule.topicId,
      difficulty: rule.difficulty,
      count: rule.count,
    });
    selected.push(...qs);
  }
  const unique = [...new Map(selected.map((q) => [q.id, q])).values()];
  return NextResponse.json({ questions: unique, totalQuestions: unique.length });
}
