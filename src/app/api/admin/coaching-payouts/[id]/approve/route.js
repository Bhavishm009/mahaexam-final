import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
export async function POST(request, { params }) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const a = await prisma.coachingPayoutAccount.findUnique({ where: { organizationId: params.id } });
  if (!a) {
    return NextResponse.json({ error: "Payout account not found" }, { status: 404 });
  }
  const updated = await prisma.coachingPayoutAccount.update({
    where: { organizationId: params.id },
    data: { status: "ACTIVE", kycStatus: "VERIFIED", approvedAt: new Date() },
  });
  return NextResponse.json({ account: updated });
}
