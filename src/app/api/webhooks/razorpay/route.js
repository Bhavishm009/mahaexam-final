import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/razorpay-service";
import { createMarketplaceLedger } from "@/lib/marketplace-service";

export const runtime = "nodejs";

export async function POST(request) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";
  if (!process.env.RAZORPAY_WEBHOOK_SECRET || !verifyWebhookSignature(raw, signature)) {
    return new NextResponse("Invalid signature", { status: 400 });
  }
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }
  const eventId =
    body?.payload?.payment?.entity?.id ||
    body?.payload?.order?.entity?.id ||
    `${body.event}:${body.created_at}`;
  const existing = await prisma.paymentWebhookEvent.findUnique({
    where: { provider_eventId: { provider: "RAZORPAY", eventId } },
  });
  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }
  const event = await prisma.paymentWebhookEvent.create({
    data: {
      provider: "RAZORPAY",
      eventId,
      eventType: body.event || "unknown",
      signature,
      payload: body,
    },
  });
  try {
    const entity = body?.payload?.payment?.entity || body?.payload?.order?.entity;
    const orderId = entity?.order_id || entity?.id;
    if (body.event === "payment.captured" || body.event === "order.paid") {
      const payment = await prisma.payment.findUnique({ where: { orderId } });
      if (payment) {
        await prisma.$transaction(async (tx) => {
          const p = await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: "VERIFIED",
              paymentId: entity?.id || payment.paymentId,
              rawResponse: body,
              verifiedAt: new Date(),
            },
          });
          await tx.examEntitlement.upsert({
            where: { studentId_examId: { studentId: p.studentId, examId: p.examId } },
            update: { status: "ACTIVE", source: "PAYMENT", paymentId: p.id },
            create: {
              studentId: p.studentId,
              examId: p.examId,
              status: "ACTIVE",
              source: "PAYMENT",
              paymentId: p.id,
            },
          });
          await tx.notification.create({
            data: {
              studentId: p.studentId,
              type: "PAYMENT_SUCCESS",
              title: "Payment successful",
              message: "Your examination access is now active.",
              examId: p.examId,
            },
          });
        });
      }
      if (payment) {
        await createMarketplaceLedger(payment.id);
      }
    } else if (body.event === "payment.failed") {
      const payment = await prisma.payment.findUnique({ where: { orderId } });
      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
            paymentId: entity?.id || null,
            rawResponse: body,
            failureReason: entity?.error_description || "Payment failed",
          },
        });
      }
    } else if (body.event === "refund.created" || body.event === "refund.processed") {
      const paymentId = entity?.payment_id;
      const payment = paymentId ? await prisma.payment.findFirst({ where: { paymentId } }) : null;
      if (payment) {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: { status: "REFUNDED", refundId: entity?.id || null, rawResponse: body },
          }),
          prisma.examEntitlement.updateMany({
            where: { studentId: payment.studentId, examId: payment.examId, source: "PAYMENT" },
            data: { status: "REVOKED" },
          }),
        ]);
      }
    }
    await prisma.paymentWebhookEvent.update({
      where: { id: event.id },
      data: { status: "PROCESSED", processedAt: new Date() },
    });
    return NextResponse.json({ received: true });
  } catch (e) {
    await prisma.paymentWebhookEvent.update({
      where: { id: event.id },
      data: { status: "FAILED", errorMessage: String(e.message || e) },
    });
    // Return 2xx only after the event is durably recorded. Failed processing can be retried by an ops job.
    return NextResponse.json({ received: true, processed: false }, { status: 200 });
  }
}
