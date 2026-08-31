import { prisma } from "@/lib/db";

export async function enqueueJob(type, payload, runAt = new Date()) {
  return prisma.job.create({ data: { type, payload, runAt } });
}

export async function enqueueExamReminder({ userId, examId, title, runAt }) {
  return enqueueJob("EXAM_REMINDER", { userId, examId, title }, runAt);
}

export async function processPendingJobs(limit = 25) {
  const jobs = await prisma.job.findMany({
    where: { status: "PENDING", runAt: { lte: new Date() } },
    orderBy: { runAt: "asc" },
    take: limit,
  });

  const results = [];
  for (const job of jobs) {
    try {
      const claimed = await prisma.job.updateMany({
        where: { id: job.id, status: "PENDING" },
        data: { status: "PROCESSING", lockedAt: new Date(), attempts: { increment: 1 } },
      });
      if (!claimed.count) {
        continue;
      }

      if (job.type === "EXAM_REMINDER") {
        await prisma.notification.create({
          data: {
            userId: job.payload.userId,
            type: "EXAM_REMINDER",
            title: "Exam reminder",
            message: `${job.payload.title} is scheduled soon.`,
            data: { examId: job.payload.examId },
          },
        });
      }

      await prisma.job.update({
        where: { id: job.id },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
      results.push({ id: job.id, status: "COMPLETED" });
    } catch (error) {
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "FAILED", lastError: error.message },
      });
      results.push({ id: job.id, status: "FAILED", error: error.message });
    }
  }
  return results;
}
