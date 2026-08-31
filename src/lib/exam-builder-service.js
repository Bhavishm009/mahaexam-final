import { prisma } from "@/lib/db";
import { getQuestionBankScope } from "@/lib/question-bank-access";

export async function getBuilderQuestions(session, params = {}) {
  const scope = await getQuestionBankScope(session);
  const where = { ...scope.where };
  if (params.search) {
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { questionText: { contains: params.search, mode: "insensitive" } },
          { questionTextMr: { contains: params.search, mode: "insensitive" } },
        ],
      },
    ];
  }
  if (params.difficulty) {
    where.difficulty = params.difficulty;
  }
  return prisma.question.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { options: { orderBy: { optionOrder: "asc" } } },
  });
}

export async function createExamWithSnapshot({ session, data }) {
  if (!["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(session.role)) {
    throw new Error("FORBIDDEN");
  }
  const ids = Array.isArray(data.questionIds) ? data.questionIds : [];
  if (!ids.length) {
    throw new Error("AT_LEAST_ONE_QUESTION_REQUIRED");
  }
  const scope = await getQuestionBankScope(session);
  const questions = await prisma.question.findMany({
    where: { id: { in: ids }, ...scope.where },
    include: { options: { orderBy: { optionOrder: "asc" } } },
  });
  if (questions.length !== ids.length) {
    throw new Error("ONE_OR_MORE_QUESTIONS_NOT_PERMITTED");
  }
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length !== ids.length) {
    throw new Error("DUPLICATE_QUESTION_IDS");
  }
  const organizationId =
    session.role === "SUPER_ADMIN" ? data.organizationId || null : session.organizationId;
  const visibilityMode =
    session.role === "SUPER_ADMIN" && data.isFree
      ? "FREE_GLOBAL"
      : organizationId
        ? "COACHING"
        : "GLOBAL";
  const status = data.publishImmediately ? "SCHEDULED" : "DRAFT";
  const createdExam = await prisma.$transaction(async (tx) => {
    const exam = await tx.exam.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        examType: data.examType || "MOCK_TEST",
        language: data.language || "mr",
        durationMinutes: Number(data.durationMinutes || 30),
        totalQuestions: questions.length,
        totalMarks: Number(
          data.totalMarks || questions.reduce((a, q) => a + Number(q.marks || 1), 0),
        ),
        negativeMarks: Number(data.negativeMarks || 0),
        passingScore:
          data.passingScore === null || data.passingScore === undefined
            ? null
            : Number(data.passingScore),
        fullscreenRequired: data.fullscreenRequired !== false,
        startAt: data.startAt ? new Date(data.startAt) : null,
        endAt: data.endAt ? new Date(data.endAt) : null,
        status,
        organizationId,
        visibilityMode,
        isFree: Boolean(data.isFree && visibilityMode === "FREE_GLOBAL"),
        price: visibilityMode === "FREE_GLOBAL" ? 0 : Number(data.price || 0),
        createdBy: session.sub,
      },
    });
    if (Array.isArray(data.sections)) {
      for (let i = 0; i < data.sections.length; i++) {
        const s = data.sections[i];
        await tx.examSection.create({
          data: {
            examId: exam.id,
            name: s.name || `Section ${i + 1}`,
            position: i + 1,
            marksPerQuestion: Number(s.marksPerQuestion || 1),
            negativeMarks: Number(s.negativeMarks || 0),
            questionCount: Number(s.questionCount || 0),
          },
        });
      }
    }
    await tx.examQuestionSnapshot.createMany({
      data: questions.map((q, i) => ({
        examId: exam.id,
        sourceQuestionId: q.id,
        position: i + 1,
        marks: Number(q.marks || 1),
        negativeMarks: Number(q.negativeMarks || 0),
        sectionName: data.sectionMap?.[q.id] || null,
        snapshot: {
          questionText: q.questionText,
          questionTextMr: q.questionTextMr || null,
          difficulty: q.difficulty,
          marks: Number(q.marks || 1),
          negativeMarks: Number(q.negativeMarks || 0),
          explanation: q.explanation || null,
          options: q.options.map((o) => ({
            id: o.id,
            text: o.optionText,
            order: o.optionOrder,
            isCorrect: Boolean(o.isCorrect),
          })),
        },
      })),
    });

    await tx.examQuestion.createMany({
      data: questions.map((q, i) => ({
        examId: exam.id,
        questionId: q.id,
        questionOrder: i + 1,
        marks: Number(q.marks || 1),
        negativeMarks: Number(data.negativeMarks || q.negativeMarks || 0),
      })),
      skipDuplicates: true,
    });

    return exam;
  });

  if (createdExam.status === "SCHEDULED" || createdExam.status === "LIVE") {
    try {
      const { scheduleExamNotifications } = await import("@/lib/exam-scheduler-service");
      await scheduleExamNotifications(createdExam, { isReschedule: false });
    } catch (err) {
      console.warn("Scheduler notification warning:", err);
    }
  }

  return createdExam;
}
