import { prisma } from "@/lib/db";

export async function getOrganizationForSession(session) {
  if (!session?.organizationId) {
    return null;
  }
  return prisma.organization.findUnique({
    where: { id: session.organizationId },
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        include: { plan: true },
        orderBy: { currentPeriodEnd: "desc" },
      },
    },
  });
}

export async function getActiveSubscription(organizationId) {
  return prisma.coachingSubscription.findFirst({
    where: {
      organizationId,
      status: "ACTIVE",
      OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: new Date() } }],
    },
    include: { plan: true },
    orderBy: { currentPeriodEnd: "desc" },
  });
}

export async function hasExamAccess({ userId, examId }) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true, organizationId: true, price: true, status: true },
  });
  if (!exam) {
    return { allowed: false, reason: "EXAM_NOT_FOUND" };
  }
  if (exam.status === "ARCHIVED" || exam.status === "DRAFT") {
    return { allowed: false, reason: "EXAM_NOT_AVAILABLE", exam };
  }

  // Free exams are accessible if otherwise assigned/published.
  if (Number(exam.price || 0) <= 0) {
    return { allowed: true, exam };
  }

  const [purchase, entitlement, payment] = await Promise.all([
    prisma.examPurchase.findUnique({
      where: { userId_examId: { userId, examId } },
    }),
    prisma.examEntitlement.findUnique({
      where: { studentId_examId: { studentId: userId, examId } },
    }),
    prisma.payment.findFirst({
      where: {
        OR: [{ studentId: userId }, { userId }],
        examId,
        status: { in: ["PAID", "SUCCESS", "VERIFIED", "CAPTURED"] },
      },
    }),
  ]);

  if (purchase?.status === "PAID" || entitlement?.status === "ACTIVE" || Boolean(payment)) {
    return { allowed: true, exam, purchase: purchase || payment };
  }

  return { allowed: false, reason: "PAYMENT_REQUIRED", exam };
}

export async function assertOrganizationLimit(organizationId, resource) {
  const subscription = await getActiveSubscription(organizationId);
  if (!subscription) {
    throw new Error("SUBSCRIPTION_REQUIRED");
  }

  const limit =
    subscription.plan?.[
      resource === "students" ? "maxStudents" : resource === "batches" ? "maxBatches" : "maxExams"
    ];

  if (!limit) {
    return { subscription, limit: null };
  }

  let count = 0;
  if (resource === "students") {
    count = await prisma.user.count({
      where: { organizationId, role: "STUDENT", status: { not: "SUSPENDED" } },
    });
  } else if (resource === "batches") {
    count = await prisma.batch.count({ where: { organizationId, status: { not: "ARCHIVED" } } });
  } else if (resource === "exams") {
    count = await prisma.exam.count({ where: { organizationId, status: { not: "ARCHIVED" } } });
  }

  if (count >= limit) {
    throw new Error(`LIMIT_${resource.toUpperCase()}_REACHED`);
  }
  return { subscription, limit, count };
}

export async function canManageOrganization(session) {
  return Boolean(
    session && ["COACHING_ADMIN", "SUPER_ADMIN"].includes(session.role) && session.organizationId,
  );
}
