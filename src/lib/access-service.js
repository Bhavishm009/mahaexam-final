import { prisma } from "@/lib/db";
import { ensureCoachingEntitlement } from "@/lib/coaching-access";

export async function getExamAccess(studentId, examId) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: {
      id: true,
      status: true,
      isFree: true,
      price: true,
      organizationId: true,
      visibilityMode: true,
      startAt: true,
      endAt: true,
    },
  });
  if (!exam) {
    throw new Error("EXAM_NOT_FOUND");
  }
  const now = new Date();
  if (exam.endAt && now > exam.endAt) {
    return { allowed: false, reason: "EXAM_ENDED", exam };
  }
  if (exam.visibilityMode === "FREE_GLOBAL" || exam.isFree) {
    return { allowed: true, source: "FREE_GLOBAL", exam };
  }
  const entitlement = await prisma.examEntitlement.findFirst({
    where: {
      studentId,
      examId,
      status: "ACTIVE",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
  });
  if (entitlement) {
    return { allowed: true, source: entitlement.source, entitlement, exam };
  }
  const batchEntitlement = await ensureCoachingEntitlement(studentId, examId);
  if (batchEntitlement) {
    return { allowed: true, source: "COACHING", entitlement: batchEntitlement, exam };
  }
  if (exam.organizationId) {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { organizationId: true },
    });
    if (student?.organizationId === exam.organizationId) {
      const e = await prisma.examEntitlement.upsert({
        where: { studentId_examId: { studentId, examId } },
        update: { status: "ACTIVE", source: "COACHING" },
        create: {
          studentId,
          examId,
          status: "ACTIVE",
          source: "COACHING",
          organizationId: exam.organizationId,
        },
      });
      return { allowed: true, source: "COACHING", entitlement: e, exam };
    }
  }
  return { allowed: false, reason: "PAYMENT_REQUIRED", exam };
}
