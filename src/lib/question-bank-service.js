import { prisma } from "@/lib/db";

export async function listQuestionBank({
  organizationId,
  subjectId,
  chapterId,
  topicId,
  difficulty,
  search,
  take = 50,
}) {
  const where = {
    ...(organizationId ? { OR: [{ organizationId }, { organizationId: null }] } : {}),
    ...(difficulty ? { difficulty } : {}),
    ...(subjectId ? { question: { subjectId } } : {}),
    ...(chapterId ? { question: { chapterId } } : {}),
    ...(topicId ? { question: { topicId } } : {}),
    ...(search ? { question: { questionText: { contains: search, mode: "insensitive" } } } : {}),
  };
  return prisma.questionBankQuestion.findMany({
    where,
    include: {
      question: { include: { options: true, subject: true, chapter: true, topic: true } },
      organization: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(Number(take) || 50, 200),
  });
}

export async function createQuestion({ session, data }) {
  const question = await prisma.question.create({
    data: {
      questionText: data.questionText,
      questionTextMr: data.questionTextMr || null,
      subjectId: data.subjectId,
      chapterId: data.chapterId || null,
      topicId: data.topicId || null,
      organizationId: session.organizationId || null,
      createdBy: session.sub,
      createdById: session.sub,
      status: "PUBLISHED",
      difficulty: data.difficulty || "MEDIUM",
      marks: Number(data.marks || 1),
      negativeMarks: Number(data.negativeMarks || 0),
      explanation: data.explanation || null,
      explanationMr: data.explanationMr || null,
      options: {
        create: data.options.map((o, i) => ({
          optionText: o.optionText,
          optionTextMr: o.optionTextMr || null,
          optionOrder: i + 1,
          isCorrect: Boolean(o.isCorrect),
        })),
      },
    },
    include: { options: true },
  });

  await prisma.questionBankQuestion.create({
    data: {
      questionId: question.id,
      organizationId: session.organizationId || null,
      source: session.organizationId ? "COACHING" : "PLATFORM",
      difficulty: data.difficulty || "MEDIUM",
      explanation: data.explanation || null,
      explanationMr: data.explanationMr || null,
      isApproved: session.role === "SUPER_ADMIN",
      createdById: session.sub,
    },
  });

  return question;
}

export async function getQuestion(questionId) {
  return prisma.question.findUnique({
    where: { id: questionId },
    include: {
      options: { orderBy: { optionOrder: "asc" } },
      subject: true,
      chapter: true,
      topic: true,
      bankQuestion: true,
    },
  });
}

export async function createChapter(data) {
  return prisma.chapter.create({ data });
}

export async function createTopic(data) {
  return prisma.topic.create({ data });
}

export async function selectQuestionsForPaper({
  organizationId,
  subjectId,
  chapterId,
  topicId,
  difficulty,
  count,
}) {
  const questions = await listQuestionBank({
    organizationId,
    subjectId,
    chapterId,
    topicId,
    difficulty,
    take: 200,
  });
  return questions
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.max(0, Number(count) || 0))
    .map((x) => x.question);
}
