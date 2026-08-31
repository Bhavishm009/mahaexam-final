import { prisma } from "@/lib/db";

export async function getAttemptForStudent(attemptId, userId) {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        include: {
          questions: {
            include: { question: { include: { options: { orderBy: { optionOrder: "asc" } } } } },
            orderBy: { questionOrder: "asc" },
          },
        },
      },
      answers: true,
    },
  });
  if (!attempt || attempt.studentId !== userId) {
    throw new Error("ATTEMPT_NOT_FOUND");
  }
  return attempt;
}

export async function saveAnswer({ attemptId, userId, questionId, optionId, marked = false }) {
  const attempt = await getAttemptForStudent(attemptId, userId);
  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("ATTEMPT_NOT_ACTIVE");
  }

  const started = new Date(attempt.startedAt).getTime();
  const duration = Number(attempt.exam.durationMinutes) * 60 * 1000;
  if (Date.now() > started + duration) {
    throw new Error("TIME_EXPIRED");
  }

  const answer = await prisma.examAttemptAnswer.upsert({
    where: { attemptId_questionId: { attemptId, questionId } },
    update: {
      optionId: optionId || null,
      marked: Boolean(marked),
      answeredAt: optionId ? new Date() : null,
    },
    create: {
      attemptId,
      questionId,
      optionId: optionId || null,
      marked: Boolean(marked),
      answeredAt: optionId ? new Date() : null,
    },
  });

  await prisma.examAttemptEvent.create({
    data: {
      attemptId,
      userId,
      type: "ANSWER_SAVED",
      metadata: { questionId, optionId: optionId || null },
    },
  });
  return answer;
}

export async function recordAttemptEvent({ attemptId, userId, type, metadata = {} }) {
  const attempt = await getAttemptForStudent(attemptId, userId);
  if (attempt.status !== "IN_PROGRESS" && !["MANUAL_SUBMITTED", "AUTO_SUBMITTED"].includes(type)) {
    throw new Error("ATTEMPT_NOT_ACTIVE");
  }
  return prisma.examAttemptEvent.create({ data: { attemptId, userId, type, metadata } });
}

export async function submitSecureAttempt({ attemptId, userId, reason = "MANUAL_SUBMITTED" }) {
  const attempt = await getAttemptForStudent(attemptId, userId);
  if (attempt.status === "SUBMITTED") {
    return attempt;
  }
  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("ATTEMPT_NOT_ACTIVE");
  }

  const now = new Date();
  const started = new Date(attempt.startedAt).getTime();
  const duration = Number(attempt.exam.durationMinutes) * 60 * 1000;
  const timeExpired = now.getTime() >= started + duration;

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.examAttempt.updateMany({
      where: { id: attempt.id, studentId: userId, status: "IN_PROGRESS" },
      data: { status: "SUBMITTED", submittedAt: now },
    });
    if (!result.count) {
      return tx.examAttempt.findUnique({ where: { id: attempt.id } });
    }
    await tx.examAttemptEvent.create({
      data: {
        attemptId: attempt.id,
        userId,
        type: timeExpired ? "AUTO_SUBMITTED" : reason,
        metadata: { timeExpired },
      },
    });
    return tx.examAttempt.findUnique({ where: { id: attempt.id } });
  });
  return updated;
}

export function examRemainingMs(attempt) {
  const end =
    new Date(attempt.startedAt).getTime() + Number(attempt.exam.durationMinutes) * 60 * 1000;
  return Math.max(0, end - Date.now());
}
