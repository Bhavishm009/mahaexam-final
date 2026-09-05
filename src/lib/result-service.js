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

export async function getNotifications(userId, isSuperAdmin = false) {
  if (!userId) return [];
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Database failure and recovery alerts must ONLY be visible to SUPER_ADMIN
  if (!isSuperAdmin) {
    return notifications.filter((n) => {
      const titleLower = (n.title || "").toLowerCase();
      const msgLower = (n.message || "").toLowerCase();
      const isDbAlert =
        titleLower.includes("database") ||
        msgLower.includes("database") ||
        titleLower.includes("failover") ||
        msgLower.includes("failover") ||
        titleLower.includes("aiven") ||
        msgLower.includes("aiven") ||
        titleLower.includes("supabase") ||
        msgLower.includes("supabase") ||
        (n.data &&
          (n.data.event === "PRIMARY_DB_FAILOVER" || n.data.event === "PRIMARY_DB_RECOVERED"));
      return !isDbAlert;
    });
  }

  return notifications;
}

export async function markNotificationRead(id, userId) {
  return prisma.notification.updateMany({ where: { id, userId }, data: { readAt: new Date() } });
}
