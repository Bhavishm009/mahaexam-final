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
      const coachingBatchAssignment = await prisma.batchExamAssignment.findFirst({
        where: {
          examId: exam.id,
          batch: {
            memberships: {
              some: {
                studentId: userId,
                status: "ACTIVE",
              },
            },
          },
        },
      });
      isAssigned = Boolean(coachingBatchAssignment);

      if (!isAssigned) {
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
  }

  if (!isGlobal && !isAssigned) {
    return { allowed: false, reason: "NOT_ASSIGNED" };
  }
  if (exam.status === "DRAFT" || exam.status === "ARCHIVED") {
    return { allowed: false, reason: "EXAM_NOT_AVAILABLE", exam };
  }
  const isPaid = !exam.isFree && Number(exam.price || 0) > 0;

  if (isPaid) {
    if (!userId) {
      return { allowed: false, reason: "LOGIN_REQUIRED", exam };
    }

    const [purchase, entitlement, payment] = await Promise.all([
      prisma.examPurchase.findUnique({
        where: { userId_examId: { userId, examId: exam.id } },
      }),
      prisma.examEntitlement.findUnique({
        where: { studentId_examId: { studentId: userId, examId: exam.id } },
      }),
      prisma.payment.findFirst({
        where: {
          OR: [{ studentId: userId }, { userId }],
          examId: exam.id,
          status: { in: ["PAID", "SUCCESS", "VERIFIED", "CAPTURED"] },
        },
      }),
    ]);

    if (purchase?.status === "PAID" || entitlement?.status === "ACTIVE" || Boolean(payment)) {
      // User paid! Unlimited retries, always open anytime, no attempt limit
      return { allowed: true, source: "PURCHASED", exam, purchase: purchase || payment };
    }

    if (isAssigned) {
      // Student is directly enrolled in coaching or assigned batch
      return { allowed: true, source: "ASSIGNED", exam };
    }

    return { allowed: false, reason: "PAYMENT_REQUIRED", exam };
  }

  if (exam.startAt && now < exam.startAt) {
    return { allowed: false, reason: "EXAM_NOT_STARTED", exam };
  }
  if (exam.endAt && now > exam.endAt) {
    return { allowed: false, reason: "EXAM_ENDED", exam };
  }

  // If the student already has an active IN_PROGRESS attempt, allow them to resume immediately
  const activeAttempt = await prisma.examAttempt.findFirst({
    where: {
      examId: exam.id,
      studentId: userId,
      status: "IN_PROGRESS",
    },
  });
  if (activeAttempt) {
    return { allowed: true, source: "RESUME", exam, attempt: activeAttempt };
  }

  const finishedAttempts = await prisma.examAttempt.count({
    where: {
      examId: exam.id,
      studentId: userId,
      status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] },
    },
  });
  if (!isFreeGlobal && exam.attemptLimit > 0 && finishedAttempts >= exam.attemptLimit) {
    return { allowed: false, reason: "ATTEMPT_LIMIT", exam };
  }

  if (isFreeGlobal) {
    return { allowed: true, source: "GLOBAL_FREE", exam };
  }
  if (isAssigned) {
    return { allowed: true, source: "ASSIGNED", exam };
  }
  return { allowed: false, reason: "NOT_ASSIGNED", exam };
}

export function isExamAnswerKeyReleased(exam) {
  if (!exam) return false;
  // If exam is paid, answers are self-paced and released immediately upon submission
  if (!exam.isFree && Number(exam.price || 0) > 0) return true;
  // If free global practice test without strict endAt, released immediately
  if (!exam.endAt && !exam.organizationId) return true;
  // If admin/teacher manually published results
  if (exam.frozenAt || exam.status === "RESULTS_PUBLISHED") return true;
  // If scheduled exam window has concluded
  if (exam.endAt && new Date() >= new Date(exam.endAt)) return true;
  return false;
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
      status: true,
      startAt: true,
      endAt: true,
      _count: {
        select: {
          questions: true,
        },
      },
    },
  });

  const map = new Map();
  for (const e of globalExams) {
    const qCount = e.totalQuestions || e._count?.questions || 100;
    map.set(e.id, {
      ...e,
      totalQuestions: qCount,
      source: e.isFree || e.visibilityMode === "FREE_GLOBAL" ? "FREE_GLOBAL" : "COACHING",
    });
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
          status: true,
          startAt: true,
          endAt: true,
          _count: {
            select: {
              questions: true,
            },
          },
        },
      }),
      prisma.exam.findMany({
        where: {
          OR: [
            {
              batches: {
                some: {
                  batch: {
                    students: {
                      some: { studentId: userId },
                    },
                  },
                },
              },
            },
            {
              batchAssignments: {
                some: {
                  batch: {
                    memberships: {
                      some: {
                        studentId: userId,
                        status: "ACTIVE",
                      },
                    },
                  },
                },
              },
            },
          ],
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
          status: true,
          startAt: true,
          endAt: true,
          _count: {
            select: {
              questions: true,
            },
          },
        },
      }),
    ]);

    for (const e of assignedDirect) {
      const qCount = e.totalQuestions || e._count?.questions || 100;
      const existing = map.get(e.id) || {};
      map.set(e.id, {
        ...existing,
        ...e,
        totalQuestions: qCount,
        source: "COACHING",
        isAssigned: true,
      });
    }
    for (const e of assignedBatches) {
      const qCount = e.totalQuestions || e._count?.questions || 100;
      const existing = map.get(e.id) || {};
      map.set(e.id, {
        ...existing,
        ...e,
        totalQuestions: qCount,
        source: "COACHING",
        isAssigned: true,
      });
    }

    const examSelect = {
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
      status: true,
      startAt: true,
      endAt: true,
      _count: {
        select: {
          questions: true,
        },
      },
    };

    const [purchasedList, entitlementList, paymentList] = await Promise.all([
      prisma.examPurchase.findMany({
        where: { userId, status: "PAID" },
        include: { exam: { select: examSelect } },
      }),
      prisma.examEntitlement.findMany({
        where: { studentId: userId, status: "ACTIVE" },
        include: { exam: { select: examSelect } },
      }),
      prisma.payment.findMany({
        where: {
          OR: [{ studentId: userId }, { userId }],
          status: { in: ["PAID", "SUCCESS", "VERIFIED", "CAPTURED"] },
          examId: { not: null },
        },
        include: { exam: { select: examSelect } },
      }),
    ]);

    for (const p of purchasedList) {
      if (p.exam && p.exam.status !== "ARCHIVED") {
        const e = p.exam;
        const existing = map.get(e.id) || {};
        const qCount = e.totalQuestions || e._count?.questions || existing.totalQuestions || 100;
        map.set(e.id, {
          ...existing,
          ...e,
          totalQuestions: qCount,
          source: "PURCHASED",
          isPurchased: true,
        });
      }
    }

    for (const ent of entitlementList) {
      if (ent.exam && ent.exam.status !== "ARCHIVED") {
        const e = ent.exam;
        const existing = map.get(e.id) || {};
        const qCount = e.totalQuestions || e._count?.questions || existing.totalQuestions || 100;
        map.set(e.id, {
          ...existing,
          ...e,
          totalQuestions: qCount,
          source: "PURCHASED",
          isPurchased: true,
        });
      }
    }

    for (const pymt of paymentList) {
      if (pymt.exam && pymt.exam.status !== "ARCHIVED") {
        const e = pymt.exam;
        const existing = map.get(e.id) || {};
        const qCount = e.totalQuestions || e._count?.questions || existing.totalQuestions || 100;
        map.set(e.id, {
          ...existing,
          ...e,
          totalQuestions: qCount,
          source: "PURCHASED",
          isPurchased: true,
        });
      }
    }
  }

  return [...map.values()];
}
