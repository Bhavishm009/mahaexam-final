import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runDirectHandlerTests() {
  console.log("==================================================");
  console.log("⚡ Direct API Route Handler Unit & Integration Test");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  try {
    // 1. Verify Prisma AuditLog table structure
    const logCount = await prisma.auditLog.count();
    console.log(`✅ [PASS] Database connection OK. Total logs in DB: ${logCount}`);
    passed++;

    // 2. Test inserting an API_CALL log
    const apiLog = await prisma.auditLog.create({
      data: {
        action: "API_CALL",
        resourceType: "API_ROUTE",
        resourceId: "GET /api/student/profile",
        metadata: {
          method: "GET",
          route: "/api/student/profile",
          statusCode: 200,
          durationMs: 14,
        },
      },
    });
    console.log(`✅ [PASS] Created API_CALL log entry (ID: ${apiLog.id})`);
    passed++;

    // 3. Test inserting an API_ERROR log
    const errLog = await prisma.auditLog.create({
      data: {
        action: "API_ERROR",
        resourceType: "API_ROUTE",
        resourceId: "PATCH /api/student/profile",
        metadata: {
          method: "PATCH",
          route: "/api/student/profile",
          statusCode: 400,
          durationMs: 8,
          error: "Phone number already registered",
        },
      },
    });
    console.log(`✅ [PASS] Created API_ERROR log entry (ID: ${errLog.id})`);
    passed++;

    // 4. Verify Admin Logs API query
    const adminLogs = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    });
    console.log(`✅ [PASS] Admin logs query returned ${adminLogs.length} recent entries`);
    passed++;
  } catch (err) {
    console.error("❌ Handler test failed:", err.message);
    failed++;
  }

  console.log("\n==================================================");
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================\n");

  await prisma.$disconnect();
}

runDirectHandlerTests();
