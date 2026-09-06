import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifyCheckoutSignature } from "@/lib/razorpay";

export async function POST(request) {
  try {
    const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!s || !s.sub || s.role !== "STUDENT") {
      return NextResponse.json({ error: "Student login required" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const order_id = body.razorpay_order_id || body.order_id || body.orderId;
    const payment_id = body.razorpay_payment_id || body.payment_id || body.paymentId;
    const signature = body.razorpay_signature || body.signature;

    if (!order_id || !payment_id || !signature) {
      return NextResponse.json(
        {
          error: "Missing required fields: order_id, payment_id, and signature are all required",
          success: false,
        },
        { status: 400 },
      );
    }

    const isValid = verifyCheckoutSignature(order_id, payment_id, signature);
    if (!isValid) {
      // Mark any matching orders as failed
      await prisma.paymentOrder.updateMany({
        where: { providerOrderId: order_id, userId: s.sub },
        data: { status: "FAILED", failureReason: "SIGNATURE_MISMATCH" },
      });
      await prisma.payment.updateMany({
        where: { orderId: order_id, studentId: s.sub },
        data: { status: "FAILED", failureReason: "SIGNATURE_MISMATCH" },
      });

      return NextResponse.json(
        { error: "Invalid payment signature", success: false },
        { status: 400 },
      );
    }

    const paymentOrder = await prisma.paymentOrder.findFirst({
      where: { providerOrderId: order_id, userId: s.sub },
    });
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [{ orderId: order_id }, { razorpayOrderId: order_id }],
        studentId: s.sub,
      },
    });

    const examId = paymentOrder?.examId || payment?.examId || body.examId || null;

    // Transaction to guarantee all entitlement and notification records are committed atomically
    await prisma.$transaction(async (tx) => {
      if (paymentOrder) {
        await tx.paymentOrder.update({
          where: { id: paymentOrder.id },
          data: {
            providerPaymentId: payment_id,
            status: "PAID",
            paidAt: new Date(),
          },
        });
      }

      if (payment) {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            paymentId: payment_id,
            razorpayPaymentId: payment_id,
            signature,
            razorpaySignature: signature,
            status: "VERIFIED",
            paidAt: new Date(),
            verifiedAt: new Date(),
          },
        });
      }

      if (examId) {
        await tx.examPurchase.upsert({
          where: { userId_examId: { userId: s.sub, examId } },
          update: {
            paymentOrderId: paymentOrder?.id || null,
            razorpayOrderId: order_id,
            razorpayPaymentId: payment_id,
            status: "PAID",
            amount: paymentOrder?.amount || (payment?.amountPaise ?? 0),
            currency: paymentOrder?.currency || payment?.currency || "INR",
            purchasedAt: new Date(),
          },
          create: {
            userId: s.sub,
            examId,
            paymentOrderId: paymentOrder?.id || null,
            razorpayOrderId: order_id,
            razorpayPaymentId: payment_id,
            status: "PAID",
            amount: paymentOrder?.amount || (payment?.amountPaise ?? 0),
            currency: paymentOrder?.currency || payment?.currency || "INR",
            purchasedAt: new Date(),
          },
        });

        await tx.examEntitlement.upsert({
          where: { studentId_examId: { studentId: s.sub, examId } },
          update: {
            status: "ACTIVE",
            source: "PAYMENT",
            paymentId: payment?.id || null,
          },
          create: {
            studentId: s.sub,
            examId,
            status: "ACTIVE",
            source: "PAYMENT",
            paymentId: payment?.id || null,
          },
        });

        // Create student notification
        await tx.notification.create({
          data: {
            studentId: s.sub,
            userId: s.sub,
            type: "PAYMENT_SUCCESS",
            title: "Payment successful (पेमेंट यशस्वी)",
            message: "Your examination access is now active. You can attempt the exam anytime.",
            examId,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      examId,
      order_id,
      payment_id,
    });
  } catch (error) {
    console.error("Error in /api/verify-payment:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
