import { NextResponse } from "next/server";
import { answerQuestion } from "@/lib/exam-service";

export async function POST(request) {
  try {
    const body = await request.json();
    const answer = answerQuestion(
      body.attemptId,
      body.questionId,
      body.selectedOptionId,
      Number(body.timeSpentSeconds || 0),
    );
    return NextResponse.json({ success: true, answer });
  } catch (error) {
    const status = error.message === "ATTEMPT_NOT_FOUND" ? 404 : 409;
    return NextResponse.json({ error: error.message }, { status });
  }
}
