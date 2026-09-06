import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isExamAnswerKeyReleased } from "@/lib/exam-access-service";

export async function GET(request, { params }) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  // 1. Fetch Student Details
  const student = await prisma.user.findUnique({
    where: { id: s.sub },
    select: { id: true, name: true, email: true, phone: true },
  });

  // 2. Load all subjects for lookup
  const allSubjects = await prisma.subject.findMany();
  const subjectMap = new Map(allSubjects.map((sub) => [sub.id, sub]));

  function getSubjectName(subId, subObj) {
    const found = subObj || subjectMap.get(subId);
    if (found) {
      if (found.nameMr && found.name && found.nameMr !== found.name) {
        return `${found.nameMr} (${found.name})`;
      }
      return found.nameMr || found.name;
    }
    return "General Section (सामान्य घटक)";
  }

  // 3. Find Attempt
  const attempt = await prisma.examAttempt.findFirst({
    where: {
      OR: [{ id }, { result: { id } }, { examResult: { id } }, { resultSummary: { id } }],
      studentId: s.sub,
    },
    include: {
      student: { select: { id: true, name: true, email: true } },
      secureAnswers: true,
      answers: true,
      result: true,
      examResult: {
        include: {
          subjects: { include: { subject: true } },
        },
      },
      resultSummary: {
        include: {
          subjectBreakdown: { include: { subject: true } },
        },
      },
      exam: {
        include: {
          questions: {
            include: {
              question: {
                include: {
                  options: { orderBy: { optionOrder: "asc" } },
                  subject: true,
                },
              },
            },
            orderBy: { questionOrder: "asc" },
          },
        },
      },
    },
  });

  if (!attempt) {
    return NextResponse.json({ error: "Result not found" }, { status: 404 });
  }

  const exam = attempt.exam;

  // 4. Check if student has paid for this exam
  const purchase = await prisma.examPurchase.findUnique({
    where: { userId_examId: { userId: s.sub, examId: exam.id } },
  });
  const entitlement = await prisma.examEntitlement.findUnique({
    where: { studentId_examId: { studentId: s.sub, examId: exam.id } },
  });
  const hasPaid = purchase?.status === "PAID" || entitlement?.status === "ACTIVE";

  // 5. Anti-leak determination: Are answer keys released?
  // If student paid: always released immediately
  // If scheduled academy exam: released when exam.endAt passed OR admin published (frozenAt / RESULTS_PUBLISHED)
  const isReleased = hasPaid || isExamAnswerKeyReleased(exam);
  const answersLocked = !isReleased;
  const answersReleaseAt = exam.endAt ? new Date(exam.endAt).toISOString() : null;

  // 6. Build Answers Map (questionId -> optionId)
  const answersMap = {};
  if (attempt.secureAnswers?.length > 0) {
    for (const sa of attempt.secureAnswers) {
      if (sa.questionId) {
        answersMap[sa.questionId] = sa.optionId;
      }
    }
  }
  if (attempt.answers?.length > 0) {
    for (const a of attempt.answers) {
      if (a.questionId && !answersMap[a.questionId]) {
        answersMap[a.questionId] = a.selectedOptionId;
      }
    }
  }

  // 7. Build Questions Review Payload
  const rawQuestions = exam.questions || [];
  const reviewedQuestions = rawQuestions.map((eq, index) => {
    const q = eq.question || {};
    const selectedOptionId = answersMap[q.id || eq.questionId] || null;

    let correctOptionId = null;
    let isCorrect = null;

    if (isReleased) {
      const correctOpt = (q.options || []).find((o) => o.isCorrect);
      correctOptionId = correctOpt?.id || null;
      if (selectedOptionId) {
        isCorrect = selectedOptionId === correctOptionId;
      } else {
        isCorrect = false;
      }
    }

    return {
      id: q.id || eq.questionId,
      order: eq.questionOrder || index + 1,
      subjectName: getSubjectName(q.subjectId, q.subject),
      questionText: q.questionText || "",
      questionTextMr: q.questionTextMr || q.questionText || "",
      marks: eq.marks || q.marks || 1,
      negativeMarks: eq.negativeMarks || q.negativeMarks || 0,
      selectedOptionId,
      correctOptionId: isReleased ? correctOptionId : null,
      isCorrect: isReleased ? isCorrect : null,
      isAnswered: Boolean(selectedOptionId),
      explanation: isReleased ? q.explanation || "" : null,
      explanationMr: isReleased ? q.explanationMr || q.explanation || "" : null,
      options: (q.options || []).map((o, optIdx) => ({
        id: o.id || `opt-${optIdx + 1}`,
        optionText: o.optionText || "",
        optionTextMr: o.optionTextMr || o.optionText || "",
        order: o.optionOrder || optIdx + 1,
        isCorrect: isReleased ? Boolean(o.isCorrect) : null,
      })),
    };
  });

  // 8. Result Metrics
  const res = attempt.resultSummary || attempt.examResult || attempt.result || {};
  const score = attempt.score ?? res.obtainedMarks ?? res.score ?? 0;
  const total = exam.totalMarks || res.totalMarks || 100;
  const percentage =
    attempt.percentage ?? res.percentage ?? (total > 0 ? Math.round((score / total) * 100) : 0);
  const correctCount = res.correct ?? res.correctCount ?? 0;
  const wrongCount = res.wrong ?? res.wrongCount ?? 0;
  const unansweredCount =
    res.unanswered ??
    res.unansweredCount ??
    Math.max(0, reviewedQuestions.length - (correctCount + wrongCount));
  const isPassed = res.passed ?? percentage >= 40;

  // 9. Subject Breakdown
  const subjectBreakdown =
    attempt.resultSummary?.subjectBreakdown || attempt.examResult?.subjects || [];

  const formattedSubjectResults = subjectBreakdown.map((sb) => {
    const sName = getSubjectName(sb.subjectId, sb.subject);
    const subTotal = sb.total || sb.totalQuestions || 0;
    const subObtained = sb.obtained || sb.score || 0;
    const subCorrect = sb.correct || sb.correctCount || 0;
    const subWrong = sb.wrong || sb.wrongCount || 0;
    const subUnanswered = sb.unanswered || sb.unansweredCount || 0;
    const accuracy =
      subCorrect + subWrong > 0 ? Math.round((subCorrect / (subCorrect + subWrong)) * 100) : 0;
    const subPercentage = subTotal > 0 ? Math.round((subObtained / subTotal) * 100) : 0;

    return {
      id: sb.id,
      subjectId: sb.subjectId,
      subjectName: sName,
      totalQuestions: subTotal,
      correct: subCorrect,
      wrong: subWrong,
      unanswered: subUnanswered,
      score: subObtained,
      percentage: subPercentage,
      accuracy,
    };
  });

  return NextResponse.json({
    result: {
      id: res.id || attempt.id,
      attemptId: attempt.id,
      examId: exam.id,
      exam: {
        id: exam.id,
        slug: exam.slug,
        title: exam.title,
        titleMr: exam.title,
        totalMarks: exam.totalMarks,
        durationMinutes: exam.durationMinutes,
        totalQuestions: reviewedQuestions.length || exam.totalQuestions,
        startAt: exam.startAt,
        endAt: exam.endAt,
      },
      student: {
        name: student?.name || "Student",
        email: student?.email || "",
      },
      obtainedMarks: score,
      score,
      totalMarks: total,
      percentage,
      correctCount,
      correct: correctCount,
      wrongCount,
      wrong: wrongCount,
      unansweredCount,
      unanswered: unansweredCount,
      passed: isPassed,
      rank: res.rank || null,
      percentile: res.percentile || null,
      evaluatedAt: attempt.submittedAt || attempt.updatedAt,
      subjectResults: formattedSubjectResults,
    },
    answersLocked,
    answersReleaseAt,
    questions: reviewedQuestions,
  });
}
