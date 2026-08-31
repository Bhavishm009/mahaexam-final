import { prisma } from "@/lib/db";

const pct = (a, b) => (b > 0 ? Math.round((a / b) * 10000) / 100 : 0);
const acc = (correct, wrong) =>
  correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 10000) / 100 : 0;

export async function evaluateAttempt(attemptId) {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        include: {
          questions: {
            include: { question: { include: { options: true, subject: true, chapter: true } } },
            orderBy: { questionOrder: "asc" },
          },
        },
      },
      secureAnswers: true,
    },
  });
  if (!attempt) {
    throw new Error("ATTEMPT_NOT_FOUND");
  }
  if (!["SUBMITTED", "AUTO_SUBMITTED"].includes(attempt.status)) {
    throw new Error("ATTEMPT_NOT_SUBMITTED");
  }

  const existing = await prisma.examResult.findUnique({ where: { attemptId } });
  const existingSummary = await prisma.examResultSummary.findUnique({ where: { attemptId } });
  if (existing && existingSummary) {
    return existingSummary;
  }

  const answerMap = new Map(attempt.secureAnswers.map((a) => [a.questionId, a]));
  let totalMarks = 0,
    obtainedMarks = 0,
    correct = 0,
    wrong = 0,
    unanswered = 0;
  const subjects = new Map();
  const chapters = new Map();

  for (const eq of attempt.exam.questions) {
    const q = eq.question;
    if (!q) {
      continue;
    }
    const answer = answerMap.get(q.id);
    const marks = Number(eq.marks ?? q.marks ?? 1);
    const examNegative = Number(attempt.exam?.negativeMarks ?? 0);
    const negative = examNegative > 0 ? Number(eq.negativeMarks ?? examNegative) : 0;
    totalMarks += marks;
    let delta = 0;
    let state = "UNANSWERED";
    if (answer?.optionId) {
      const chosen = q.options.find((o) => o.id === answer.optionId);
      if (chosen?.isCorrect) {
        correct++;
        delta = marks;
        state = "CORRECT";
      } else {
        wrong++;
        delta = -negative;
        state = "WRONG";
      }
    } else {
      unanswered++;
    }
    obtainedMarks += delta;

    const subjectId = q.subjectId;
    if (subjectId) {
      const x = subjects.get(subjectId) || {
        totalQuestions: 0,
        total: 0,
        obtained: 0,
        correctCount: 0,
        wrongCount: 0,
        unansweredCount: 0,
      };
      x.totalQuestions++;
      x.total += marks;
      x.obtained += delta;
      if (state === "CORRECT") {
        x.correctCount++;
      }
      if (state === "WRONG") {
        x.wrongCount++;
      }
      if (state === "UNANSWERED") {
        x.unansweredCount++;
      }
      subjects.set(subjectId, x);
    }
    const chapterId = q.chapterId;
    if (chapterId) {
      const x = chapters.get(chapterId) || {
        total: 0,
        obtained: 0,
        correct: 0,
        wrong: 0,
        unanswered: 0,
      };
      x.total += marks;
      x.obtained += delta;
      if (state === "CORRECT") {
        x.correct++;
      }
      if (state === "WRONG") {
        x.wrong++;
      }
      if (state === "UNANSWERED") {
        x.unanswered++;
      }
      chapters.set(chapterId, x);
    }
  }

  obtainedMarks = Math.max(0, obtainedMarks);
  const percentage = pct(obtainedMarks, totalMarks);
  const passed =
    attempt.exam.passingScore === null || attempt.exam.passingScore === undefined
      ? true
      : percentage >= Number(attempt.exam.passingScore);
  const started = new Date(attempt.startedAt).getTime();
  const submitted = new Date(attempt.submittedAt || Date.now()).getTime();
  const timeTakenSeconds = Math.max(0, Math.round((submitted - started) / 1000));
  const accuracy = acc(correct, wrong);

  const result = await prisma.$transaction(async (tx) => {
    const r =
      existing ||
      (await tx.examResult.create({
        data: {
          attemptId,
          examId: attempt.examId,
          studentId: attempt.studentId,
          score: obtainedMarks,
          percentage,
          correctCount: correct,
          wrongCount: wrong,
          unansweredCount: unanswered,
          timeTakenSeconds,
          passed,
          obtainedMarks,
          totalMarks,
          accuracy,
          publishedAt: new Date(),
          evaluatedAt: new Date(),
        },
      }));

    if (!existing) {
      for (const [subjectId, x] of subjects) {
        await tx.subjectResult.create({
          data: {
            resultId: r.id,
            subjectId,
            totalQuestions: x.totalQuestions,
            correctCount: x.correctCount,
            wrongCount: x.wrongCount,
            unansweredCount: x.unansweredCount,
            score: Math.max(0, x.obtained),
            percentage: pct(Math.max(0, x.obtained), x.total),
          },
        });
      }
    }

    const summary =
      existingSummary ||
      (await tx.examResultSummary.create({
        data: {
          attemptId,
          studentId: attempt.studentId,
          examId: attempt.examId,
          totalQuestions: attempt.exam.questions.length,
          answered: correct + wrong,
          correct,
          wrong,
          unanswered,
          totalMarks,
          obtainedMarks,
          percentage,
          passed,
          subjectBreakdown: {
            create: [...subjects].map(([subjectId, x]) => ({
              subjectId,
              total: x.total,
              obtained: x.obtained,
              correct: x.correctCount,
              wrong: x.wrongCount,
              unanswered: x.unansweredCount,
            })),
          },
          chapterBreakdown: {
            create: [...chapters].map(([chapterId, x]) => ({
              chapterId,
              total: x.total,
              obtained: x.obtained,
              correct: x.correct,
              wrong: x.wrong,
              unanswered: x.unanswered,
            })),
          },
        },
      }));
    return summary;
  });
  return result;
}

export async function rankResult(resultId) {
  const result = await prisma.examResultSummary.findUnique({ where: { id: resultId } });
  if (!result) {
    throw new Error("RESULT_NOT_FOUND");
  }
  const better = await prisma.examResultSummary.count({
    where: { examId: result.examId, obtainedMarks: { gt: result.obtainedMarks } },
  });
  const total = await prisma.examResultSummary.count({ where: { examId: result.examId } });
  const rank = better + 1;
  const percentile = total <= 1 ? 100 : Math.round(((total - rank) / (total - 1)) * 10000) / 100;
  await prisma.examResult.updateMany({
    where: {
      id: {
        in: (
          await prisma.examResult.findMany({
            where: { examId: result.examId },
            select: { id: true, attemptId: true },
          })
        )
          .filter((x) => x.attemptId === result.attemptId)
          .map((x) => x.id),
      },
    },
    data: { rank, percentile },
  });
  return prisma.examResultSummary.update({ where: { id: result.id }, data: { rank, percentile } });
}
