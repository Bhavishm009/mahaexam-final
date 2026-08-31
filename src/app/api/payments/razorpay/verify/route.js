import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifyCheckoutSignature, razorpayRequest } from "@/lib/razorpay";

export async function POST(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "STUDENT") {
    return NextResponse.json({ error: "Student login required" }, { status: 401 });
  }
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();
    if (!verifyCheckoutSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }
    const po = await prisma.paymentOrder.findUnique({
      where: { providerOrderId: razorpay_order_id },
    });
    if (!po || po.userId !== s.sub) {
      return NextResponse.json({ error: "Payment order not found" }, { status: 404 });
    }
    const payment = await razorpayRequest(`/payments/${razorpay_payment_id}`);
    if (payment.order_id !== razorpay_order_id) {
      return NextResponse.json({ error: "Order mismatch" }, { status: 400 });
    }
    if (!["captured", "authorized"].includes(payment.status)) {
      return NextResponse.json({ error: `Payment status: ${payment.status}` }, { status: 400 });
    }
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.paymentOrder.update({
        where: { id: po.id },
        data: {
          providerPaymentId: razorpay_payment_id,
          status: payment.status === "captured" ? "CAPTURED" : "AUTHORIZED",
          paidAt: payment.status === "captured" ? new Date() : null,
        },
      });
      if (payment.status === "captured" && po.examId) {
        await tx.examPurchase.upsert({
          where: { userId_examId: { userId: s.sub, examId: po.examId } },
          update: {
            paymentOrderId: po.id,
            status: "PAID",
            amount: po.amount,
            currency: po.currency,
          },
          create: {
            userId: s.sub,
            examId: po.examId,
            paymentOrderId: po.id,
            status: "PAID",
            amount: po.amount,
            currency: po.currency,
          },
        });
      }
      return updated;
    });
    return NextResponse.json({ success: true, status: result.status });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
