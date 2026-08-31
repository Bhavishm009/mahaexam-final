import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/razorpay";

export async function POST(request) {
  const raw = await request.text();
  try {
    const sig = request.headers.get("x-razorpay-signature");
    if (!verifyWebhookSignature(raw, sig)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    const body = JSON.parse(raw),
      eventId = body?.id,
      type = body?.event;
    if (!eventId || !type) {
      return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
    }
    const existing = await prisma.paymentEvent.findUnique({ where: { providerEventId: eventId } });
    if (existing) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    const entity = body?.payload?.payment?.entity || body?.payload?.order?.entity;
    const orderId = entity?.order_id || entity?.id;
    const po = await prisma.paymentOrder.findUnique({ where: { providerOrderId: orderId } });
    if (!po) {
      return NextResponse.json({ received: true, ignored: true });
    }
    const event = await prisma.paymentEvent.create({
      data: { paymentOrderId: po.id, providerEventId: eventId, eventType: type, payload: body },
    });
    if (type === "payment.captured") {
      await prisma.$transaction([
        prisma.paymentOrder.update({
          where: { id: po.id },
          data: { providerPaymentId: entity.id, status: "CAPTURED", paidAt: new Date() },
        }),
        ...(po.examId
          ? [
              prisma.examPurchase.upsert({
                where: { userId_examId: { userId: po.userId, examId: po.examId } },
                update: {
                  status: "PAID",
                  paymentOrderId: po.id,
                  amount: po.amount,
                  currency: po.currency,
                },
                create: {
                  userId: po.userId,
                  examId: po.examId,
                  paymentOrderId: po.id,
                  status: "PAID",
                  amount: po.amount,
                  currency: po.currency,
                },
              }),
            ]
          : []),
      ]);
    } else if (type === "payment.failed") {
      await prisma.paymentOrder.update({
        where: { id: po.id },
        data: { status: "FAILED", failureReason: entity?.error_description || "Payment failed" },
      });
    }
    await prisma.paymentEvent.update({
      where: { id: event.id },
      data: { processed: true, processedAt: new Date() },
    });
    return NextResponse.json({ received: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
