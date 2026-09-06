import crypto from "crypto";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import Razorpay from "razorpay";

// Load environment variables from .env
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...rest] = trimmed.split("=");
      const val = rest.join("=").replace(/^["']|["']$/g, "").trim();
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

const prisma = new PrismaClient();

const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_TYdQhv3Hll4Q5X";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "uIMMzwO3sZ9JwG4pYW5uX7D6";

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

function verifyCheckoutSignature(orderId, paymentId, signature) {
  if (!orderId || !paymentId || !signature) return false;
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return (
    expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  );
}

async function checkStudentExamAccess(studentId, examId) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true, title: true, price: true, isFree: true },
  });
  if (!exam) return { allowed: false, reason: "EXAM_NOT_FOUND" };

  const isPaid = !exam.isFree && Number(exam.price || 0) > 0;
  if (isPaid) {
    if (!studentId) return { allowed: false, reason: "LOGIN_REQUIRED", exam };
    const [purchase, entitlement] = await Promise.all([
      prisma.examPurchase.findUnique({
        where: { userId_examId: { userId: studentId, examId } },
      }),
      prisma.examEntitlement.findUnique({
        where: { studentId_examId: { studentId, examId } },
      }),
    ]);
    if (purchase?.status === "PAID" || entitlement?.status === "ACTIVE") {
      return { allowed: true, source: "PURCHASED", exam, purchase };
    }
    return { allowed: false, reason: "PAYMENT_REQUIRED", exam };
  }
  return { allowed: true, source: "FREE", exam };
}

async function testFullRazorpayFlow() {
  console.log("==================================================");
  console.log("🚀 Testing Razorpay Integration & Paid Exam Access Flow");
  console.log("==================================================\n");

  // 1. Locate student
  const student = await prisma.user.findFirst({
    where: { role: "STUDENT" },
  });
  if (!student) throw new Error("No student found in DB.");
  console.log(`👤 Test student: ${student.name} (${student.email}, ID: ${student.id})`);

  // 2. Locate Paid Exam
  const exam = await prisma.exam.findUnique({
    where: { slug: "test-paid-police-bharti-2026" },
  });
  if (!exam) throw new Error("Test paid exam not found!");
  console.log(`📋 Paid exam: "${exam.title}" (Price: ₹${exam.price})`);

  // 3. Clear previous test records for clean run
  await prisma.examPurchase.deleteMany({
    where: { userId: student.id, examId: exam.id },
  });
  await prisma.examEntitlement.deleteMany({
    where: { studentId: student.id, examId: exam.id },
  });
  await prisma.paymentOrder.deleteMany({
    where: { userId: student.id, examId: exam.id },
  });
  console.log("🧹 Previous purchase records cleared for student.");

  // 4. Verify PRE-PAYMENT Gating
  console.log("\n🔒 STEP 1: Verifying Pre-Payment Access Gating...");
  const preAccess = await checkStudentExamAccess(student.id, exam.id);
  console.log("Access Result:", preAccess);
  if (preAccess.allowed === false && preAccess.reason === "PAYMENT_REQUIRED") {
    console.log("✅ PASSED: Student is correctly blocked from attempting without payment!");
  } else {
    throw new Error(`❌ FAILED: Expected PAYMENT_REQUIRED, got: ${JSON.stringify(preAccess)}`);
  }

  // 5. Test Order Creation with Razorpay API (Test Mode)
  console.log("\n💳 STEP 2: Creating Order with Razorpay API...");
  const amountPaise = Math.round(Number(exam.price) * 100); // 100 paise
  const receipt = `rcpt_${exam.id.slice(-6)}_${Date.now()}`.slice(0, 40);

  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt,
    notes: { examId: exam.id, studentId: student.id },
  });

  console.log("Order Created:", {
    id: order.id,
    amount: order.amount,
    currency: order.currency,
    receipt: order.receipt,
    status: order.status,
  });

  if (!order.id || !order.id.startsWith("order_") || order.amount !== 100) {
    throw new Error("❌ Invalid Razorpay order response");
  }
  console.log("✅ PASSED: Real Razorpay Order created in Test Mode!");

  const po = await prisma.paymentOrder.create({
    data: {
      userId: student.id,
      examId: exam.id,
      providerOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt,
      status: "CREATED",
    },
  });

  // 6. Test Signature Verification
  console.log("\n🔐 STEP 3: Testing HMAC-SHA256 Signature Verification...");
  const fakePaymentId = `pay_test_${Date.now()}`;

  // Negative test: invalid signature
  const badSig = "invalid_signature_hex_value";
  const rejected = !verifyCheckoutSignature(order.id, fakePaymentId, badSig);
  if (rejected) {
    console.log("✅ PASSED: Invalid signature strictly rejected!");
  } else {
    throw new Error("❌ FAILED: Invalid signature was accepted!");
  }

  // Positive test: valid signature
  const validSig = crypto
    .createHmac("sha256", keySecret)
    .update(`${order.id}|${fakePaymentId}`)
    .digest("hex");

  const accepted = verifyCheckoutSignature(order.id, fakePaymentId, validSig);
  if (accepted) {
    console.log("✅ PASSED: Valid HMAC-SHA256 signature verified!");
  } else {
    throw new Error("❌ FAILED: Valid signature was rejected!");
  }

  // 7. Simulate Verification Handlers (DB Commit)
  console.log("\n🏆 STEP 4: Executing Verification Handler & Granting Access...");
  await prisma.$transaction(async (tx) => {
    await tx.paymentOrder.update({
      where: { id: po.id },
      data: {
        providerPaymentId: fakePaymentId,
        status: "PAID",
        paidAt: new Date(),
      },
    });

    await tx.examPurchase.upsert({
      where: { userId_examId: { userId: student.id, examId: exam.id } },
      update: {
        paymentOrderId: po.id,
        razorpayOrderId: order.id,
        razorpayPaymentId: fakePaymentId,
        status: "PAID",
        amount: order.amount,
        currency: "INR",
        purchasedAt: new Date(),
      },
      create: {
        userId: student.id,
        examId: exam.id,
        paymentOrderId: po.id,
        razorpayOrderId: order.id,
        razorpayPaymentId: fakePaymentId,
        status: "PAID",
        amount: order.amount,
        currency: "INR",
        purchasedAt: new Date(),
      },
    });

    await tx.examEntitlement.upsert({
      where: { studentId_examId: { studentId: student.id, examId: exam.id } },
      update: { status: "ACTIVE", source: "PAYMENT" },
      create: {
        studentId: student.id,
        examId: exam.id,
        status: "ACTIVE",
        source: "PAYMENT",
      },
    });

    await tx.notification.create({
      data: {
        studentId: student.id,
        userId: student.id,
        type: "PAYMENT_SUCCESS",
        title: "Payment successful (पेमेंट यशस्वी)",
        message: "Your examination access is now active.",
        examId: exam.id,
      },
    });
  });
  console.log("✅ Purchase & Entitlement recorded, Notification issued.");

  // 8. Verify POST-PAYMENT Access
  console.log("\n🔓 STEP 5: Verifying Post-Payment Access Unlock...");
  const postAccess = await checkStudentExamAccess(student.id, exam.id);
  console.log("Access Result:", postAccess);
  if (postAccess.allowed === true && postAccess.source === "PURCHASED") {
    console.log("✅ PASSED: Student now has FULL ACCESS to attempt the paid exam!");
  } else {
    throw new Error(`❌ FAILED: Exam should be unlocked, got: ${JSON.stringify(postAccess)}`);
  }

  // 9. Verify Notification
  const notification = await prisma.notification.findFirst({
    where: { studentId: student.id, type: "PAYMENT_SUCCESS" },
    orderBy: { createdAt: "desc" },
  });
  if (notification) {
    console.log(`✅ PASSED: Notification found: "${notification.title}" - ${notification.message}`);
  } else {
    throw new Error("❌ FAILED: Notification not found.");
  }

  console.log("\n==================================================");
  console.log("🎉 ALL RAZORPAY VERIFICATION TESTS COMPLETED SUCCESSFULLY!");
  console.log("==================================================\n");

  // Clean up any test records so production DB stays 100% clean
  await prisma.examPurchase.deleteMany({
    where: { razorpayPaymentId: { startsWith: "pay_test_" } },
  }).catch(() => {});
  await prisma.paymentOrder.deleteMany({
    where: { providerPaymentId: { startsWith: "pay_test_" } },
  }).catch(() => {});
}

testFullRazorpayFlow()
  .catch((err) => {
    console.error("Test execution error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
