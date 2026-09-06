import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifyCheckoutSignature } from "@/lib/razorpay-service";
export async function POST(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const orderId = body.razorpay_order_id || body.orderId || body.order_id;
  const paymentId = body.razorpay_payment_id || body.paymentId || body.payment_id;
  const signature = body.razorpay_signature || body.signature;

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ error: "Missing required signature fields" }, { status: 400 });
  }

  const payment = await prisma.payment.findFirst({
    where: {
      OR: [{ orderId }, { razorpayOrderId: orderId }],
      studentId: s.sub,
    },
  });
  if (!payment) {
    return NextResponse.json({ error: "Payment order not found" }, { status: 404 });
  }
  if (payment.status === "VERIFIED") {
    return NextResponse.json({ payment, alreadyVerified: true, success: true });
  }
  const valid = verifyCheckoutSignature(orderId, paymentId, signature);
  if (!valid) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", paymentId, failureReason: "INVALID_SIGNATURE" },
    });
    return NextResponse.json(
      { error: "Invalid payment signature", success: false },
      { status: 400 },
    );
  }
  const updated = await prisma.$transaction(async (tx) => {
    const p = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "VERIFIED",
        paymentId,
        razorpayPaymentId: paymentId,
        signature,
        razorpaySignature: signature,
        verifiedAt: new Date(),
        paidAt: new Date(),
      },
    });

    if (payment.examId) {
      await tx.examPurchase.upsert({
        where: { userId_examId: { userId: s.sub, examId: payment.examId } },
        update: {
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          status: "PAID",
          amount: payment.amountPaise ?? Math.round(payment.amount * 100),
          currency: payment.currency || "INR",
          purchasedAt: new Date(),
        },
        create: {
          userId: s.sub,
          examId: payment.examId,
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          status: "PAID",
          amount: payment.amountPaise ?? Math.round(payment.amount * 100),
          currency: payment.currency || "INR",
          purchasedAt: new Date(),
        },
      });

      await tx.examEntitlement.upsert({
        where: { studentId_examId: { studentId: s.sub, examId: payment.examId } },
        update: { status: "ACTIVE", source: "PAYMENT", paymentId: p.id },
        create: {
          studentId: s.sub,
          examId: payment.examId,
          status: "ACTIVE",
          source: "PAYMENT",
          paymentId: p.id,
        },
      });
    }
    await tx.notification.create({
      data: {
        studentId: s.sub,
        type: "PAYMENT_SUCCESS",
        title: "Payment successful",
        message: "Your examination access is now active.",
        examId: payment.examId,
      },
    });
    return p;
  });
  return NextResponse.json({ payment: updated });
}
