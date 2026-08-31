import { NextResponse } from "next/server";
import { fetchAttempt } from "@/lib/exam-service";

export async function GET(request, { params }) {
  const { id } = await params;
  const attempt = fetchAttempt(id);
  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: attempt.id,
    examId: attempt.examId,
    startedAt: attempt.startedAt,
    expiresAt: attempt.expiresAt,
    submittedAt: attempt.submittedAt,
    status: attempt.status,
    answers: attempt.answers,
    violations: attempt.violations.length,
    result: attempt.result,
  });
}
