import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createRazorpayOrder } from "@/lib/razorpay";

export async function POST(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["COACHING_ADMIN", "SUPER_ADMIN"].includes(s.role)) {
    return NextResponse.json({ error: "Coaching admin login required" }, { status: 401 });
  }
  const orgId = s.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: "Organization not found" }, { status: 400 });
  }
  const { planId } = await request.json();
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan || !plan.active) {
    return NextResponse.json({ error: "Plan unavailable" }, { status: 404 });
  }
  const order = await createRazorpayOrder({
    amount: Number(plan.price),
    receipt: `sub_${orgId}_${planId}`,
    notes: { organizationId: orgId, planId },
  });
  const sub = await prisma.coachingSubscription.create({
    data: {
      organizationId: orgId,
      planId,
      status: "PENDING",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
    },
  });
  const payment = await prisma.payment.create({
    data: {
      organizationId: orgId,
      subscriptionId: sub.id,
      amount: Number(plan.price),
      razorpayOrderId: order.id,
      status: "PENDING",
      metadata: { planId },
    },
  });
  return NextResponse.json({
    subscription: sub,
    payment,
    order,
    keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_demo",
  });
}
