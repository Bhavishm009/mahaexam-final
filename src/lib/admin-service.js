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
      subscriptions: { include: { plan: true }, orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { users: true, exams: true, batches: true } },
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
