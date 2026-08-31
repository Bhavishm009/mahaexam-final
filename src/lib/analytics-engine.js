import { prisma } from "@/lib/db";

export async function rebuildExamAnalytics(examId) {
  const results = await prisma.examResult.findMany({
    where: { examId },
    orderBy: [{ obtainedMarks: "desc" }, { timeSpentSeconds: "asc" }, { evaluatedAt: "asc" }],
  });
  if (!results.length) {
    return { count: 0 };
  }
  const avg = results.reduce((a, r) => a + r.percentage, 0) / results.length;
  const passed = results.filter((r) => r.passed).length;
  await prisma.$transaction(async (tx) => {
    await tx.examLeaderboard.deleteMany({ where: { examId } });
    await tx.examLeaderboard.createMany({
      data: results.map((r, i) => ({
        examId,
        resultId: r.id,
        studentId: r.studentId,
        rank: i + 1,
        score: r.obtainedMarks,
        percentile: r.percentile,
      })),
    });
    const org = await tx.exam.findUnique({
      where: { id: examId },
      select: { organizationId: true },
    });
    if (org?.organizationId) {
      await tx.coachingExamAggregate.upsert({
        where: { organizationId_examId: { organizationId: org.organizationId, examId } },
        update: {
          attempts: results.length,
          completed: results.length,
          passed,
          averageScore: results.reduce((a, r) => a + r.obtainedMarks, 0) / results.length,
          averagePercent: avg,
          passPercentage: (passed / results.length) * 100,
        },
        create: {
          organizationId: org.organizationId,
          examId,
          attempts: results.length,
          completed: results.length,
          passed,
          averageScore: results.reduce((a, r) => a + r.obtainedMarks, 0) / results.length,
          averagePercent: avg,
          passPercentage: (passed / results.length) * 100,
        },
      });
    }
  });
  return {
    count: results.length,
    averagePercent: avg,
    passPercentage: (passed / results.length) * 100,
  };
}

export async function rebuildStudentPerformance(studentId) {
  const results = await prisma.examResult.findMany({
    where: { studentId },
    select: { percentage: true, accuracy: true },
  });
  const n = results.length;
  const averagePercent = n ? results.reduce((a, r) => a + r.percentage, 0) / n : 0;
  const averageAccuracy = n ? results.reduce((a, r) => a + r.accuracy, 0) / n : 0;
  const bestPercent = n ? Math.max(...results.map((r) => r.percentage)) : 0;
  return prisma.studentPerformanceSnapshot.upsert({
    where: { studentId },
    update: { examsCompleted: n, averagePercent, averageAccuracy, bestPercent },
    create: { studentId, examsCompleted: n, averagePercent, averageAccuracy, bestPercent },
  });
}

export async function getExamAnalytics(examId) {
  const [results, leaderboard] = await Promise.all([
    prisma.examResult.findMany({
      where: { examId },
      select: {
        percentage: true,
        obtainedMarks: true,
        passed: true,
        correct: true,
        wrong: true,
        unanswered: true,
        accuracy: true,
        timeSpentSeconds: true,
      },
    }),
    prisma.examLeaderboard.findMany({
      where: { examId },
      orderBy: { rank: "asc" },
      take: 100,
      include: { student: { select: { id: true, name: true, email: true } } },
    }),
  ]);
  const n = results.length;
  return {
    attempts: n,
    averageScore: n ? results.reduce((a, r) => a + r.obtainedMarks, 0) / n : 0,
    averagePercent: n ? results.reduce((a, r) => a + r.percentage, 0) / n : 0,
    passPercentage: n ? (results.filter((r) => r.passed).length / n) * 100 : 0,
    averageAccuracy: n ? results.reduce((a, r) => a + r.accuracy, 0) / n : 0,
    leaderboard,
  };
}
