import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
export async function GET() {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const successfulStatuses = ["PAID", "VERIFIED", "CAPTURED", "SUCCESS"];

  const [transfers, accounts, payments] = await Promise.all([
    prisma.marketplaceTransfer.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        organization: { select: { id: true, name: true } },
        payment: { select: { orderId: true, amountPaise: true, createdAt: true } },
      },
    }),
    prisma.coachingPayoutAccount.findMany({
      include: { organization: { select: { id: true, name: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.payment.findMany({
      where: { status: { in: successfulStatuses } },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        exam: { select: { id: true, title: true, price: true } },
        organization: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);

  const coachingTotal = transfers.reduce((sum, t) => sum + Number(t.coachingShare || 0), 0);
  const grossTotal = payments.reduce((sum, p) => {
    const amt = Number(p.amount > 0 ? p.amount : p.amountPaise ? p.amountPaise / 100 : 0);
    return sum + amt;
  }, 0);
  const platformTotal = Math.max(0, grossTotal - coachingTotal);

  const totals = {
    gross: grossTotal,
    platform: platformTotal,
    coaching: coachingTotal,
    paidCount: payments.length,
  };

  return NextResponse.json({ transfers, accounts, totals, payments });
}
