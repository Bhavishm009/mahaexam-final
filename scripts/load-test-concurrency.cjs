/**
 * High-Concurrency Load Testing Suite for MahaExam Platform
 * Tests system throughput, latency distribution, connection pooling, and Edge CDN behavior.
 */

const http = require("http");
const https = require("https");
const { URL } = require("url");

const TARGET_URL = process.env.TEST_URL || "https://mahaexam-final.vercel.app";
const TOTAL_REQUESTS = parseInt(process.env.CONCURRENT_TOTAL || "500", 10);
const CONCURRENCY = parseInt(process.env.CONCURRENCY_LEVEL || "50", 10);

const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 100 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 100 });

function fetchUrl(targetUrl, options = {}) {
  return new Promise((resolve) => {
    const start = Date.now();
    const parsed = new URL(targetUrl);
    const isHttps = parsed.protocol === "https:";
    const agent = isHttps ? httpsAgent : httpAgent;

    const req = (isHttps ? https : http).request(
      parsed,
      {
        method: options.method || "GET",
        agent,
        headers: {
          "User-Agent": "MahaExamLoadTester/2.0",
          Accept: "*/*",
          ...(options.headers || {}),
        },
        timeout: 10000,
      },
      (res) => {
        let size = 0;
        res.on("data", (chunk) => {
          size += chunk.length;
        });
        res.on("end", () => {
          const duration = Date.now() - start;
          resolve({
            statusCode: res.statusCode,
            duration,
            size,
            headers: res.headers,
            error: null,
          });
        });
      },
    );

    req.on("error", (err) => {
      resolve({
        statusCode: 0,
        duration: Date.now() - start,
        size: 0,
        headers: {},
        error: err.message,
      });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({
        statusCode: 408,
        duration: Date.now() - start,
        size: 0,
        headers: {},
        error: "TIMEOUT",
      });
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runWorker(tasks, results) {
  for (const task of tasks) {
    const res = await fetchUrl(task.url, task.options);
    results.push(res);
  }
}

async function runBenchmark(
  name,
  targetUrl,
  options = {},
  count = TOTAL_REQUESTS,
  concurrency = CONCURRENCY,
) {
  console.log(`\n======================================================================`);
  console.log(`[LOAD TEST] Benchmark: ${name}`);
  console.log(`Target: ${targetUrl}`);
  console.log(`Requests: ${count} | Concurrency: ${concurrency}`);
  console.log(`======================================================================`);

  const tasks = Array.from({ length: count }, () => ({
    url: targetUrl,
    options,
  }));

  const chunks = Array.from({ length: concurrency }, () => []);
  tasks.forEach((task, index) => {
    chunks[index % concurrency].push(task);
  });

  const results = [];
  const startGlobal = Date.now();

  await Promise.all(chunks.map((workerTasks) => runWorker(workerTasks, results)));

  const totalTimeSec = (Date.now() - startGlobal) / 1000;
  const durations = results.map((r) => r.duration).sort((a, b) => a - b);
  const statusCodes = {};
  let errors = 0;

  for (const r of results) {
    statusCodes[r.statusCode] = (statusCodes[r.statusCode] || 0) + 1;
    if (r.error || r.statusCode >= 500 || r.statusCode === 0) {
      errors++;
    }
  }

  const p50 = durations[Math.floor(durations.length * 0.5)] || 0;
  const p90 = durations[Math.floor(durations.length * 0.9)] || 0;
  const p95 = durations[Math.floor(durations.length * 0.95)] || 0;
  const p99 = durations[Math.floor(durations.length * 0.99)] || 0;
  const min = durations[0] || 0;
  const max = durations[durations.length - 1] || 0;
  const rps = (results.length / totalTimeSec).toFixed(2);

  console.log(`Total Time:     ${totalTimeSec.toFixed(2)}s`);
  console.log(`Throughput:     ${rps} req/sec`);
  console.log(`Status Codes:  `, JSON.stringify(statusCodes));
  console.log(`Error Count:    ${errors} (${((errors / results.length) * 100).toFixed(2)}%)`);
  console.log(`Latency Min:    ${min} ms`);
  console.log(`Latency p50:    ${p50} ms`);
  console.log(`Latency p90:    ${p90} ms`);
  console.log(`Latency p95:    ${p95} ms`);
  console.log(`Latency p99:    ${p99} ms`);
  console.log(`Latency Max:    ${max} ms`);

  return {
    name,
    count,
    concurrency,
    rps,
    p50,
    p95,
    p99,
    errors,
    statusCodes,
  };
}

async function main() {
  console.log("Starting MahaExam Concurrency & Scalability Load Tests...");
  console.log("Base URL:", TARGET_URL);

  const reports = [];

  // Test 1: Health & Edge Readiness Check
  reports.push(
    await runBenchmark(
      "Edge Health Endpoint",
      `${TARGET_URL}/api/health`,
      { method: "GET" },
      200,
      25,
    ),
  );

  // Test 2: Dynamic OpenGraph Image Generation & Edge Cache
  reports.push(
    await runBenchmark(
      "Dynamic OpenGraph Image (Edge Cache)",
      `${TARGET_URL}/opengraph-image`,
      { method: "GET" },
      200,
      25,
    ),
  );

  // Test 3: Static Fallback OG Image
  reports.push(
    await runBenchmark(
      "Static OG Image (/og-image.png)",
      `${TARGET_URL}/og-image.png`,
      { method: "GET" },
      200,
      25,
    ),
  );

  // Test 4: Database Ready Endpoint
  reports.push(
    await runBenchmark(
      "Database Readiness (Supabase Transaction Pooler)",
      `${TARGET_URL}/api/ready`,
      { method: "GET" },
      150,
      15,
    ),
  );

  // Test 5: Authentication Session Endpoint
  reports.push(
    await runBenchmark(
      "Auth Session Verification (/api/auth/me)",
      `${TARGET_URL}/api/auth/me`,
      { method: "GET" },
      150,
      15,
    ),
  );

  console.log("\n======================================================================");
  console.log("LOAD TEST SUMMARY MATRIX");
  console.log("======================================================================");
  console.table(
    reports.map((r) => ({
      Benchmark: r.name,
      Requests: r.count,
      Concurrency: r.concurrency,
      "RPS (req/s)": r.rps,
      "p50 (ms)": r.p50,
      "p95 (ms)": r.p95,
      "p99 (ms)": r.p99,
      Errors: r.errors,
    })),
  );
}

main().catch((err) => {
  console.error("Fatal load testing error:", err);
  process.exit(1);
});
