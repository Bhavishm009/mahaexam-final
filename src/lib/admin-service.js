import { prisma } from "@/lib/db";

export async function adminStats() {
  const [organizations, users, students, exams, results, purchases, payments] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.exam.count(),
    prisma.examResult.count(),
    prisma.examPurchase.count({ where: { status: "PAID" } }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
  ]);
  return {
    organizations,
    users,
    students,
    exams,
    results,
    paidPurchases: purchases,
    revenue: payments._sum.amount || 0,
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

  if (fallbackAdmin && fallbackAdmin.id !== userId) {
    // Re-assign all questions to super admin so question bank is 100% preserved
    await prisma.question.updateMany({
      where: { createdBy: userId },
      data: { createdBy: fallbackAdmin.id },
    });

    // Re-assign all exams to super admin
    await prisma.exam.updateMany({
      where: { createdBy: userId },
      data: { createdBy: fallbackAdmin.id },
    });
  }

  // Clean up user-specific student/teacher profiles and dependencies
  await prisma.studentProfile.deleteMany({ where: { userId } });
  await prisma.teacherProfile.deleteMany({ where: { userId } });
  await prisma.authSession.deleteMany({ where: { userId } });
  await prisma.batchMembership.deleteMany({ where: { userId } });
  await prisma.passkeyCredential.deleteMany({ where: { userId } });
  await prisma.pushSubscription.deleteMany({ where: { userId } });

  // Delete the user record
  return prisma.user.delete({ where: { id: userId } });
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

