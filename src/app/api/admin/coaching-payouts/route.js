import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
export async function GET() {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const [transfers, accounts] = await Promise.all([
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
  ]);
  const totals = transfers.reduce(
    (a, x) => {
      a.gross += x.grossAmount;
      a.platform += x.platformFee;
      a.coaching += x.coachingShare;
      return a;
    },
    { gross: 0, platform: 0, coaching: 0 },
  );
  return NextResponse.json({ transfers, accounts, totals });
}
