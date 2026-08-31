import { prisma } from "@/lib/db";
import { evaluateAttempt } from "@/lib/evaluation-service";

export async function createResultForAttempt(attemptId) {
  return evaluateAttempt(attemptId);
}

export async function getStudentResults(studentId) {
  return prisma.examResult.findMany({
    where: { studentId },
    include: { exam: true, subjects: { include: { subject: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getResult(resultId, studentId) {
  return prisma.examResult.findFirst({
    where: { id: resultId, studentId },
    include: { exam: true, subjects: { include: { subject: true } }, attempt: true },
  });
}

export async function createNotification({ userId, type, title, message, data = null }) {
  return prisma.notification.create({ data: { userId, type, title, message, data } });
}

export async function getNotifications(userId) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function markNotificationRead(id, userId) {
  return prisma.notification.updateMany({ where: { id, userId }, data: { readAt: new Date() } });
}
