import { prisma } from "../src/lib/db.js";

async function verifyDetailed() {
  console.log("==================================================");
  console.log("🔍 COMPREHENSIVE QUESTION & EXAM INTEGRITY AUDIT");
  console.log("==================================================");

  // 1. Topic Question Counts
  const subjects = await prisma.subject.findMany({
    include: {
      _count: {
        select: { questions: true }
      }
    }
  });

  console.log("\n📚 1. TOPIC QUESTION BANK COUNTS (>= 200 required per topic):");
  let allTopicsPassed = true;
  for (const s of subjects) {
    const count = s._count.questions;
    const passed = count >= 200;
    if (!passed) allTopicsPassed = false;
    console.log(`  ${passed ? "✅" : "❌"} [${s.slug}] ${s.nameMr} (${s.name}): ${count} Questions`);
  }
  console.log(`\nTopic Count Threshold Check: ${allTopicsPassed ? "PASSED (All topics >= 200)" : "FAILED"}`);

  // 2. Question Quality & Correctness
  const allQuestions = await prisma.question.findMany({
    include: { options: true }
  });
  console.log(`\n📝 2. TOTAL QUESTIONS IN DATABASE: ${allQuestions.length}`);

  let invalidOptionsCount = 0;
  let missingCorrectCount = 0;
  let missingTextCount = 0;
  let missingExpCount = 0;
  const positionDistribution = { 1: 0, 2: 0, 3: 0, 4: 0 };

  for (const q of allQuestions) {
    if (q.options.length !== 4) invalidOptionsCount++;
    const correctOptions = q.options.filter(o => o.isCorrect);
    if (correctOptions.length !== 1) missingCorrectCount++;
    if (!q.questionText || !q.questionTextMr) missingTextCount++;
    if (!q.explanation || !q.explanationMr) missingExpCount++;

    const sortedOptions = [...q.options].sort((a, b) => a.optionOrder - b.optionOrder);
    const correctIdx = sortedOptions.findIndex(o => o.isCorrect);
    if (correctIdx !== -1) {
      positionDistribution[correctIdx + 1] = (positionDistribution[correctIdx + 1] || 0) + 1;
    }
  }

  console.log(`  - Questions with != 4 options: ${invalidOptionsCount} (Expected: 0)`);
  console.log(`  - Questions with != 1 correct option: ${missingCorrectCount} (Expected: 0)`);
  console.log(`  - Questions with missing EN/MR text: ${missingTextCount} (Expected: 0)`);
  console.log(`  - Questions with missing explanations: ${missingExpCount} (Expected: 0)`);

  console.log("\n🎲 3. ANSWER POSITION DISTRIBUTION (Uniform Randomization Check):");
  const totalChecked = allQuestions.length;
  for (let pos = 1; pos <= 4; pos++) {
    const cnt = positionDistribution[pos];
    const pct = ((cnt / totalChecked) * 100).toFixed(1);
    console.log(`  - Option ${pos}: ${cnt} questions (${pct}%)`);
  }

  // 4. Duplicate Check within Every Exam
  const exams = await prisma.exam.findMany({
    include: {
      questions: true,
      questionSnapshots: true,
    }
  });

  console.log(`\n📋 4. EXAM DUPLICATION & LIVE STATUS CHECK (${exams.length} Exams Total):`);
  let anyDuplicateFound = false;

  for (const exam of exams) {
    const qIds = exam.questions.map(eq => eq.questionId);
    const uniqueQIds = new Set(qIds);
    const hasDuplicates = qIds.length !== uniqueQIds.size;
    if (hasDuplicates) anyDuplicateFound = true;

    const snapCount = exam.questionSnapshots.length;
    console.log(
      `  ${hasDuplicates ? "❌ DUPLICATE DETECTED!" : "✅"} [${exam.status}] ${exam.slug}: ${qIds.length} Qs, ${uniqueQIds.size} Unique, ${snapCount} Snapshots`
    );
  }

  console.log(`\nExam Duplicate Check: ${!anyDuplicateFound ? "PASSED (0 duplicates across all exams!)" : "FAILED"}`);

  console.log("\n==================================================");
  console.log("🎉 VERIFICATION COMPLETE");
  console.log("==================================================");

  await prisma.$disconnect();
}

verifyDetailed().catch(console.error);
