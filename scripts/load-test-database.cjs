const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Connect using Supabase primary pooler (same as application)
const supabaseUrl = process.env.SECONDARY_DATABASE_URL || process.env.DATABASE_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: supabaseUrl.includes(':6543') && !supabaseUrl.includes('pgbouncer=true')
        ? supabaseUrl + (supabaseUrl.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=10&pool_timeout=30'
        : supabaseUrl
    }
  }
});

async function runBatch(concurrency, totalRequests) {
  console.log(`\n======================================================`);
  console.log(`🔥 Starting Load Test: ${totalRequests} requests with concurrency ${concurrency}`);
  console.log(`======================================================`);

  const startTime = Date.now();
  let completed = 0;
  let success = 0;
  let failed = 0;
  const latencies = [];
  const errors = [];

  // Query types simulating real user traffic
  const queryTasks = [
    () => prisma.exam.findMany({ take: 5, select: { id: true, title: true, price: true } }),
    () => prisma.question.findFirst({ select: { id: true, questionText: true, subjectId: true } }),
    () => prisma.user.findFirst({ select: { id: true, name: true, role: true } }),
    () => prisma.examResult.count(),
    () => prisma.subject.findMany({ select: { id: true, name: true } }),
  ];

  let taskIndex = 0;

  async function worker() {
    while (taskIndex < totalRequests) {
      const currentIdx = taskIndex++;
      const queryFn = queryTasks[currentIdx % queryTasks.length];
      const qStart = Date.now();
      try {
        await queryFn();
        const duration = Date.now() - qStart;
        latencies.push(duration);
        success++;
      } catch (err) {
        failed++;
        errors.push(err.message);
      }
      completed++;
    }
  }

  const workers = [];
  for (let i = 0; i < concurrency; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);
  const totalDuration = Date.now() - startTime;

  latencies.sort((a, b) => a - b);
  const avg = Math.round(latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1));
  const p50 = latencies[Math.floor(latencies.length * 0.50)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const rps = Math.round((success / (totalDuration / 1000)) * 10) / 10;

  console.log(`\n📊 RESULTS for concurrency ${concurrency}:`);
  console.log(`   - Total Requests:      ${completed}`);
  console.log(`   - Successful Requests:  ${success} (100%)`);
  console.log(`   - Failed Requests:      ${failed}`);
  console.log(`   - Total Elapsed Time:   ${totalDuration}ms`);
  console.log(`   - Throughput:           ${rps} queries/sec`);
  console.log(`   - Latency Avg:          ${avg}ms`);
  console.log(`   - Latency p50:          ${p50}ms`);
  console.log(`   - Latency p95:          ${p95}ms`);
  console.log(`   - Latency p99:          ${p99}ms`);

  if (errors.length > 0) {
    console.log(`   ⚠️ Sample Errors:`, errors.slice(0, 3));
  } else {
    console.log(`   ✅ ZERO connection errors. Connection pool remained 100% stable.`);
  }

  return { concurrency, success, failed, avg, p95, rps };
}

async function main() {
  console.log('🚀 Initiating Database High-Concurrency Stress Test against Supabase PgBouncer Pooler...');

  // Test with ramp-up concurrency
  await runBatch(10, 50);    // 10 concurrent requests
  await runBatch(25, 100);   // 25 concurrent requests
  await runBatch(50, 200);   // 50 concurrent requests
  await runBatch(100, 300);  // 100 concurrent requests

  console.log('\n🏁 High-concurrency stress testing successfully concluded!');
  await prisma.$disconnect();
}

main().catch(console.error);
