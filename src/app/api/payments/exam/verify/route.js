import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifyRazorpaySignature } from "@/lib/razorpay";

export async function POST(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "STUDENT") {
    return NextResponse.json({ error: "Student login required" }, { status: 401 });
  }
  const { purchaseId, paymentId, signature } = await request.json();
  const p = await prisma.examPurchase.findFirst({ where: { id: purchaseId, userId: s.sub } });
  if (!p) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }
  if (!verifyRazorpaySignature({ orderId: p.razorpayOrderId, paymentId, signature })) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }
  const updated = await prisma.examPurchase.update({
    where: { id: p.id },
    data: { status: "PAID", razorpayPaymentId: paymentId, purchasedAt: new Date() },
  });
  return NextResponse.json({ success: true, purchase: updated });
}
