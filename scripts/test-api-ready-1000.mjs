async function testFullStack1000Http() {
  console.log("================================================================================");
  console.log("🔥 STRESS TEST 3: Blasting 1,000 HTTP Requests to /api/ready (Database SELECT 1)");
  console.log("================================================================================");

  const TOTAL_REQS = 1000;
  const url = "http://localhost:3000/api/ready";
  console.log(`Sending ${TOTAL_REQS} concurrent HTTP GET requests to ${url}...`);

  const startTime = Date.now();
  let successCount = 0;
  let failedCount = 0;
  const latencies = [];
  const errorDetails = [];

  const promises = Array.from({ length: TOTAL_REQS }, async (_, i) => {
    const qStart = Date.now();
    try {
      const res = await fetch(url, { cache: "no-store" });
      const elapsed = Date.now() - qStart;
      latencies.push(elapsed);
      if (res.ok) {
        const body = await res.json();
        if (body.status === "ready" && body.database === "ok") {
          successCount++;
        } else {
          failedCount++;
          errorDetails.push(`Unexpected body: ${JSON.stringify(body)}`);
        }
      } else {
        failedCount++;
        errorDetails.push(`HTTP ${res.status}`);
      }
    } catch (err) {
      failedCount++;
      errorDetails.push(err.message);
    }
  });

  await Promise.all(promises);
  const totalElapsed = Date.now() - startTime;

  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.50)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const rps = Math.round((successCount / (totalElapsed / 1000)) * 10) / 10;

  console.log("\n📊 1,000 FULL-STACK HTTP -> DB REQUEST RESULTS:");
  console.log(`   - Total Requests Sent:   ${TOTAL_REQS}`);
  console.log(`   - Successful (HTTP 200): ${successCount} (${Math.round((successCount / TOTAL_REQS) * 100)}%)`);
  console.log(`   - Failed Requests:       ${failedCount}`);
  console.log(`   - Total Duration:        ${totalElapsed} ms (${(totalElapsed / 1000).toFixed(2)}s)`);
  console.log(`   - End-to-End Throughput: ${rps} req/second`);
  console.log(`   - p50 Latency:           ${p50} ms`);
  console.log(`   - p95 Latency:           ${p95} ms`);
  console.log(`   - p99 Latency:           ${p99} ms`);

  if (failedCount > 0) {
    console.log("\n⚠️ Error breakdown:", [...new Set(errorDetails)]);
  } else {
    console.log("\n✅ ZERO FAILURES: 1,000 end-to-end HTTP + Database queries handled successfully!");
  }
}

testFullStack1000Http().catch(console.error);
