import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { getStudentExamAccess } from "@/lib/exam-access-service";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";

export async function POST(request) {
  let s = null;
  try {
    s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!s || !s.sub) {
      return NextResponse.json({ error: "Student login required" }, { status: 401 });
    }

    const rl = rateLimit(`secure-start:${s.sub}`, 30, 60000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const examId = body.examId;
    if (!examId) {
      return NextResponse.json({ error: "Exam ID is required" }, { status: 400 });
    }

    const access = await getStudentExamAccess(s.sub, examId);
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason || "Exam access denied" }, { status: 403 });
    }

    const realExamId = access.exam.id;

    // Fetch complete exam with questions and options
    let examData = await prisma.exam.findUnique({
      where: { id: realExamId },
      include: {
        questions: {
          include: {
            question: {
              include: {
                options: {
                  orderBy: { optionOrder: "asc" },
                },
              },
            },
          },
          orderBy: { questionOrder: "asc" },
        },
      },
    });

    if (!examData) {
      return NextResponse.json({ error: "Exam details not found" }, { status: 404 });
    }

    // If exam has no questions linked, attempt to link available published questions
    if (!examData.questions || examData.questions.length === 0) {
      const fallbackQuestions = await prisma.question.findMany({
        where: { status: "PUBLISHED" },
        take: 25,
        include: {
          options: {
            orderBy: { optionOrder: "asc" },
          },
        },
      });

      if (fallbackQuestions.length > 0) {
        for (let i = 0; i < fallbackQuestions.length; i++) {
          const q = fallbackQuestions[i];
          await prisma.examQuestion.upsert({
            where: {
              examId_questionId: {
                examId: examData.id,
                questionId: q.id,
              },
            },
            update: { questionOrder: i + 1 },
            create: {
              examId: examData.id,
              questionId: q.id,
              questionOrder: i + 1,
              marks: q.marks || 1,
              negativeMarks: q.negativeMarks || 0,
            },
          });
        }

        // Re-fetch exam
        examData = await prisma.exam.findUnique({
          where: { id: realExamId },
          include: {
            questions: {
              include: {
                question: {
                  include: {
                    options: {
                      orderBy: { optionOrder: "asc" },
                    },
                  },
                },
              },
              orderBy: { questionOrder: "asc" },
            },
          },
        });
      }
    }

    // Format and deduplicate questions list (guarantee 0 duplicates)
    const seenQuestionIds = new Set();
    const seenQuestionTexts = new Set();
    const rawQuestions = examData.questions || [];
    const questions = [];

    for (let idx = 0; idx < rawQuestions.length; idx++) {
      const eq = rawQuestions[idx];
      const q = eq.question || {};
      const qId = q.id || eq.id || `q-${idx + 1}`;
      const qText = q.questionText || "";

      if (qId && seenQuestionIds.has(qId)) {
        continue;
      }
      if (qText && seenQuestionTexts.has(qText)) {
        continue;
      }

      if (qId) {
        seenQuestionIds.add(qId);
      }
      if (qText) {
        seenQuestionTexts.add(qText);
      }

      questions.push({
        id: qId,
        order: questions.length + 1,
        text: qText,
        textMr: q.questionTextMr || qText,
        questionText: qText,
        questionTextMr: q.questionTextMr || qText,
        explanation: q.explanation || "",
        explanationMr: q.explanationMr || "",
        marks: eq.marks || q.marks || 1,
        negativeMarks: eq.negativeMarks || q.negativeMarks || 0,
        options: (q.options || []).map((o, optIdx) => ({
          id: o.id || `opt-${optIdx + 1}`,
          text: o.optionText || "",
          textMr: o.optionTextMr || o.optionText || "",
          optionText: o.optionText || "",
          optionTextMr: o.optionTextMr || o.optionText || "",
          order: o.optionOrder || optIdx + 1,
        })),
      });
    }

    // Check for existing IN_PROGRESS attempt
    const existing = await prisma.examAttempt.findFirst({
      where: { studentId: s.sub, examId: realExamId, status: "IN_PROGRESS" },
      include: {
        secureAnswers: true,
        answers: true,
      },
      orderBy: { startedAt: "desc" },
    });

    let attempt;
    const answersMap = {};

    if (existing) {
      attempt = existing;
      if (existing.secureAnswers && existing.secureAnswers.length > 0) {
        for (const ans of existing.secureAnswers) {
          if (ans.optionId) {
            answersMap[ans.questionId] = ans.optionId;
          }
        }
      } else if (existing.answers && existing.answers.length > 0) {
        for (const ans of existing.answers) {
          if (ans.selectedOptionId) {
            answersMap[ans.questionId] = ans.selectedOptionId;
          }
        }
      }
    } else {
      attempt = await prisma.examAttempt.create({
        data: {
          studentId: s.sub,
          examId: realExamId,
          status: "IN_PROGRESS",
          startedAt: new Date(),
          totalQuestions: questions.length,
        },
      });

      await prisma.examAttemptEvent.create({
        data: {
          attemptId: attempt.id,
          userId: s.sub,
          type: "STARTED",
          metadata: { questionCount: questions.length },
        },
      });
    }

    return NextResponse.json({
      success: true,
      resumed: Boolean(existing),
      attempt: {
        id: attempt.id,
        startedAt: attempt.startedAt,
        answers: answersMap,
      },
      exam: {
        id: examData.id,
        slug: examData.slug,
        title: examData.title,
        titleMr: examData.title,
        duration: examData.durationMinutes || 60,
        durationMinutes: examData.durationMinutes || 60,
        totalMarks: examData.totalMarks || questions.length,
        totalQuestions: questions.length,
        negativeMarks: examData.negativeMarks || 0,
        fullscreenRequired: examData.fullscreenRequired ?? true,
        questions,
      },
    });
  } catch (error) {
    console.error("Error starting exam attempt:", error);
    await logError({
      message: error.message,
      stack: error.stack,
      source: "SERVER",
      route: "/api/student/exam-attempts/start",
      userId: s?.sub || null,
      request,
    }).catch(() => {});

    return NextResponse.json(
      { error: error.message || "Failed to initialize exam session." },
      { status: 500 },
    );
  }
}
