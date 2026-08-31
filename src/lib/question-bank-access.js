import { prisma } from "@/lib/db";

export function canManageQuestionBank(session) {
  return !!session && ["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(session.role);
}

export async function getQuestionBankScope(session) {
  if (!canManageQuestionBank(session)) {
    throw new Error("FORBIDDEN");
  }

  if (session.role === "SUPER_ADMIN") {
    // Super Admin sees global questions plus every coaching question.
    return {
      mode: "SUPER_ADMIN_ALL",
      where: {},
    };
  }

  if (!session.organizationId) {
    throw new Error("ORGANIZATION_REQUIRED");
  }

  return {
    mode: "COACHING",
    where: {
      OR: [
        { organizationId: session.organizationId },
        { shareGrants: { some: { organizationId: session.organizationId } } },
      ],
    },
  };
}

export async function canUseQuestion(session, questionId) {
  const scope = await getQuestionBankScope(session);
  const q = await prisma.question.findFirst({
    where: { id: questionId, ...scope.where },
    select: { id: true, organizationId: true, visibilityMode: true },
  });
  return !!q;
}

export async function listQuestionsForExamBuilder(session, filters = {}) {
  const scope = await getQuestionBankScope(session);
  const where = { ...scope.where };

  if (filters.search) {
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { questionText: { contains: filters.search, mode: "insensitive" } },
          { questionTextMr: { contains: filters.search, mode: "insensitive" } },
        ],
      },
    ];
  }
  if (filters.difficulty) {
    where.difficulty = filters.difficulty;
  }

  return prisma.question.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: Math.min(Number(filters.limit || 100), 200),
    select: {
      id: true,
      questionText: true,
      questionTextMr: true,
      difficulty: true,
      marks: true,
      negativeMarks: true,
      visibilityMode: true,
      organizationId: true,
      createdAt: true,
    },
  });
}
