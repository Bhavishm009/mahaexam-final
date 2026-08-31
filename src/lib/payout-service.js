import { prisma } from "@/lib/db";
import { createTransferFromPayment } from "@/lib/route-service";

export async function processMarketplaceTransfer(id) {
  const ledger = await prisma.marketplaceTransfer.findUnique({
    where: { id },
    include: { organization: { include: { payoutAccount: true } }, payment: true },
  });
  if (!ledger) {
    throw new Error("TRANSFER_NOT_FOUND");
  }
  if (["PROCESSED", "PROCESSING"].includes(ledger.status)) {
    return ledger;
  }
  const account = ledger.organization.payoutAccount;
  if (
    !account ||
    account.status !== "ACTIVE" ||
    account.kycStatus !== "VERIFIED" ||
    !account.razorpayAccountId
  ) {
    throw new Error("COACHING_PAYOUT_ACCOUNT_NOT_READY");
  }
  if (ledger.payment.status !== "VERIFIED") {
    throw new Error("PAYMENT_NOT_VERIFIED");
  }

  await prisma.marketplaceTransfer.update({ where: { id }, data: { status: "PROCESSING" } });
  try {
    const response = await createTransferFromPayment({
      paymentId: ledger.payment.paymentId,
      accountId: account.razorpayAccountId,
      amountPaise: Math.round(ledger.coachingShare * 100),
      notes: { marketplaceTransferId: id, organizationId: ledger.organizationId },
    });
    const transfer = response?.items?.[0] || response?.transfers?.[0] || response;
    return prisma.marketplaceTransfer.update({
      where: { id },
      data: {
        status: "PROCESSED",
        razorpayTransferId: transfer?.id || null,
        processedAt: new Date(),
      },
    });
  } catch (e) {
    return prisma.marketplaceTransfer.update({
      where: { id },
      data: { status: "FAILED", failureReason: String(e.message || e) },
    });
  }
}
