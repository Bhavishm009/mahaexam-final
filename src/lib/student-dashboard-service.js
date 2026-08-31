import { prisma } from "@/lib/db";
import { listStudentAvailableExams } from "@/lib/exam-access-service";

export async function getStudentDashboard(userId) {
  const now = new Date();
  const [user, allAvailableExams, rawResults, purchases, notifications, attempts] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          organizationId: true,
          createdAt: true,
        },
      }),
      listStudentAvailableExams(userId),
      prisma.examAttempt.findMany({
        where: {
          studentId: userId,
          status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] },
        },
        include: {
          exam: { select: { id: true, title: true } },
          result: true,
          examResult: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
      prisma.examPurchase.findMany({
        where: { userId },
        include: { exam: { select: { id: true, title: true } } },
        orderBy: { purchasedAt: "desc" },
        take: 10,
      }),
      prisma.studentNotification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.examAttempt.count({ where: { studentId: userId } }),
    ]);

  const upcoming = allAvailableExams.filter((e) => e.startAt && new Date(e.startAt) > now);
  const live = allAvailableExams.filter((e) => !e.startAt || new Date(e.startAt) <= now);

  const formattedResults = rawResults.map((att) => {
    const res = att.result || att.examResult || {};
    return {
      id: att.id,
      examId: att.examId,
      exam: att.exam,
      score: att.score ?? res.obtainedMarks ?? 0,
      percentage: att.percentage ?? res.percentage ?? 0,
      correct: res.correctCount ?? res.correct ?? 0,
      wrong: res.wrongCount ?? res.wrong ?? 0,
      unanswered: res.unansweredCount ?? res.unanswered ?? 0,
      passed: (att.percentage ?? res.percentage ?? 0) >= 40,
      evaluatedAt: att.submittedAt || att.updatedAt,
    };
  });

  const avg = formattedResults.length
    ? Math.round(
        (formattedResults.reduce((a, r) => a + Number(r.percentage || 0), 0) /
          formattedResults.length) *
          100,
      ) / 100
    : 0;

  return {
    user,
    upcoming,
    live,
    results: formattedResults,
    purchases,
    notifications,
    attempts,
    averagePercentage: avg,
  };
}
