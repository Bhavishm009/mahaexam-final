import { prisma } from "@/lib/db";

export async function getStudentExamAccess(userId, examIdOrSlug) {
  const exam = await prisma.exam.findFirst({
    where: {
      OR: [{ id: examIdOrSlug }, { slug: examIdOrSlug }],
    },
    select: {
      id: true,
      slug: true,
      title: true,
      organizationId: true,
      visibilityMode: true,
      isFree: true,
      price: true,
      status: true,
      startAt: true,
      endAt: true,
      attemptLimit: true,
      negativeMarks: true,
    },
  });
  if (!exam) {
    return { allowed: false, reason: "EXAM_NOT_FOUND" };
  }

  const now = new Date();
  const isGlobal =
    exam.visibilityMode === "GLOBAL" ||
    exam.visibilityMode === "FREE_GLOBAL" ||
    (!exam.organizationId && exam.isFree);
  const isFreeGlobal =
    exam.visibilityMode === "FREE_GLOBAL" || (!exam.organizationId && exam.isFree);

  // Check direct student assignment
  let isAssigned = false;
  if (userId) {
    const directAssignment = await prisma.examStudent.findUnique({
      where: { examId_studentId: { examId: exam.id, studentId: userId } },
    });
    isAssigned = Boolean(directAssignment);

    // Check batch assignment for coaching exams
    if (!isAssigned && exam.organizationId) {
      const batchAssignment = await prisma.examBatch.findFirst({
        where: {
          examId: exam.id,
          batch: {
            students: {
              some: { studentId: userId },
            },
          },
        },
      });
      isAssigned = Boolean(batchAssignment);
    }
  }

  if (!isGlobal && !isAssigned) {
    return { allowed: false, reason: "NOT_ASSIGNED" };
  }
  if (exam.status === "DRAFT" || exam.status === "ARCHIVED") {
    return { allowed: false, reason: "EXAM_NOT_AVAILABLE" };
  }
  if (exam.startAt && now < exam.startAt) {
    return { allowed: false, reason: "EXAM_NOT_STARTED", exam };
  }
  if (exam.endAt && now > exam.endAt) {
    return { allowed: false, reason: "EXAM_ENDED", exam };
  }

  const attempts = await prisma.examAttempt.count({
    where: {
      examId: exam.id,
      studentId: userId,
      status: { in: ["IN_PROGRESS", "SUBMITTED", "AUTO_SUBMITTED"] },
    },
  });
  if (!isFreeGlobal && exam.attemptLimit > 0 && attempts >= exam.attemptLimit) {
    return { allowed: false, reason: "ATTEMPT_LIMIT", exam };
  }

  if (isFreeGlobal) {
    return { allowed: true, source: "GLOBAL_FREE", exam };
  }
  if (isAssigned) {
    return { allowed: true, source: "ASSIGNED", exam };
  }
  return { allowed: false, reason: "PAYMENT_REQUIRED", exam };
}

export const getStudentExamStatus = getStudentExamAccess;

export async function createAssignmentNotifications(examId) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      students: { select: { studentId: true } },
      batches: {
        include: {
          batch: {
            include: {
              students: { select: { studentId: true } },
            },
          },
        },
      },
    },
  });
  if (!exam) {
    return 0;
  }

  const studentIds = new Set();
  for (const s of exam.students) {
    studentIds.add(s.studentId);
  }
  for (const eb of exam.batches) {
    for (const bs of eb.batch.students) {
      studentIds.add(bs.studentId);
    }
  }

  const ids = [...studentIds];
  if (!ids.length) {
    return 0;
  }

  await prisma.notification.createMany({
    data: ids.map((studentId) => ({
      studentId,
      examId: exam.id,
      type: "EXAM",
      title: "New Examination Assigned",
      message: `You have been assigned to examination: ${exam.title}`,
    })),
  });

  return ids.length;
}

export async function listStudentAvailableExams(userId = null) {
  const globalExams = await prisma.exam.findMany({
    where: {
      status: { in: ["SCHEDULED", "LIVE"] },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      examType: true,
      language: true,
      durationMinutes: true,
      totalQuestions: true,
      totalMarks: true,
      price: true,
      isFree: true,
      visibilityMode: true,
      startAt: true,
      endAt: true,
    },
  });

  const map = new Map();
  for (const e of globalExams) {
    map.set(e.id, { ...e, source: e.isFree || e.visibilityMode === "FREE_GLOBAL" ? "FREE_GLOBAL" : "COACHING" });
  }

  if (userId) {
    const [assignedDirect, assignedBatches] = await Promise.all([
      prisma.exam.findMany({
        where: {
          students: { some: { studentId: userId } },
          status: { in: ["SCHEDULED", "LIVE"] },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          examType: true,
          language: true,
          durationMinutes: true,
          totalQuestions: true,
          totalMarks: true,
          price: true,
          isFree: true,
          visibilityMode: true,
          startAt: true,
          endAt: true,
        },
      }),
      prisma.exam.findMany({
        where: {
          batches: {
            some: {
              batch: {
                students: {
                  some: { studentId: userId },
                },
              },
            },
          },
          status: { in: ["SCHEDULED", "LIVE"] },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          examType: true,
          language: true,
          durationMinutes: true,
          totalQuestions: true,
          totalMarks: true,
          price: true,
          isFree: true,
          visibilityMode: true,
          startAt: true,
          endAt: true,
        },
      }),
    ]);

    for (const e of assignedDirect) {
      map.set(e.id, { ...e, source: "COACHING" });
    }
    for (const e of assignedBatches) {
      map.set(e.id, { ...e, source: "COACHING" });
    }
  }

  return [...map.values()];
}
