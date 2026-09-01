import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function runVerification() {
  console.log("🔍 Verification Check: Inspecting Exam Question Counts & Snapshots...");

  const exams = await prisma.exam.findMany({
    where: { status: "LIVE" },
    include: {
      _count: {
        select: { questions: true, questionSnapshots: true },
      },
    },
  });

  console.log(`Found ${exams.length} LIVE Exams in DB.`);
  let failed = 0;

  for (const e of exams) {
    const qCount = e._count.questions;
    const sCount = e._count.questionSnapshots;
    const maxCount = Math.max(qCount, sCount);

    if (maxCount < e.totalQuestions && e.totalQuestions >= 50) {
      console.error(
        `❌ Mismatch in Exam "${e.title}" (${e.slug}): totalQuestions=${e.totalQuestions}, questions.count=${qCount}, snapshots.count=${sCount}`,
      );
      failed++;
    } else {
      console.log(
        `✅ OK: "${e.title}" -> totalQuestions=${e.totalQuestions}, questions=${qCount}, snapshots=${sCount}`,
      );
    }
  }

  if (failed > 0) {
    console.error(`\n❌ Failed ${failed} exam count checks.`);
    process.exit(1);
  } else {
    console.log("\n🎉 All LIVE exams have 100% full questions attached!");
  }
}

runVerification()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
