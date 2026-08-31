import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { getAttemptForStudent, examRemainingMs } from "@/lib/secure-exam-service";
export async function GET(request, { params }) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const a = await getAttemptForStudent((await params).id, s.sub);
    const remaining = examRemainingMs(a);
    return NextResponse.json({
      attempt: {
        id: a.id,
        status: a.status,
        startedAt: a.startedAt,
        remainingMs: remaining,
        answers: (a.answers || []).map((x) => ({
          questionId: x.questionId,
          optionId: x.optionId,
          marked: x.marked,
        })),
        exam: {
          id: a.exam.id,
          title: a.exam.title,
          durationMinutes: a.exam.durationMinutes,
          fullscreenRequired: a.exam.fullscreenRequired,
          questions: a.exam.questions.map((x) => ({
            id: x.question.id,
            order: x.questionOrder,
            text: x.question.questionText,
            textMr: x.question.questionTextMr,
            options: x.question.options.map((o) => ({
              id: o.id,
              text: o.optionText,
              textMr: o.optionTextMr,
              order: o.optionOrder,
            })),
          })),
          answers: (a.answers || []).map((x) => ({
            questionId: x.questionId,
            optionId: x.optionId,
            marked: x.marked,
          })),
        },
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}
