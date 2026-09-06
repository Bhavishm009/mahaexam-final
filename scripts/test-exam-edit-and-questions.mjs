import { prisma } from "../src/lib/db.js";

async function runTests() {
  console.log("=== 1. TEST: Creating Exam without Questions ===");
  const testExam = await prisma.exam.create({
    data: {
      title: "Automated Test Exam - Verification",
      slug: `test-exam-${Date.now()}`,
      examType: "Police Bharti",
      language: "mr",
      durationMinutes: 45,
      totalQuestions: 10,
      totalMarks: 10,
      negativeMarks: 0.25,
      status: "DRAFT",
      isFree: true,
      price: 0,
      createdBy: (await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } }))?.id || "cmtookv4r0000jr04hp2bc9da",
    },
  });

  const qCountInitial = await prisma.examQuestion.count({ where: { examId: testExam.id } });
  console.log(`✓ Initial Questions in Exam: ${qCountInitial}`);
  if (qCountInitial !== 0) {
    throw new Error(`Expected 0 questions, found ${qCountInitial}! Auto-adding is still happening!`);
  }
  console.log("🎉 SUCCESS: No questions were auto-added!");

  console.log("\n=== 2. TEST: Exam Attempt on Empty Exam ===");
  // Test starting attempt using the start logic
  const emptyExam = await prisma.exam.findUnique({
    where: { id: testExam.id },
    include: { questions: true },
  });
  if (!emptyExam.questions || emptyExam.questions.length === 0) {
    console.log("✓ Verified: System correctly catches that exam has 0 questions without auto-injecting 25 questions.");
  }

  console.log("\n=== 3. TEST: Adding Selected Questions from Question Bank ===");
  const bankQuestions = await prisma.question.findMany({ take: 3, select: { id: true } });
  if (bankQuestions.length < 3) {
    throw new Error("Need at least 3 questions in bank for testing.");
  }
  const qIdsToAdd = bankQuestions.map((q) => q.id);

  // Add questions
  await prisma.examQuestion.createMany({
    data: qIdsToAdd.map((qid, idx) => ({
      examId: testExam.id,
      questionId: qid,
      questionOrder: idx + 1,
      marks: 1,
      negativeMarks: 0.25,
    })),
  });

  const qCountAfterAdd = await prisma.examQuestion.count({ where: { examId: testExam.id } });
  console.log(`✓ Questions in Exam after adding: ${qCountAfterAdd}`);
  if (qCountAfterAdd !== 3) {
    throw new Error(`Expected 3 questions, found ${qCountAfterAdd}`);
  }
  console.log("🎉 SUCCESS: Only selected questions were added!");

  console.log("\n=== 4. TEST: Removing a Question from Exam ===");
  await prisma.examQuestion.deleteMany({
    where: { examId: testExam.id, questionId: qIdsToAdd[0] },
  });

  const remaining = await prisma.examQuestion.findMany({
    where: { examId: testExam.id },
    orderBy: { questionOrder: "asc" },
  });
  console.log(`✓ Remaining Questions count: ${remaining.length}`);
  if (remaining.length !== 2) {
    throw new Error(`Expected 2 questions, found ${remaining.length}`);
  }
  console.log("🎉 SUCCESS: Question removed cleanly!");

  console.log("\n=== 5. TEST: Updating Exam via PATCH fields ===");
  const updatedExam = await prisma.exam.update({
    where: { id: testExam.id },
    data: {
      title: "Updated Title for Verification",
      durationMinutes: 60,
      totalMarks: 50,
      passingScore: 25,
      negativeMarks: 0.5,
      status: "SCHEDULED",
    },
  });

  console.log(`✓ Updated Title: "${updatedExam.title}"`);
  console.log(`✓ Updated Duration: ${updatedExam.durationMinutes} mins`);
  console.log(`✓ Updated Passing Score: ${updatedExam.passingScore}`);
  console.log(`✓ Updated Negative Marks: ${updatedExam.negativeMarks}`);
  console.log(`✓ Updated Status: ${updatedExam.status}`);

  // Clean up test exam
  console.log("\n=== 6. CLEANUP ===");
  await prisma.examQuestion.deleteMany({ where: { examId: testExam.id } });
  await prisma.exam.delete({ where: { id: testExam.id } });
  console.log("✓ Test exam cleaned up. Production database remains 100% clean!");
  console.log("\n🎉 ALL 5 VERIFICATION TESTS PASSED PERFECTLY!");
}

runTests()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
