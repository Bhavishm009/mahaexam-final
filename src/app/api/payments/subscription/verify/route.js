import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifyRazorpaySignature } from "@/lib/razorpay";

export async function POST(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["COACHING_ADMIN", "SUPER_ADMIN"].includes(s.role)) {
    return NextResponse.json({ error: "Coaching admin login required" }, { status: 401 });
  }
  const { paymentId, signature, localPaymentId } = await request.json();
  const payment = await prisma.payment.findFirst({
    where: { id: localPaymentId, organizationId: s.organizationId },
  });
  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }
  if (!verifyRazorpaySignature({ orderId: payment.razorpayOrderId, paymentId, signature })) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }
  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "PAID",
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
      paidAt: new Date(),
    },
  });
  await prisma.coachingSubscription.update({
    where: { id: payment.subscriptionId },
    data: { status: "ACTIVE" },
  });
  return NextResponse.json({ success: true, payment: updated });
}
