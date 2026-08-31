import { prisma } from "@/lib/db";

function shuffle(a) {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

async function resolveQuestions(exam) {
  const fixed = await prisma.examQuestionSnapshot.findMany({
    where: { examId: exam.id },
    orderBy: { position: "asc" },
  });
  if (!exam.questionPools.length) {
    return fixed;
  }
  const result = [];
  for (const pool of exam.questionPools) {
    const candidates = fixed.filter((q) => !pool.sectionName || q.sectionName === pool.sectionName);
    let selected = candidates;
    if (pool.difficulty) {
      selected = selected.filter((q) => q.snapshot?.difficulty === pool.difficulty);
    }
    selected = shuffle(selected).slice(0, pool.questionCount);
    result.push(...selected);
  }
  return result.length ? result : fixed;
}

export async function startAttempt(userId, examId) {
  const existing = await prisma.examAttempt.findFirst({
    where: { studentId: userId, examId, status: "IN_PROGRESS" },
    orderBy: { createdAt: "desc" },
  });
  if (existing) {
    return { attempt: existing, resumed: true };
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { questionSnapshots: { orderBy: { position: "asc" } }, questionPools: true },
  });
  if (!exam) {
    throw new Error("EXAM_NOT_FOUND");
  }
  const now = new Date();
  if (exam.startAt && now < exam.startAt) {
    throw new Error("EXAM_NOT_STARTED");
  }
  if (exam.endAt && now > exam.endAt) {
    throw new Error("EXAM_ENDED");
  }
  if (exam.status === "DRAFT" || exam.status === "ARCHIVED") {
    throw new Error("EXAM_NOT_AVAILABLE");
  }

  const selected = await resolveQuestions(exam);
  if (!selected.length) {
    throw new Error("NO_QUESTIONS");
  }
  const attempt = await prisma.$transaction(async (tx) => {
    const a = await tx.examAttempt.create({
      data: {
        studentId: userId,
        examId,
        status: "IN_PROGRESS",
        startedAt: now,
        lastActivityAt: now,
      },
    });
    await tx.attemptQuestion.createMany({
      data: selected.map((q, i) => ({
        attemptId: a.id,
        position: i + 1,
        sectionName: q.sectionName || null,
        questionId: q.sourceQuestionId || null,
        snapshot: q.snapshot,
      })),
    });
    await tx.examAttemptEvent.create({
      data: {
        attemptId: a.id,
        userId: userId,
        type: "STARTED",
        metadata: { questionCount: selected.length },
      },
    });
    return a;
  });
  return { attempt, resumed: false };
}

export async function getAttempt(userId, attemptId) {
  const a = await prisma.examAttempt.findFirst({
    where: { id: attemptId, studentId: userId },
    include: {
      questions: { orderBy: { position: "asc" } },
      exam: {
        select: {
          id: true,
          title: true,
          durationMinutes: true,
          startAt: true,
          endAt: true,
          fullscreenRequired: true,
          negativeMarks: true,
          status: true,
        },
      },
    },
  });
  if (!a) {
    throw new Error("ATTEMPT_NOT_FOUND");
  }
  if (a.status === "IN_PROGRESS") {
    const now = new Date();
    const deadline = new Date(a.startedAt.getTime() + a.exam.durationMinutes * 60000);
    if (now >= deadline) {
      return submitAttempt(userId, attemptId, true);
    }
  }
  return a;
}

export async function saveAnswer(
  userId,
  attemptId,
  questionPosition,
  selectedOption,
  markedForReview,
) {
  const a = await prisma.examAttempt.findFirst({
    where: { id: attemptId, studentId: userId, status: "IN_PROGRESS" },
    select: { id: true },
  });
  if (!a) {
    throw new Error("ATTEMPT_NOT_ACTIVE");
  }
  const q = await prisma.attemptQuestion.findFirst({
    where: { attemptId, position: Number(questionPosition) },
  });
  if (!q) {
    throw new Error("QUESTION_NOT_FOUND");
  }
  const updated = await prisma.attemptQuestion.update({
    where: { id: q.id },
    data: {
      selectedOption: selectedOption ?? null,
      markedForReview: Boolean(markedForReview),
      answeredAt: selectedOption ? new Date() : q.answeredAt,
    },
  });
  await prisma.examAttempt.update({
    where: { id: attemptId },
    data: { lastActivityAt: new Date() },
  });
  await prisma.examAttemptEvent.create({
    data: {
      attemptId,
      type: "ANSWER_SAVED",
      metadata: { position: Number(questionPosition), selectedOption: selectedOption ?? null },
    },
  });
  return updated;
}

export async function logEvent(userId, attemptId, type, metadata = {}) {
  const a = await prisma.examAttempt.findFirst({
    where: { id: attemptId, studentId: userId, status: "IN_PROGRESS" },
    select: { id: true },
  });
  if (!a) {
    throw new Error("ATTEMPT_NOT_ACTIVE");
  }
  return prisma.examAttemptEvent.create({ data: { attemptId, userId, type, metadata } });
}

export async function submitAttempt(userId, attemptId, auto = false) {
  const a = await prisma.examAttempt.findFirst({
    where: { id: attemptId, studentId: userId, status: "IN_PROGRESS" },
    include: {
      questions: true,
      exam: { select: { id: true, totalMarks: true, negativeMarks: true } },
    },
  });
  if (!a) {
    throw new Error("ATTEMPT_NOT_ACTIVE");
  }
  const submittedAt = new Date();
  const result = await prisma.$transaction(async (tx) => {
    const status = auto ? "AUTO_SUBMITTED" : "SUBMITTED";
    const updated = await tx.examAttempt.update({
      where: { id: attemptId },
      data: { status, submittedAt, lastActivityAt: submittedAt },
    });
    await tx.examAttemptEvent.create({
      data: {
        attemptId,
        userId,
        type: auto ? "AUTO_SUBMITTED" : "SUBMITTED",
        metadata: { questionCount: a.questions.length },
      },
    });
    return updated;
  });
  return result;
}
