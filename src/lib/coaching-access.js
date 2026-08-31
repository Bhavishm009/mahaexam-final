import { prisma } from "@/lib/db";

export async function studentHasBatchExamAccess(studentId, examId) {
  const now = new Date();
  const assignment = await prisma.batchExamAssignment.findFirst({
    where: {
      examId,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    },
    include: { batch: { include: { memberships: { where: { studentId, status: "ACTIVE" } } } } },
  });
  return !!assignment?.batch.memberships.length;
}

export async function ensureCoachingEntitlement(studentId, examId) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { organizationId: true },
  });
  if (!exam?.organizationId) {
    return null;
  }
  if (!(await studentHasBatchExamAccess(studentId, examId))) {
    return null;
  }
  return prisma.examEntitlement.upsert({
    where: { studentId_examId: { studentId, examId } },
    update: { status: "ACTIVE", source: "COACHING", organizationId: exam.organizationId },
    create: {
      studentId,
      examId,
      status: "ACTIVE",
      source: "COACHING",
      organizationId: exam.organizationId,
    },
  });
}
