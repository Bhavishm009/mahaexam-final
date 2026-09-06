import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE)?.value;
    const s = await verifySessionToken(token);
    let userId = s?.sub || null;

    if (!userId) {
      try {
        const nextAuthSession = await auth();
        userId = nextAuthSession?.user?.id || null;
      } catch {}
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { attemptId, examId, delta, heartbeatOnly, answers = {}, currentQuestion = 0 } = body;

    if (!attemptId && !examId) {
      return NextResponse.json({ error: "Attempt ID or Exam ID required" }, { status: 400 });
    }

    // 1. Locate attempt by attemptId if provided
    let attempt = null;
    if (attemptId) {
      attempt = await prisma.examAttempt.findFirst({
        where: { id: attemptId, studentId: userId },
      });
    }

    // 2. If attempt is found but already submitted/expired, return gracefully without 404
    if (attempt && (attempt.status === "SUBMITTED" || attempt.status === "AUTO_SUBMITTED")) {
      return NextResponse.json({
        success: true,
        submitted: true,
        message: "Attempt already submitted",
      });
    }

    if (attempt && attempt.status === "EXPIRED") {
      return NextResponse.json({
        success: true,
        expired: true,
        message: "Attempt expired",
      });
    }

    // 3. If attempt was not found or was reset/deleted, attempt self-healing recovery
    let recoveredAttemptId = null;
    if (!attempt || attempt.status !== "IN_PROGRESS") {
      attempt = await prisma.examAttempt.findFirst({
        where: {
          studentId: userId,
          status: "IN_PROGRESS",
          ...(examId ? { OR: [{ examId }, { exam: { slug: examId } }] } : {}),
        },
        orderBy: { startedAt: "desc" },
      });

      if (attempt) {
        recoveredAttemptId = attempt.id;
      }
    }

    if (!attempt) {
      return NextResponse.json(
        { error: "Active attempt not found", shouldReinit: true },
        { status: 404 },
      );
    }

    const targetAttemptId = attempt.id;

    // PATH A: Lightweight Heartbeat (No answer mutations, only touch lastActivityAt)
    if (heartbeatOnly) {
      await prisma.examAttempt.update({
        where: { id: targetAttemptId },
        data: { lastActivityAt: new Date() },
      });
      return NextResponse.json({
        success: true,
        heartbeat: true,
        recoveredAttemptId,
        timestamp: new Date().toISOString(),
      });
    }

    // PATH B: High-Performance Delta Sync (Only 1 single targeted question mutation!)
    if (delta && delta.questionId) {
      const { questionId, optionId } = delta;
      if (optionId) {
        try {
          await prisma.examAttemptAnswer.upsert({
            where: {
              attemptId_questionId: { attemptId: targetAttemptId, questionId },
            },
            update: {
              optionId: String(optionId),
              answeredAt: new Date(),
            },
            create: {
              attemptId: targetAttemptId,
              questionId,
              optionId: String(optionId),
              answeredAt: new Date(),
            },
          });
        } catch (_) {
          try {
            await prisma.attemptAnswer.create({
              data: {
                attemptId: targetAttemptId,
                questionId,
                selectedOptionId: String(optionId),
                answeredAt: new Date(),
              },
            });
          } catch {}
        }
      } else {
        // Question unselected, delete answer
        try {
          await prisma.examAttemptAnswer.deleteMany({
            where: { attemptId: targetAttemptId, questionId },
          });
        } catch {}
      }

      const answeredCount =
        typeof body.answeredCount === "number"
          ? body.answeredCount
          : answers && Object.keys(answers).length > 0
            ? Object.values(answers).filter(Boolean).length
            : undefined;

      await prisma.examAttempt.update({
        where: { id: targetAttemptId },
        data: {
          lastActivityAt: new Date(),
          ...(answeredCount !== undefined ? { answeredQuestions: answeredCount } : {}),
        },
      });

      return NextResponse.json({
        success: true,
        syncedDelta: true,
        currentQuestion,
        recoveredAttemptId,
        timestamp: new Date().toISOString(),
      });
    }

    // PATH C: Smart Diff-Based Full Sync (Initial connect or reconnect: only write changed rows)
    const existingAnswers = await prisma.examAttemptAnswer.findMany({
      where: { attemptId: targetAttemptId },
      select: { questionId: true, optionId: true },
    });
    const existingMap = new Map(existingAnswers.map((a) => [a.questionId, a.optionId]));

    const toUpsert = [];
    const toDelete = [];
    for (const [qId, optId] of Object.entries(answers)) {
      if (optId) {
        if (existingMap.get(qId) !== String(optId)) {
          toUpsert.push({ questionId: qId, optionId: String(optId) });
        }
      } else if (existingMap.has(qId)) {
        toDelete.push(qId);
      }
    }

    for (const item of toUpsert) {
      try {
        await prisma.examAttemptAnswer.upsert({
          where: {
            attemptId_questionId: { attemptId: targetAttemptId, questionId: item.questionId },
          },
          update: {
            optionId: item.optionId,
            answeredAt: new Date(),
          },
          create: {
            attemptId: targetAttemptId,
            questionId: item.questionId,
            optionId: item.optionId,
            answeredAt: new Date(),
          },
        });
      } catch (_) {
        try {
          await prisma.attemptAnswer.create({
            data: {
              attemptId: targetAttemptId,
              questionId: item.questionId,
              selectedOptionId: item.optionId,
              answeredAt: new Date(),
            },
          });
        } catch {}
      }
    }

    if (toDelete.length > 0) {
      try {
        await prisma.examAttemptAnswer.deleteMany({
          where: { attemptId: targetAttemptId, questionId: { in: toDelete } },
        });
      } catch {}
    }

    // Update last activity & count of answered questions
    const answeredCount = Object.values(answers).filter(Boolean).length;
    await prisma.examAttempt.update({
      where: { id: targetAttemptId },
      data: {
        lastActivityAt: new Date(),
        answeredQuestions: answeredCount,
      },
    });

    return NextResponse.json({
      success: true,
      syncedCount: answeredCount,
      mutatedCount: toUpsert.length + toDelete.length,
      currentQuestion,
      recoveredAttemptId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
