import { NextResponse } from "next/server";
import { startExam } from "@/lib/exam-service";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const attempt = startExam(body.examId || "police-01");
    return NextResponse.json({
      attemptId: attempt.id,
      startedAt: attempt.startedAt,
      expiresAt: attempt.expiresAt,
      status: attempt.status,
      questions: attempt.questions,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
