import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyRouteWebhook } from "@/lib/route-service";
export const runtime = "nodejs";
export async function POST(request) {
  const raw = await request.text(),
    sig = request.headers.get("x-razorpay-signature") || "";
  if (!verifyRouteWebhook(raw, sig)) {
    return new NextResponse("Invalid signature", { status: 400 });
  }
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }
  const eventId = `${body.event}:${body.created_at}:${body.payload?.transfer?.entity?.id || body.payload?.settlement?.entity?.id || "unknown"}`;
  const existing = await prisma.payoutTransferEvent.findUnique({ where: { eventId } });
  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }
  const transferId = body.payload?.transfer?.entity?.id;
  const eventType = body.event || "unknown";
  const ledgerId = body.payload?.transfer?.entity?.notes?.marketplaceTransferId;
  if (!ledgerId) {
    return NextResponse.json({ received: true, ignored: true });
  }
  const ledger = await prisma.marketplaceTransfer.findUnique({ where: { id: ledgerId } });
  if (!ledger) {
    return NextResponse.json({ received: true, ignored: true });
  }
  const status =
    eventType === "transfer.processed"
      ? "PROCESSED"
      : eventType === "transfers.failed"
        ? "FAILED"
        : ledger.status;
  await prisma.$transaction([
    prisma.payoutTransferEvent.create({
      data: {
        marketplaceTransferId: ledger.id,
        eventId,
        eventType,
        razorpayTransferId: transferId || ledger.razorpayTransferId,
        status,
        payload: body,
      },
    }),
    prisma.marketplaceTransfer.update({
      where: { id: ledger.id },
      data: {
        status,
        razorpayTransferId: transferId || ledger.razorpayTransferId,
        processedAt: status === "PROCESSED" ? new Date() : undefined,
        failureReason: status === "FAILED" ? "Razorpay transfer failed" : undefined,
      },
    }),
  ]);
  return NextResponse.json({ received: true });
}
