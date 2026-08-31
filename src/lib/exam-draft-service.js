import { prisma } from "@/lib/db";

const baseInclude = {
  questions: {
    include: {
      question: { include: { options: true, subject: true, chapter: true, topic: true } },
    },
    orderBy: { order: "asc" },
  },
  batches: { include: { batch: true } },
  students: { include: { student: { select: { id: true, name: true, email: true } } } },
};

export async function createDraft(session) {
  return prisma.examDraft.create({
    data: {
      organizationId: session.organizationId || null,
      createdById: session.sub,
      title: "Untitled Examination",
      durationMinutes: 60,
    },
    include: baseInclude,
  });
}

export async function getDraft(id, session) {
  const draft = await prisma.examDraft.findUnique({ where: { id }, include: baseInclude });
  if (!draft) {
    throw new Error("DRAFT_NOT_FOUND");
  }
  if (session.role !== "SUPER_ADMIN" && draft.organizationId !== session.organizationId) {
    throw new Error("FORBIDDEN");
  }
  return draft;
}

export async function updateDraft(id, session, data) {
  const draft = await getDraft(id, session);
  const updated = await prisma.examDraft.update({
    where: { id: draft.id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.examType !== undefined ? { examType: data.examType } : {}),
      ...(data.language !== undefined ? { language: data.language } : {}),
      ...(data.durationMinutes !== undefined
        ? { durationMinutes: Number(data.durationMinutes) }
        : {}),
      ...(data.passingScore !== undefined
        ? { passingScore: data.passingScore === null ? null : Number(data.passingScore) }
        : {}),
      ...(data.negativeMarking !== undefined
        ? { negativeMarking: Boolean(data.negativeMarking) }
        : {}),
      ...(data.defaultNegativeMarks !== undefined
        ? { defaultNegativeMarks: Number(data.defaultNegativeMarks) }
        : {}),
      ...(data.fullscreenRequired !== undefined
        ? { fullscreenRequired: Boolean(data.fullscreenRequired) }
        : {}),
      ...(data.randomizeQuestions !== undefined
        ? { randomizeQuestions: Boolean(data.randomizeQuestions) }
        : {}),
      ...(data.randomizeOptions !== undefined
        ? { randomizeOptions: Boolean(data.randomizeOptions) }
        : {}),
      ...(data.instructions !== undefined ? { instructions: data.instructions } : {}),
      ...(data.settings !== undefined ? { settings: data.settings } : {}),
      ...(data.step !== undefined ? { step: Number(data.step) } : {}),
    },
    include: baseInclude,
  });
  return updated;
}

export async function addDraftQuestions(id, session, items) {
  const draft = await getDraft(id, session);
  const existing = await prisma.examDraftQuestion.count({ where: { draftId: draft.id } });
  const start = existing + 1;

  await prisma.$transaction(
    items.map((item, index) =>
      prisma.examDraftQuestion.upsert({
        where: { draftId_questionId: { draftId: draft.id, questionId: item.questionId } },
        update: {
          order: Number(item.order || start + index),
          marks: Number(item.marks ?? 1),
          negativeMarks: Number(item.negativeMarks ?? draft.defaultNegativeMarks),
          source: item.source || "MANUAL",
        },
        create: {
          draftId: draft.id,
          questionId: item.questionId,
          order: Number(item.order || start + index),
          marks: Number(item.marks ?? 1),
          negativeMarks: Number(item.negativeMarks ?? draft.defaultNegativeMarks),
          source: item.source || "MANUAL",
        },
      }),
    ),
  );

  return getDraft(id, session);
}

export async function removeDraftQuestion(id, session, questionId) {
  const draft = await getDraft(id, session);
  await prisma.examDraftQuestion.deleteMany({ where: { draftId: draft.id, questionId } });
  return getDraft(id, session);
}

export async function assignDraft(id, session, { batchIds = [], studentIds = [] }) {
  const draft = await getDraft(id, session);
  await prisma.$transaction([
    prisma.examDraftBatch.deleteMany({ where: { draftId: draft.id } }),
    prisma.examDraftStudent.deleteMany({ where: { draftId: draft.id } }),
    ...(batchIds.length
      ? [
          prisma.examDraftBatch.createMany({
            data: batchIds.map((batchId) => ({ draftId: draft.id, batchId })),
            skipDuplicates: true,
          }),
        ]
      : []),
    ...(studentIds.length
      ? [
          prisma.examDraftStudent.createMany({
            data: studentIds.map((studentId) => ({ draftId: draft.id, studentId })),
            skipDuplicates: true,
          }),
        ]
      : []),
  ]);
  return getDraft(id, session);
}

export async function validateDraft(id, session) {
  const draft = await getDraft(id, session);
  const errors = [];
  if (!draft.title.trim() || draft.title === "Untitled Examination") {
    errors.push("Exam title is required.");
  }
  if (draft.durationMinutes < 1) {
    errors.push("Duration must be at least 1 minute.");
  }
  if (draft.questions.length === 0) {
    errors.push("At least one question is required.");
  }
  if (draft.batches.length === 0 && draft.students.length === 0) {
    errors.push("Assign at least one batch or student.");
  }
  const totalMarks = draft.questions.reduce((s, q) => s + q.marks, 0);
  if (totalMarks <= 0) {
    errors.push("Total marks must be greater than zero.");
  }
  return { valid: errors.length === 0, errors, totalMarks, totalQuestions: draft.questions.length };
}
