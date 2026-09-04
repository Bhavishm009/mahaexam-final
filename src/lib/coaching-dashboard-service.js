import { prisma } from "@/lib/db";

export async function getCoachingDashboard(session) {
  const organizationId = session.organizationId;
  if (!organizationId) {
    throw new Error("ORGANIZATION_REQUIRED");
  }
  const [
    students,
    batches,
    questions,
    upcomingExams,
    liveExams,
    completedExams,
    revenue,
    results,
    recentPayments,
  ] = await Promise.all([
    prisma.user.count({ where: { organizationId, role: "STUDENT", status: { not: "SUSPENDED" } } }),
    prisma.batch.count({ where: { organizationId, status: { not: "ARCHIVED" } } }),
    prisma.question.count({ where: { organizationId } }),
    prisma.exam.count({
      where: {
        organizationId,
        status: { in: ["SCHEDULED", "LIVE"] },
        startAt: { gt: new Date() },
      },
    }),
    prisma.exam.count({
      where: {
        organizationId,
        status: "LIVE",
        startAt: { lte: new Date() },
        OR: [{ endAt: null }, { endAt: { gte: new Date() } }],
      },
    }),
    prisma.exam.count({ where: { organizationId, status: "COMPLETED" } }),
    prisma.paymentOrder.aggregate({
      where: { organizationId, status: "CAPTURED" },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.examResultSummary.aggregate({
      where: { exam: { organizationId } },
      _avg: { percentage: true },
    }),
    prisma.paymentOrder.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { name: true, email: true } }, exam: { select: { title: true } } },
    }),
  ]);
  const recentExams = await prisma.exam.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { id, title, status, startAt, endAt, totalQuestions, durationMinutes },
  });
  return {
    counts: { students, batches, questions, upcomingExams, liveExams, completedExams },
    revenue: { amount: Number(revenue._sum.amount || 0), payments: revenue._count._all || 0 },
    averagePercentage: Math.round(Number(results._avg.percentage || 0) * 100) / 100,
    recentExams,
    recentPayments,
  };
}
