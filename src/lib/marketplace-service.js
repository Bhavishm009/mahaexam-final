import { prisma } from "@/lib/db";

export async function calculateMarketplaceSplit(paymentId) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { exam: { include: { coachingProduct: true } } },
  });
  if (!payment || payment.status !== "VERIFIED") {
    throw new Error("PAYMENT_NOT_VERIFIED");
  }
  const product = payment.exam.coachingProduct;
  if (!product) {
    throw new Error("NOT_A_COACHING_MARKETPLACE_EXAM");
  }
  const gross = payment.amountPaise / 100;
  const platformFee = Math.round(gross * product.platformFeePct) / 100;
  const coachShare = Math.round((gross - platformFee) * 100) / 100;
  return { gross, platformFee, coachShare, organizationId: product.organizationId };
}

export async function createMarketplaceLedger(paymentId) {
  const split = await calculateMarketplaceSplit(paymentId);
  return prisma.marketplaceTransfer.upsert({
    where: { paymentId_organizationId: { paymentId, organizationId: split.organizationId } },
    update: {
      grossAmount: split.gross,
      platformFee: split.platformFee,
      coachingShare: split.coachShare,
    },
    create: {
      paymentId,
      organizationId: split.organizationId,
      grossAmount: split.gross,
      platformFee: split.platformFee,
      coachingShare: split.coachShare,
      status: "PENDING",
    },
  });
}
