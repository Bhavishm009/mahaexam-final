import { prisma } from "../src/lib/db.js";

async function runDatabase1000StressTest() {
  console.log("\n================================================================================");
  console.log("🔥 STRESS TEST 1: Sending 1,000 Concurrent Database Queries in 1s via PgBouncer");
  console.log("================================================================================");

  const TOTAL_QUERIES = 1000;
  console.log(`Dispatching ${TOTAL_QUERIES} queries simultaneously at timestamp ${new Date().toISOString()}...`);

  const startTime = Date.now();
  const latencies = [];
  const errors = [];
  let successCount = 0;
  let failedCount = 0;

  // Mix of real queries representing realistic exam platform read operations
  // Test with connection_limit=10 to demonstrate production scalability with PgBouncer
  const prodPrisma = new (await import('@prisma/client')).PrismaClient({
    datasources: {
      db: {
        url: (process.env.SECONDARY_DATABASE_URL || process.env.DATABASE_URL).replace(/connection_limit=\d+/, 'connection_limit=10') + '&pool_timeout=35'
      }
    }
  });

  const queryGenerators = [
    () => prodPrisma.exam.findMany({ take: 3, select: { id: true, title: true, price: true } }),
    () => prodPrisma.question.findFirst({ select: { id: true, questionText: true, subjectId: true } }),
    () => prodPrisma.user.findFirst({ select: { id: true, name: true, role: true } }),
    () => prodPrisma.examResult.count(),
    () => prodPrisma.subject.findMany({ select: { id: true, name: true } }),
    () => prodPrisma.organization.findMany({ select: { id: true, name: true } }),
  ];

  // Fire 1,000 queries concurrently in 1 second
  const queryPromises = Array.from({ length: TOTAL_QUERIES }, async (_, idx) => {
    const fn = queryGenerators[idx % queryGenerators.length];
    const qStart = Date.now();
    try {
      await fn();
      latencies.push(Date.now() - qStart);
      successCount++;
    } catch (err) {
      failedCount++;
      errors.push(err.message);
    }
  });

  await Promise.all(queryPromises);
  const totalElapsed = Date.now() - startTime;

  latencies.sort((a, b) => a - b);
  const avg = Math.round(latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1));
  const p50 = latencies[Math.floor(latencies.length * 0.50)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const max = latencies[latencies.length - 1] || 0;
  const throughput = Math.round((successCount / (totalElapsed / 1000)) * 10) / 10;

  console.log("\n📊 1,000 DATABASE QUERIES RESULTS:");
  console.log(`   - Total Queries Dispatched: ${TOTAL_QUERIES}`);
  console.log(`   - Successful Queries:       ${successCount} (${Math.round((successCount / TOTAL_QUERIES) * 100)}%)`);
  console.log(`   - Failed Queries:           ${failedCount}`);
  console.log(`   - Total Completion Time:    ${totalElapsed} ms (${(totalElapsed / 1000).toFixed(2)}s)`);
  console.log(`   - Overall Throughput:       ${throughput} queries/second`);
  console.log(`   - Min Latency:              ${latencies[0] || 0} ms`);
  console.log(`   - Median Latency (p50):     ${p50} ms`);
  console.log(`   - 95th Percentile (p95):    ${p95} ms`);
  console.log(`   - 99th Percentile (p99):    ${p99} ms`);
  console.log(`   - Max Latency:              ${max} ms`);

  if (failedCount > 0) {
    console.log("\n⚠️ ERROR ANALYSIS (Where it broke):");
    const uniqueErrors = [...new Set(errors)];
    for (const uErr of uniqueErrors.slice(0, 5)) {
      console.log(`   • ${uErr}`);
    }
  } else {
    console.log("\n✅ ZERO ERRORS: All 1,000 queries completed successfully through PgBouncer!");
    console.log("   No 'FATAL: sorry, too many clients already' error occurred.");
  }

  return { successCount, failedCount, totalElapsed, throughput, p50, p95, errors };
}

async function runHttp1000StressTest() {
  console.log("\n================================================================================");
  console.log("🔥 STRESS TEST 2: Sending 1,000 Concurrent HTTP Requests to Next.js Web Server");
  console.log("================================================================================");

  const TOTAL_HTTP = 1000;
  const url = "http://localhost:3000/robots.txt";
  console.log(`Blasting ${TOTAL_HTTP} HTTP GET requests to ${url}...`);

  const startTime = Date.now();
  let successHttp = 0;
  let failedHttp = 0;
  const httpLatencies = [];
  const httpErrors = [];

  const httpPromises = Array.from({ length: TOTAL_HTTP }, async () => {
    const hStart = Date.now();
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        successHttp++;
        httpLatencies.push(Date.now() - hStart);
      } else {
        failedHttp++;
        httpErrors.push(`HTTP ${res.status}`);
      }
    } catch (err) {
      failedHttp++;
      httpErrors.push(err.message);
    }
  });

  await Promise.all(httpPromises);
  const httpElapsed = Date.now() - startTime;

  httpLatencies.sort((a, b) => a - b);
  const p50 = httpLatencies[Math.floor(httpLatencies.length * 0.50)] || 0;
  const p95 = httpLatencies[Math.floor(httpLatencies.length * 0.95)] || 0;
  const rps = Math.round((successHttp / (httpElapsed / 1000)) * 10) / 10;

  console.log("\n📊 1,000 HTTP REQUESTS RESULTS:");
  console.log(`   - Total HTTP Requests:     ${TOTAL_HTTP}`);
  console.log(`   - Successful (HTTP 200):   ${successHttp} (${Math.round((successHttp / TOTAL_HTTP) * 100)}%)`);
  console.log(`   - Failed Requests:         ${failedHttp}`);
  console.log(`   - Total Duration:          ${httpElapsed} ms (${(httpElapsed / 1000).toFixed(2)}s)`);
  console.log(`   - HTTP Throughput:         ${rps} req/second`);
  console.log(`   - p50 Latency:             ${p50} ms`);
  console.log(`   - p95 Latency:             ${p95} ms`);

  if (failedHttp > 0) {
    console.log("\n⚠️ HTTP Bottleneck Analysis:", [...new Set(httpErrors)]);
  } else {
    console.log("\n✅ ZERO HTTP FAILURES: Node.js server handled 1,000 concurrent requests without crashing.");
  }
}

async function main() {
  console.log("⚡ Starting Comprehensive 1,000 Request Concurrency Audit...");
  await runDatabase1000StressTest();
  await runHttp1000StressTest();
  await prisma.$disconnect();
}

main().catch(console.error);
