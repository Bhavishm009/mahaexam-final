import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { submitSecureAttempt } from "@/lib/secure-exam-service";
import { evaluateAttempt, rankResult } from "@/lib/evaluation-service";

export async function POST(request) {
  try {
    const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!s) {
      return NextResponse.json({ error: "Student login required" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { attemptId, answers = {}, violations = 0, autoSubmitted = false } = body;

    if (!attemptId) {
      return NextResponse.json({ error: "Attempt ID is required" }, { status: 400 });
    }

    // Save all submitted answers into ExamAttemptAnswer and AttemptAnswer
    const answerEntries = Object.entries(answers);
    for (const [questionId, optionId] of answerEntries) {
      if (optionId) {
        await prisma.examAttemptAnswer.upsert({
          where: {
            attemptId_questionId: {
              attemptId,
              questionId,
            },
          },
          update: {
            optionId: String(optionId),
            answeredAt: new Date(),
          },
          create: {
            attemptId,
            questionId,
            optionId: String(optionId),
            answeredAt: new Date(),
          },
        });
      }
    }

    // Submit attempt
    const attempt = await submitSecureAttempt({
      attemptId,
      userId: s.sub,
      reason: autoSubmitted ? "AUTO_SUBMITTED" : "MANUAL_SUBMITTED",
    });

    // Record violations if any
    if (violations > 0) {
      await prisma.examViolation
        .create({
          data: {
            attemptId,
            studentId: s.sub,
            violationType: "TAB_SWITCH",
            warningCount: violations,
            occurredAt: new Date(),
          },
        })
        .catch(() => {});
    }

    // Evaluate result and rank
    const result = await evaluateAttempt(attempt.id);
    let ranked = result;
    try {
      ranked = await rankResult(result.id);
    } catch {}

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      status: attempt.status,
      submittedAt: attempt.submittedAt,
      resultId: ranked.id,
    });
  } catch (error) {
    console.error("Error submitting exam attempt:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit exam attempt." },
      { status: 400 },
    );
  }
}
