import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
export async function GET() {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["COACHING_ADMIN"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({
    account: await prisma.coachingPayoutAccount.findUnique({
      where: { organizationId: s.organizationId },
    }),
  });
}
export async function POST(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "COACHING_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const b = await request.json();
  if (!b.accountName || !b.accountEmail || !b.contact) {
    return NextResponse.json({ error: "Name, email and contact are required" }, { status: 422 });
  }
  const account = await prisma.coachingPayoutAccount.upsert({
    where: { organizationId: s.organizationId },
    update: {
      accountName: b.accountName,
      accountEmail: b.accountEmail,
      status: "PENDING_KYC",
      kycStatus: "PENDING",
    },
    create: {
      organizationId: s.organizationId,
      accountName: b.accountName,
      accountEmail: b.accountEmail,
      status: "PENDING_KYC",
      kycStatus: "PENDING",
    },
  });
  return NextResponse.json({ account }, { status: 201 });
}
