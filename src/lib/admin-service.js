import { prisma } from "@/lib/db";

export async function adminStats() {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const [
    organizations,
    users,
    students,
    exams,
    results,
    purchases,
    payments,
    activeExamAttempts,
    recentLogins,
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.exam.count(),
    prisma.examResult.count(),
    prisma.examPurchase.count({ where: { status: "PAID" } }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    // Live exam takers: Only count active attempts where student had heartbeat/activity in the last 10 minutes
    prisma.examAttempt
      .count({
        where: {
          status: "IN_PROGRESS",
          lastActivityAt: { gte: tenMinutesAgo },
        },
      })
      .catch(() => 0),
    // Currently online: Count real users with last login within the last 15 minutes
    prisma.user
      .count({
        where: {
          lastLoginAt: { gte: fifteenMinutesAgo },
        },
      })
      .catch(() => 0),
  ]);

  // Online count is strictly the real active users from DB, bounded between 0 and total users
  const onlineCount = Math.min(users, Math.max(0, recentLogins));

  return {
    organizations,
    users,
    students,
    exams,
    results,
    paidPurchases: purchases,
    revenue: payments._sum.amount || 0,
    activeExamAttempts,
    onlineUsers: onlineCount,
  };
}

export async function listOrganizations() {
  return prisma.organization.findMany({
    include: {
      _count: { select: { users: true, exams: true, batches: true } },
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function listUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      organizationId: true,
      createdAt: true,
      organization: { select: { name: true } },
      studentProfile: { select: { profilePhoto: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
}

export async function listPayments() {
  return prisma.payment.findMany({
    include: {
      organization: { select: { name: true } },
      user: { select: { name: true, email: true } },
      subscription: { include: { plan: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
}

export async function listPlans() {
  return prisma.subscriptionPlan.findMany({ orderBy: { price: "asc" } });
}

export async function updateUserStatus(id, status) {
  return prisma.user.update({ where: { id }, data: { status } });
}

export async function updatePlan(id, data) {
  return prisma.subscriptionPlan.update({ where: { id }, data });
}

export async function deleteUserSafely(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.email === "bhavishm009@gmail.com") {
    throw new Error("Primary Super Admin account cannot be deleted");
  }

  // Find fallback super admin to re-assign questions and exams
  const fallbackAdmin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
    select: { id: true },
  });

  return await prisma.$transaction(async (tx) => {
    if (fallbackAdmin && fallbackAdmin.id !== userId) {
      // Re-assign all questions to super admin so question bank is 100% preserved
      await tx.question.updateMany({
        where: { createdBy: userId },
        data: { createdBy: fallbackAdmin.id },
      });

      // Re-assign all exams to super admin
      await tx.exam.updateMany({
        where: { createdBy: userId },
        data: { createdBy: fallbackAdmin.id },
      });

      // Re-assign audit logs and created imports
      await tx.coachingAuditLog.updateMany({
        where: { actorId: userId },
        data: { actorId: fallbackAdmin.id },
      });
      await tx.examPublishAudit.updateMany({
        where: { actorId: userId },
        data: { actorId: fallbackAdmin.id },
      });
      await tx.questionImportBatch.updateMany({
        where: { createdById: userId },
        data: { createdById: fallbackAdmin.id },
      });
    }

    // 1. Find all exam attempts belonging to this user
    const attempts = await tx.examAttempt.findMany({
      where: { studentId: userId },
      select: { id: true },
    });
    const attemptIds = attempts.map((a) => a.id);

    if (attemptIds.length > 0) {
      // Delete answers, events and violations
      await tx.examAttemptAnswer.deleteMany({ where: { attemptId: { in: attemptIds } } });
      await tx.attemptAnswer.deleteMany({ where: { attemptId: { in: attemptIds } } });
      await tx.attemptQuestion.deleteMany({ where: { attemptId: { in: attemptIds } } });
      await tx.examAttemptEvent.deleteMany({ where: { attemptId: { in: attemptIds } } });
      await tx.examViolation.deleteMany({ where: { attemptId: { in: attemptIds } } });

      // Delete results and subject breakdowns
      const results = await tx.result.findMany({
        where: { attemptId: { in: attemptIds } },
        select: { id: true },
      });
      if (results.length > 0) {
        await tx.resultSubject.deleteMany({
          where: { resultId: { in: results.map((r) => r.id) } },
        });
        await tx.result.deleteMany({ where: { id: { in: results.map((r) => r.id) } } });
      }

      const examResults = await tx.examResult.findMany({
        where: { attemptId: { in: attemptIds } },
        select: { id: true },
      });
      if (examResults.length > 0) {
        await tx.subjectResult.deleteMany({
          where: { resultId: { in: examResults.map((r) => r.id) } },
        });
        await tx.examResult.deleteMany({ where: { id: { in: examResults.map((r) => r.id) } } });
      }

      // Delete result summaries and chapter breakdowns
      const summaries = await tx.examResultSummary.findMany({
        where: { OR: [{ studentId: userId }, { attemptId: { in: attemptIds } }] },
        select: { id: true },
      });
      if (summaries.length > 0) {
        const summaryIds = summaries.map((s) => s.id);
        await tx.examResultSubject.deleteMany({ where: { resultId: { in: summaryIds } } });
        await tx.examResultChapter.deleteMany({ where: { resultId: { in: summaryIds } } });
        await tx.examResultSummary.deleteMany({ where: { id: { in: summaryIds } } });
      }

      // Delete exam attempts
      await tx.examAttempt.deleteMany({ where: { id: { in: attemptIds } } });
    }

    // 2. Clean up any remaining student performance snapshot, leaderboard, or entitlement
    await tx.examLeaderboard.deleteMany({ where: { studentId: userId } });
    await tx.studentPerformanceSnapshot.deleteMany({ where: { studentId: userId } });
    await tx.examEntitlement.deleteMany({ where: { studentId: userId } });

    // 3. Clean up payments & purchases
    const paymentOrders = await tx.paymentOrder.findMany({
      where: { userId },
      select: { id: true },
    });
    if (paymentOrders.length > 0) {
      await tx.paymentEvent.deleteMany({
        where: { paymentOrderId: { in: paymentOrders.map((p) => p.id) } },
      });
      await tx.paymentOrder.deleteMany({ where: { id: { in: paymentOrders.map((p) => p.id) } } });
    }

    await tx.examPurchase.deleteMany({ where: { userId } });
    await tx.purchase.deleteMany({ where: { userId } });
    await tx.payment.deleteMany({ where: { OR: [{ userId }, { studentId: userId }] } });

    // 4. Clean up notifications
    await tx.notification.deleteMany({ where: { OR: [{ userId }, { studentId: userId }] } });
    await tx.studentNotification.deleteMany({ where: { userId } });
    await tx.examNotification.deleteMany({ where: { userId } });

    // 5. Clean up exam assignments & draft associations
    await tx.examStudent.deleteMany({ where: { studentId: userId } });
    await tx.examDraftStudent.deleteMany({ where: { studentId: userId } });

    // 6. Clean up profile, auth & memberships
    await tx.batchStudent.deleteMany({ where: { student: { userId } } });
    await tx.studentProfile.deleteMany({ where: { userId } });
    await tx.teacherProfile.deleteMany({ where: { userId } });
    await tx.authSession.deleteMany({ where: { userId } });
    await tx.batchMembership.deleteMany({ where: { studentId: userId } });
    await tx.passkeyCredential.deleteMany({ where: { userId } });
    await tx.pushSubscription.deleteMany({ where: { userId } });
    await tx.emailDelivery.deleteMany({ where: { userId } });
    await tx.auditLog.deleteMany({ where: { userId } });

    // 7. Finally delete the user record
    return await tx.user.delete({ where: { id: userId } });
  });
}

export async function deleteOrganizationSafely(orgId) {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { id: true, name: true },
  });

  if (!org) {
    throw new Error("Organization not found");
  }

  const fallbackAdmin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
    select: { id: true },
  });

  // Preserve all questions in Question Bank by making them global (organizationId = null)
  await prisma.question.updateMany({
    where: { organizationId: orgId },
    data: {
      organizationId: null,
      visibilityMode: "FREE_GLOBAL",
      ...(fallbackAdmin ? { createdBy: fallbackAdmin.id } : {}),
    },
  });

  // Preserve all exams
  await prisma.exam.updateMany({
    where: { organizationId: orgId },
    data: {
      organizationId: null,
      visibilityMode: "FREE_GLOBAL",
      ...(fallbackAdmin ? { createdBy: fallbackAdmin.id } : {}),
    },
  });

  // Unlink users from this organization rather than deleting them unexpectedly
  await prisma.user.updateMany({
    where: { organizationId: orgId },
    data: { organizationId: null },
  });

  // Delete organization record
  return prisma.organization.delete({ where: { id: orgId } });
}
