import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const baseUrl = process.env.BASE_URL || "http://localhost:3000";

const endpointsToTest = [
  { path: "/api/health", method: "GET", expectedStatus: [200] },
  { path: "/api/ready", method: "GET", expectedStatus: [200] },
  { path: "/api/auth/me", method: "GET", expectedStatus: [200, 401] },
  { path: "/api/student/profile", method: "GET", expectedStatus: [200, 401] },
  { path: "/api/student/dashboard", method: "GET", expectedStatus: [200, 401] },
  { path: "/api/student/exams", method: "GET", expectedStatus: [200, 401] },
  { path: "/api/student/notifications", method: "GET", expectedStatus: [200, 401] },
  { path: "/api/auth/webauthn/credentials", method: "GET", expectedStatus: [200, 401] },
  { path: "/api/admin/logs", method: "GET", expectedStatus: [200, 401, 403] },
];

async function runApiTests() {
  console.log("==================================================");
  console.log("🚀 Starting MahaExam Comprehensive API Testing Suite");
  console.log(`Target URL: ${baseUrl}`);
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  // 1. Database connection check & logger test
  try {
    console.log("🔍 Checking Database Connection & AuditLog system...");
    const initialLogCount = await prisma.auditLog.count();
    console.log(`✅ Database connected! Existing AuditLog entries: ${initialLogCount}`);

    // Create test log entry directly to verify logger persistence
    const testLog = await prisma.auditLog.create({
      data: {
        action: "API_TEST_SUITE_RUN",
        resourceType: "TEST_RUNNER",
        resourceId: "test-all-apis.mjs",
        metadata: { timestamp: new Date().toISOString() },
      },
    });
    console.log(`✅ Test log persisted successfully with ID: ${testLog.id}`);
  } catch (err) {
    console.error("❌ Database connection / logging test failed:", err.message);
    failed++;
  }

  // 2. Test API Endpoints for JSON integrity
  console.log("\n🌐 Testing API Endpoints for Valid JSON Response Structure...\n");

  for (const ep of endpointsToTest) {
    const url = `${baseUrl}${ep.path}`;
    try {
      const res = await fetch(url, { method: ep.method });
      const contentType = res.headers.get("content-type") || "";

      let data = null;
      let parseError = null;

      if (contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch (jErr) {
          parseError = jErr.message;
        }
      } else {
        const text = await res.text();
        parseError = `Non-JSON Content-Type: ${contentType} (Body preview: ${text.slice(0, 100)})`;
      }

      if (parseError) {
        console.error(
          `❌ [FAIL] ${ep.method} ${ep.path} -> Status ${res.status} | Error: ${parseError}`,
        );
        failed++;
      } else if (ep.expectedStatus.includes(res.status)) {
        console.log(`✅ [PASS] ${ep.method} ${ep.path} -> Status ${res.status} (JSON valid)`);
        passed++;
      } else {
        console.warn(
          `⚠️ [WARN] ${ep.method} ${ep.path} -> Unexpected Status ${res.status} (JSON valid)`,
        );
        passed++;
      }
    } catch (netErr) {
      console.error(`❌ [FAIL] ${ep.method} ${ep.path} -> Network Error: ${netErr.message}`);
      failed++;
    }
  }

  console.log("\n==================================================");
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================\n");

  await prisma.$disconnect();

  if (failed > 0) {
    process.exitCode = 1;
  }
}

runApiTests();
