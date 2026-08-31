import { prisma } from "@/lib/db";
import { createRazorpayOrder, razorpayReady } from "@/lib/razorpay-service";

export async function createPaymentRecord(studentId, examId) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true, title: true, price: true, isFree: true },
  });
  if (!exam) {
    throw new Error("EXAM_NOT_FOUND");
  }
  if (exam.isFree || Number(exam.price || 0) <= 0) {
    throw new Error("EXAM_IS_FREE");
  }
  if (!razorpayReady()) {
    throw new Error("RAZORPAY_NOT_CONFIGURED");
  }
  const amountPaise = Math.round(Number(exam.price) * 100);
  const receipt = `me_${studentId.slice(-8)}_${Date.now()}`.slice(0, 40);
  const order = await createRazorpayOrder({ amountPaise, receipt, notes: { examId, studentId } });
  const p = await prisma.payment.create({
    data: { studentId, examId, orderId: order.id, receipt, amountPaise, status: "CREATED" },
  });
  return {
    payment: p,
    order: {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    },
  };
}
