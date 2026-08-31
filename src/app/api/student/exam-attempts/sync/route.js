import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request) {
  try {
    const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!s) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { attemptId, answers = {}, currentQuestion = 0 } = body;

    if (!attemptId) {
      return NextResponse.json({ error: "Attempt ID required" }, { status: 400 });
    }

    // Verify student owns active attempt
    const attempt = await prisma.examAttempt.findFirst({
      where: { id: attemptId, studentId: s.sub, status: "IN_PROGRESS" },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Active attempt not found" }, { status: 404 });
    }

    // Batch upsert answers
    const entries = Object.entries(answers);
    for (const [questionId, optionId] of entries) {
      if (optionId) {
        await prisma.examAttemptAnswer.upsert({
          where: {
            attemptId_questionId: { attemptId, questionId },
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

    // Update last activity
    await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        lastActivityAt: new Date(),
        answeredQuestions: entries.length,
      },
    });

    return NextResponse.json({
      success: true,
      syncedCount: entries.length,
      currentQuestion,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
