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
  const { orderId, paymentId, signature } = await request.json();
  const payment = await prisma.payment.findFirst({ where: { orderId, studentId: s.sub } });
  if (!payment) {
    return NextResponse.json({ error: "Payment order not found" }, { status: 404 });
  }
  if (payment.status === "VERIFIED") {
    return NextResponse.json({ payment, alreadyVerified: true });
  }
  const valid = verifyCheckoutSignature(orderId, paymentId, signature);
  if (!valid) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", paymentId, failureReason: "INVALID_SIGNATURE" },
    });
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }
  const updated = await prisma.$transaction(async (tx) => {
    const p = await tx.payment.update({
      where: { id: payment.id },
      data: { status: "VERIFIED", paymentId, signature, verifiedAt: new Date() },
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
