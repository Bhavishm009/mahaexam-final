import { prisma } from "../src/lib/db.js";

async function verify() {
  console.log("--- DATABASE SEED VERIFICATION ---");

  // 1. Check Subjects
  const subjects = await prisma.subject.findMany();
  console.log(`\n✅ Total Subjects: ${subjects.length}`);
  subjects.forEach((s) => console.log(`  - [${s.slug}] ${s.nameMr} (${s.name})`));

  // 2. Check Exams Count & Status
  const exams = await prisma.exam.findMany({
    select: { id: true, title: true, slug: true, status: true, totalQuestions: true },
  });
  const liveExams = exams.filter((e) => e.status === "LIVE");
  const draftExams = exams.filter((e) => e.status === "DRAFT");
  console.log(
    `\n✅ Total Exams: ${exams.length} (LIVE: ${liveExams.length}, DRAFT: ${draftExams.length})`,
  );
  console.log("\nLive Exams:");
  liveExams.forEach((e) =>
    console.log(`  🟢 [LIVE] ${e.slug} (${e.totalQuestions} Qs) - ${e.title}`),
  );

  // 3. Check Option Randomization on Sample Questions
  const questions = await prisma.question.findMany({
    take: 100,
    include: { options: { orderBy: { optionOrder: "asc" } } },
  });

  const positionCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  questions.forEach((q) => {
    const correctIdx = q.options.findIndex((o) => o.isCorrect);
    if (correctIdx !== -1) {
      positionCounts[correctIdx + 1] = (positionCounts[correctIdx + 1] || 0) + 1;
    }
  });

  console.log(
    `\n✅ Correct Option Distribution across first 100 questions (Checking Randomization):`,
  );
  console.log(
    `  Option 1: ${positionCounts[1]} times (${((positionCounts[1] / 100) * 100).toFixed(1)}%)`,
  );
  console.log(
    `  Option 2: ${positionCounts[2]} times (${((positionCounts[2] / 100) * 100).toFixed(1)}%)`,
  );
  console.log(
    `  Option 3: ${positionCounts[3]} times (${((positionCounts[3] / 100) * 100).toFixed(1)}%)`,
  );
  console.log(
    `  Option 4: ${positionCounts[4]} times (${((positionCounts[4] / 100) * 100).toFixed(1)}%)`,
  );

  // 4. Verify Snapshots
  const snapshotCount = await prisma.examQuestionSnapshot.count();
  console.log(`\n✅ Total Question Snapshots in DB: ${snapshotCount}`);

  await prisma.$disconnect();
}

verify().catch(console.error);
