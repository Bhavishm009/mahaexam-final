import { prisma } from "@/lib/db";

export async function notifyStudentsForExam(examId, type, title, message) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true, organizationId: true, visibilityMode: true, isFree: true },
  });
  if (!exam) {
    return 0;
  }
  const where =
    exam.visibilityMode === "FREE_GLOBAL" || exam.isFree
      ? { role: "STUDENT", status: "ACTIVE" }
      : { role: "STUDENT", status: "ACTIVE", organizationId: exam.organizationId };
  const students = await prisma.user.findMany({ where, select: { id: true } });
  if (!students.length) {
    return 0;
  }
  await prisma.notification.createMany({
    data: students.map((s) => ({ studentId: s.id, type, title, message, examId })),
  });
  return students.length;
}
