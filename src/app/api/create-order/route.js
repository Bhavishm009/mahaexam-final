import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createRazorpayOrder, razorpayReady } from "@/lib/razorpay";

export async function POST(request) {
  try {
    const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!s || !s.sub || s.role !== "STUDENT") {
      return NextResponse.json({ error: "Student login required" }, { status: 401 });
    }

    if (!razorpayReady()) {
      return NextResponse.json({ error: "Razorpay is not configured" }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const { examId, currency = "INR" } = body;
    let amountPaise = Number(body.amount || 0);

    let exam = null;
    if (examId) {
      exam = await prisma.exam.findFirst({
        where: {
          OR: [{ id: examId }, { slug: examId }],
        },
        select: {
          id: true,
          slug: true,
          title: true,
          price: true,
          isFree: true,
          organizationId: true,
        },
      });

      if (!exam) {
        return NextResponse.json({ error: "Exam not found" }, { status: 404 });
      }

      if (exam.isFree || Number(exam.price || 0) <= 0) {
        return NextResponse.json(
          { error: "This exam is free and does not require payment" },
          { status: 400 },
        );
      }

      const [existingPurchase, existingEntitlement, existingPayment] = await Promise.all([
        prisma.examPurchase.findUnique({
          where: { userId_examId: { userId: s.sub, examId: exam.id } },
        }),
        prisma.examEntitlement.findUnique({
          where: { studentId_examId: { studentId: s.sub, examId: exam.id } },
        }),
        prisma.payment.findFirst({
          where: {
            OR: [{ studentId: s.sub }, { userId: s.sub }],
            examId: exam.id,
            status: { in: ["PAID", "SUCCESS", "VERIFIED", "CAPTURED"] },
          },
        }),
      ]);

      if (
        existingPurchase?.status === "PAID" ||
        existingEntitlement?.status === "ACTIVE" ||
        Boolean(existingPayment)
      ) {
        return NextResponse.json({ alreadyPurchased: true, message: "Exam is already unlocked" });
      }

      amountPaise = Math.round(Number(exam.price) * 100);
    }

    if (!amountPaise || amountPaise < 100) {
      return NextResponse.json(
        { error: "Amount must be at least 100 paise (₹1)" },
        { status: 400 },
      );
    }

    const receipt = (
      body.receipt || `rcpt_${exam ? exam.id.slice(-6) : "gen"}_${s.sub.slice(-6)}_${Date.now()}`
    ).slice(0, 40);

    let order;
    try {
      order = await createRazorpayOrder({
        amountPaise,
        receipt,
        notes: {
          examId: exam?.id || "",
          examTitle: exam?.title || "",
          studentId: s.sub,
          userId: s.sub,
        },
      });
    } catch (err) {
      console.error("Razorpay order creation failed:", err);
      return NextResponse.json(
        { error: err.message || "Failed to create Razorpay order" },
        { status: 500 },
      );
    }

    // Persist PaymentOrder in database
    const savedOrder = await prisma.paymentOrder.create({
      data: {
        userId: s.sub,
        examId: exam?.id || null,
        organizationId: exam?.organizationId || null,
        providerOrderId: order.id,
        amount: order.amount,
        currency: order.currency || currency,
        status: "CREATED",
        receipt,
        notes: {
          examTitle: exam?.title || "Exam Checkout",
          studentId: s.sub,
        },
      },
    });

    // Also persist in legacy Payment table for compatibility
    await prisma.payment.create({
      data: {
        studentId: s.sub,
        userId: s.sub,
        examId: exam?.id || null,
        organizationId: exam?.organizationId || null,
        orderId: order.id,
        razorpayOrderId: order.id,
        amount: order.amount / 100,
        amountPaise: order.amount,
        currency: order.currency || currency,
        receipt,
        status: "CREATED",
      },
    });

    return NextResponse.json({
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency || "INR",
      receipt: order.receipt,
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentOrderId: savedOrder.id,
      examId: exam?.id || null,
    });
  } catch (error) {
    console.error("Error in /api/create-order:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
