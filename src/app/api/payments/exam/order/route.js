import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createRazorpayOrder } from "@/lib/razorpay";

export async function POST(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "STUDENT") {
    return NextResponse.json({ error: "Student login required" }, { status: 401 });
  }
  const { examId } = await request.json();
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }
  if (Number(exam.price || 0) <= 0) {
    return NextResponse.json({ error: "This exam is free" }, { status: 400 });
  }
  const existing = await prisma.examPurchase.findUnique({
    where: { userId_examId: { userId: s.sub, examId } },
  });
  if (existing?.status === "PAID") {
    return NextResponse.json({ alreadyPurchased: true, purchase: existing });
  }
  const order = await createRazorpayOrder({
    amount: Number(exam.price),
    receipt: `exam_${examId}_${s.sub}`,
  });
  const purchase = await prisma.examPurchase.upsert({
    where: { userId_examId: { userId: s.sub, examId } },
    update: { amount: Number(exam.price), razorpayOrderId: order.id, status: "PENDING" },
    create: {
      userId: s.sub,
      examId,
      amount: Number(exam.price),
      razorpayOrderId: order.id,
      status: "PENDING",
    },
  });
  return NextResponse.json({
    purchase,
    order,
    keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_demo",
  });
}
