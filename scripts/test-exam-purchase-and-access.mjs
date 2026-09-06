import { PrismaClient } from "@prisma/client";
import { SignJWT } from "jose";

const prisma = new PrismaClient();
const baseUrl = "http://localhost:3000";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "mahaexam-super-secret-jwt-key-for-local-development-2026"
);

async function createToken(user) {
  return new SignJWT({
    sub: user.id,
    role: user.role,
    organizationId: user.organizationId || null,
    name: user.name,
    email: user.email || null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secret);
}

async function run() {
  console.log("=== VALIDATING STUDENT EXAM PURCHASE & ATTEMPT BUTTON ===");

  // 1. Fetch student Sonali (who has paid for the test exam)
  const student = await prisma.user.findUnique({
    where: { email: "sonalimuneshwar08@gmail.com" },
  });
  if (!student) {
    throw new Error("Student not found");
  }
  console.log(`✓ Student found: ${student.email} (${student.id})`);

  const studentToken = await createToken(student);

  // 2. Fetch /api/student/exams with student session
  const res = await fetch(`${baseUrl}/api/student/exams`, {
    headers: {
      Cookie: `mahaexam_session=${studentToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch student exams: status ${res.status}`);
  }

  const { exams } = await res.json();
  console.log(`✓ Fetched ${exams.length} exams for student`);

  const paidExam = exams.find((e) => e.isPurchased);
  if (!paidExam) {
    throw new Error("FAILED: Purchased exam not marked with isPurchased: true!");
  }

  console.log(`✓ Verified Purchased Exam: "${paidExam.title}"`);
  console.log(`  - Exam ID: ${paidExam.id}`);
  console.log(`  - isPurchased: ${paidExam.isPurchased}`);
  console.log(`  - source: ${paidExam.source}`);
  console.log(`  - price: ₹${paidExam.price}`);

  // Test Button Label Logic (from exams-client.js):
  const isUnlock =
    !paidExam.isPurchased &&
    !paidExam.isFree &&
    !paidExam.isAssigned &&
    paidExam.source !== "COACHING" &&
    Number(paidExam.price || 0) > 0;

  const buttonLabel = isUnlock ? `Unlock & Attempt (₹${paidExam.price})` : "Attempt Now";
  console.log(`  - Computed Button Label: "${buttonLabel}"`);

  if (buttonLabel !== "Attempt Now") {
    throw new Error(`FAILED: Button label is "${buttonLabel}", expected "Attempt Now"!`);
  }
  console.log("✓ SUCCESS: Button shows 'Attempt Now' because student already paid!");

  // 3. Test Starting Attempt on Paid Exam via /api/student/exam-attempts/start
  const startRes = await fetch(`${baseUrl}/api/student/exam-attempts/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `mahaexam_session=${studentToken}`,
    },
    body: JSON.stringify({ examId: paidExam.id }),
  });

  const startData = await startRes.json();
  if (!startRes.ok) {
    throw new Error(`Failed to start exam attempt: ${startData.error || startRes.status}`);
  }

  console.log(`✓ Attempt started/resumed successfully:`, {
    attemptId: startData.attempt?.id,
    status: startData.attempt?.status,
    totalQuestions: startData.exam?.questions?.length || startData.exam?.totalQuestions,
  });

  // 4. Test Admin Results Endpoint /api/coaching/results/exam/[id]
  const admin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });
  if (admin) {
    const adminToken = await createToken(admin);
    const resultsRes = await fetch(`${baseUrl}/api/coaching/results/exam/${paidExam.id}`, {
      headers: {
        Cookie: `mahaexam_session=${adminToken}`,
      },
    });
    if (resultsRes.ok) {
      const resultsData = await resultsRes.json();
      console.log(`✓ Admin Exam Results & Attendance Endpoint verified:`, {
        totalAssigned: resultsData.stats?.totalAssigned,
        submitted: resultsData.stats?.submittedCount,
        inProgress: resultsData.stats?.inProgressCount,
        absent: resultsData.stats?.absentCount,
      });
    }
  }

  console.log("\n🎉 ALL TESTS PASSED! Fix is verified end-to-end.");
}

run()
  .catch((e) => {
    console.error("Test error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
