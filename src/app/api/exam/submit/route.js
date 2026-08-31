import { NextResponse } from "next/server";
import { finishExam } from "@/lib/exam-service";

export async function POST(request) {
  try {
    const body = await request.json();
    const attempt = finishExam(body.attemptId);
    return NextResponse.json({
      success: true,
      status: attempt.status,
      submittedAt: attempt.submittedAt,
      result: attempt.result,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
