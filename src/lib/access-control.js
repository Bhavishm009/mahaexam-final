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

  // Free exams are accessible if otherwise assigned/published.
  if (Number(exam.price || 0) <= 0) {
    return { allowed: true, exam };
  }

  const purchase = await prisma.examPurchase.findUnique({
    where: { userId_examId: { userId, examId } },
  });
  if (purchase?.status === "PAID") {
    return { allowed: true, exam, purchase };
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
