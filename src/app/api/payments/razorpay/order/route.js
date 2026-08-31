import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { razorpayRequest } from "@/lib/razorpay";

export async function POST(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "STUDENT") {
    return NextResponse.json({ error: "Student login required" }, { status: 401 });
  }
  try {
    const { examId } = await request.json();
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { id: true, title: true, price: true, organizationId: true, status: true },
    });
    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }
    const price = Number(exam.price || 0);
    if (price <= 0) {
      return NextResponse.json({ error: "This exam is free" }, { status: 400 });
    }
    const existing = await prisma.examPurchase.findUnique({
      where: { userId_examId: { userId: s.sub, examId } },
    });
    if (existing?.status === "PAID") {
      return NextResponse.json({ alreadyPurchased: true });
    }
    const receipt = `EX-${examId.slice(-8)}-${s.sub.slice(-8)}-${Date.now()}`.slice(0, 40);
    const order = await razorpayRequest("/orders", {
      method: "POST",
      body: JSON.stringify({
        amount: Math.round(price * 100),
        currency: "INR",
        receipt,
        notes: { examId, userId: s.sub },
      }),
    });
    const saved = await prisma.paymentOrder.create({
      data: {
        userId: s.sub,
        examId,
        organizationId: exam.organizationId,
        providerOrderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt,
        notes: { examTitle: exam.title },
      },
    });
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentOrderId: saved.id,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
