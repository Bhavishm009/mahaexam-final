import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedPaidExam() {
  console.log("🌱 Creating/verifying Test Paid Exam for Razorpay...");

  // Find an admin user to own the exam
  let admin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });

  if (!admin) {
    admin = await prisma.user.findFirst();
  }

  if (!admin) {
    throw new Error("No user found in database to assign as exam creator.");
  }

  // 1. Create or update the paid exam
  const paidExam = await prisma.exam.upsert({
    where: { slug: "test-paid-police-bharti-2026" },
    update: {
      isFree: false,
      price: 1.0, // ₹1 = 100 paise (Razorpay minimum amount)
      status: "LIVE",
      visibilityMode: "GLOBAL",
      durationMinutes: 90,
      totalQuestions: 25,
      totalMarks: 25,
    },
    create: {
      title: "Maharashtra Police Bharti 2026 Premium Paid Mock Test (सशुल्क सराव परीक्षा - Razorpay Test)",
      slug: "test-paid-police-bharti-2026",
      description: "सशुल्क चाचणी परीक्षा (Razorpay Test Mode) - अस्सल TCS/IBPS पॅटर्ननुसार सराव परीक्षा. शुल्क: ₹१ (100 पैसे).",
      examType: "Police Bharti",
      language: "mr",
      durationMinutes: 90,
      totalQuestions: 25,
      totalMarks: 25,
      negativeMarks: 0,
      isFree: false,
      price: 1.0,
      status: "LIVE",
      visibilityMode: "GLOBAL",
      createdBy: admin.id,
    },
  });

  console.log(`✅ Paid Exam created/updated: ID = ${paidExam.id}, Slug = ${paidExam.slug}, Price = ₹${paidExam.price}`);

  // 2. Link 25 questions to this exam
  const questions = await prisma.question.findMany({
    where: { status: "PUBLISHED" },
    take: 25,
    include: { options: true },
  });

  if (questions.length > 0) {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await prisma.examQuestion.upsert({
        where: {
          examId_questionId: {
            examId: paidExam.id,
            questionId: q.id,
          },
        },
        update: { questionOrder: i + 1 },
        create: {
          examId: paidExam.id,
          questionId: q.id,
          questionOrder: i + 1,
          marks: q.marks || 1,
          negativeMarks: q.negativeMarks || 0,
        },
      });
    }
    console.log(`✅ Linked ${questions.length} questions to ${paidExam.slug}`);
  } else {
    console.log("⚠️ No published questions found to link. Please ensure questions are seeded.");
  }

  console.log("\n==================================================");
  console.log("🎉 Test Paid Exam Ready!");
  console.log(`- Slug: ${paidExam.slug}`);
  console.log(`- Title: ${paidExam.title}`);
  console.log(`- Price: ₹${paidExam.price} (100 paise)`);
  console.log(`- Direct Attempt URL: /exam/${paidExam.slug}/attempt`);
  console.log(`- Student Exams URL: /student/exams`);
  console.log("==================================================\n");
}

seedPaidExam()
  .catch((e) => {
    console.error("❌ Failed to seed paid exam:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
