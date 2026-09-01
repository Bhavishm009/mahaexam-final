import { prisma } from "@/lib/db";
import { createResultForAttempt } from "@/lib/result-service";

const snapshotOptions = (options) =>
  options.map((o) => ({
    id: o.id,
    text: o.optionText,
    textMr: o.optionTextMr || null,
    order: o.optionOrder,
    isCorrect: Boolean(o.isCorrect),
  }));

async function getExamWithQuestions(examId) {
  return prisma.exam.findUnique({
    where: { id: examId },
    include: {
      questions: {
        include: { question: { include: { options: true } } },
        orderBy: { questionOrder: "asc" },
      },
    },
  });
}

export async function startPersistentAttempt({ examId, studentId }) {
  if (!studentId) {
    throw new Error("STUDENT_ID_REQUIRED");
  }

  const exam = await getExamWithQuestions(examId);
  if (!exam) {
    throw new Error("EXAM_NOT_FOUND");
  }
  if (exam.startAt && new Date() < new Date(exam.startAt)) {
    throw new Error("EXAM_NOT_STARTED");
  }
  if (exam.endAt && new Date() > new Date(exam.endAt)) {
    throw new Error("EXAM_ENDED");
  }

  const attempts = await prisma.examAttempt.findMany({
    where: { examId, studentId },
    orderBy: { attemptNumber: "desc" },
  });

  const active = attempts.find((a) => a.status === "IN_PROGRESS");
  if (active) {
    return prisma.examAttempt.findUnique({
      where: { id: active.id },
      include: { questions: { orderBy: { questionOrder: "asc" } } },
    });
  }

  const attemptNumber = (attempts[0]?.attemptNumber || 0) + 1;
  if (attemptNumber > exam.attemptLimit) {
    throw new Error("ATTEMPT_LIMIT_REACHED");
  }

  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + exam.durationMinutes * 60_000);

  // Deduplicate questions
  const seenQ = new Set();
  const uniqueQuestions = (exam.questions || []).filter((item) => {
    if (seenQ.has(item.questionId)) {
      return false;
    }
    seenQ.add(item.questionId);
    return true;
  });

  return prisma.examAttempt.create({
    data: {
      examId,
      studentId,
      attemptNumber,
      startedAt,
      expiresAt,
      questions: {
        create: uniqueQuestions.map((item, index) => ({
          questionId: item.questionId,
          questionOrder: index + 1,
          marks: item.marks,
          negativeMarks: item.negativeMarks,
          questionText: item.question.questionText,
          optionsSnapshot: snapshotOptions(item.question.options),
        })),
      },
    },
    include: { questions: { orderBy: { questionOrder: "asc" } } },
  });
}

export async function getPersistentAttempt(attemptId, studentId) {
  const attempt = await prisma.examAttempt.findFirst({
    where: { id: attemptId, studentId },
    include: {
      questions: {
        include: { answer: true },
        orderBy: { questionOrder: "asc" },
      },
      violations: true,
      exam: true,
    },
  });

  if (!attempt) {
    throw new Error("ATTEMPT_NOT_FOUND");
  }

  if (attempt.status === "IN_PROGRESS" && Date.now() >= new Date(attempt.expiresAt).getTime()) {
    return submitPersistentAttempt(attemptId, studentId, true);
  }

  return attempt;
}

export async function savePersistentAnswer({
  attemptId,
  studentId,
  attemptQuestionId,
  selectedOptionId,
  timeSpentSeconds = 0,
}) {
  const attempt = await getPersistentAttempt(attemptId, studentId);
  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("ATTEMPT_NOT_ACTIVE");
  }
  if (Date.now() >= new Date(attempt.expiresAt).getTime()) {
    throw new Error("EXAM_EXPIRED");
  }

  const question = attempt.questions.find((q) => q.id === attemptQuestionId);
  if (!question) {
    throw new Error("QUESTION_NOT_FOUND");
  }

  const options = Array.isArray(question.optionsSnapshot) ? question.optionsSnapshot : [];
  const selected = options.find((o) => o.id === selectedOptionId);
  if (!selected) {
    throw new Error("INVALID_OPTION");
  }

  return prisma.attemptAnswer.upsert({
    where: { attemptQuestionId },
    update: {
      selectedOptionId,
      isCorrect: Boolean(selected.isCorrect),
      marksAwarded: selected.isCorrect ? question.marks : -question.negativeMarks,
      timeSpentSeconds: Number(timeSpentSeconds || 0),
      answeredAt: new Date(),
    },
    create: {
      attemptId,
      attemptQuestionId,
      selectedOptionId,
      isCorrect: Boolean(selected.isCorrect),
      marksAwarded: selected.isCorrect ? question.marks : -question.negativeMarks,
      timeSpentSeconds: Number(timeSpentSeconds || 0),
      answeredAt: new Date(),
    },
  });
}

export async function addPersistentViolation({ attemptId, studentId, type, metadata = {} }) {
  const attempt = await getPersistentAttempt(attemptId, studentId);
  if (attempt.status !== "IN_PROGRESS") {
    return attempt;
  }

  await prisma.examViolation.create({
    data: { attemptId, studentId, violationType: type, metadata },
  });

  const count = await prisma.examViolation.count({ where: { attemptId } });
  if (count >= attempt.exam.violationThreshold) {
    return submitPersistentAttempt(attemptId, studentId, true);
  }

  return getPersistentAttempt(attemptId, studentId);
}

export async function submitPersistentAttempt(attemptId, studentId, auto = false) {
  const attempt = await prisma.examAttempt.findFirst({
    where: { id: attemptId, studentId },
    include: {
      questions: { include: { answer: true } },
      violations: true,
    },
  });

  if (!attempt) {
    throw new Error("ATTEMPT_NOT_FOUND");
  }
  if (attempt.status !== "IN_PROGRESS") {
    return attempt;
  }

  let score = 0;
  let correct = 0;
  let wrong = 0;
  let totalMarks = 0;

  for (const q of attempt.questions) {
    totalMarks += q.marks;
    if (!q.answer) {
      continue;
    }
    if (q.answer.isCorrect) {
      correct += 1;
    } else {
      wrong += 1;
    }
    score += q.answer.marksAwarded;
  }

  const unanswered = attempt.questions.length - correct - wrong;
  const submittedAt = new Date();
  const timeTakenSeconds = Math.max(
    0,
    Math.floor((submittedAt.getTime() - new Date(attempt.startedAt).getTime()) / 1000),
  );
  const finalScore = Math.max(0, score);
  const percentage = totalMarks ? Math.round((finalScore / totalMarks) * 10000) / 100 : 0;

  const updated = await prisma.examAttempt.update({
    where: { id: attemptId },
    data: {
      status: auto ? "AUTO_SUBMITTED" : "SUBMITTED",
      autoSubmitted: auto,
      submittedAt,
      score: finalScore,
      percentage,
      correctCount: correct,
      wrongCount: wrong,
      unansweredCount: unanswered,
      timeTakenSeconds,
    },
    include: {
      questions: { include: { answer: true } },
      violations: true,
    },
  });

  await createResultForAttempt(attemptId);
  return updated;
}
