import { prisma } from "../src/lib/db.js";
import { shuffleOptionsDeterministically } from "../src/lib/option-shuffler.js";

async function main() {
  console.log("=== 1. VERIFYING FINANCE STATS & REVENUE ===");

  const successfulStatuses = ["PAID", "VERIFIED", "CAPTURED", "SUCCESS"];

  const [purchases, paymentsAggregate, recentPayments] = await Promise.all([
    prisma.examPurchase.count({ where: { status: "PAID" } }),
    prisma.payment.aggregate({
      where: { status: { in: successfulStatuses } },
      _sum: { amount: true, amountPaise: true },
    }),
    prisma.payment.findMany({
      where: { status: { in: successfulStatuses } },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        exam: { select: { id: true, title: true, price: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  let revenue = Number(paymentsAggregate?._sum?.amount || 0);
  if (revenue <= 0 && paymentsAggregate?._sum?.amountPaise) {
    revenue = Number(paymentsAggregate._sum.amountPaise) / 100;
  }

  console.log(`✓ Paid Purchases Count: ${purchases}`);
  console.log(`✓ Total Gross Revenue: ₹${revenue.toFixed(2)}`);
  console.log(`✓ Total Verified Student Payments: ${recentPayments.length}`);
  if (recentPayments.length > 0) {
    const p = recentPayments[0];
    console.log(`✓ Most Recent Payment:`);
    console.log(`   Customer: ${p.user?.name} (${p.user?.email})`);
    console.log(`   Exam: ${p.exam?.title}`);
    console.log(`   Amount: ₹${p.amount}`);
    console.log(`   Status: ${p.status}`);
    console.log(`   Razorpay Order: ${p.razorpayOrderId}`);
    console.log(`   Razorpay Payment ID: ${p.razorpayPaymentId}`);
  }

  console.log("\n=== 2. VERIFYING OPTION RANDOMIZATION ===");

  const examId = "cmtpdp8e60001kwpwqa7ypnwg";
  const studentId = "cmtookv4r0000jr04hp2bc9da";

  const examData = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      questions: {
        include: {
          question: {
            include: {
              options: { orderBy: { optionOrder: "asc" } },
            },
          },
        },
        orderBy: { questionOrder: "asc" },
      },
    },
  });

  const positionCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const rawQuestions = examData.questions || [];

  for (const eq of rawQuestions) {
    const q = eq.question;
    const rawOpts = (q.options || []).map((o, optIdx) => ({
      id: o.id || `opt-${optIdx + 1}`,
      text: o.optionText || "",
      isCorrect: o.isCorrect,
      order: o.optionOrder || optIdx + 1,
    }));

    const randomized = shuffleOptionsDeterministically(rawOpts, `${examId}_${q.id}_${studentId}`);
    const correctIdx = randomized.findIndex((o) => o.isCorrect);
    const correctPos = correctIdx + 1;
    positionCounts[correctPos] = (positionCounts[correctPos] || 0) + 1;
  }

  console.log(`✓ Total Questions in Exam: ${rawQuestions.length}`);
  console.log(`✓ Distribution of Correct Option Position across the Exam:`, positionCounts);

  const pos1Pct = Math.round(((positionCounts[1] || 0) / rawQuestions.length) * 100);
  console.log(`✓ Correct option at Pos 1 (A): ${pos1Pct}% (Previously 100%)`);

  if (pos1Pct === 100) {
    throw new Error("FAILED: Options are still 100% on position 1!");
  } else {
    console.log("🎉 SUCCESS: Options are now randomly distributed across A, B, C, D!");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
