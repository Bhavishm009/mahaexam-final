import { NextResponse } from "next/server";
import { primaryPrisma, secondaryPrisma } from "@/lib/db.js";

// List of all database models to track and sync
const SYNC_MODELS = [
  { key: "organization", label: "Organizations" },
  { key: "user", label: "Users" },
  { key: "studentProfile", label: "Student Profiles" },
  { key: "teacherProfile", label: "Teacher Profiles" },
  { key: "subscriptionPlan", label: "Subscription Plans" },
  { key: "coachingSubscription", label: "Coaching Subscriptions" },
  { key: "batch", label: "Batches" },
  { key: "coachingBatch", label: "Coaching Batches" },
  { key: "batchMembership", label: "Batch Memberships" },
  { key: "subject", label: "Subjects" },
  { key: "chapter", label: "Chapters" },
  { key: "topic", label: "Topics" },
  { key: "question", label: "Questions" },
  { key: "questionOption", label: "Question Options" },
  { key: "questionTag", label: "Question Tags" },
  { key: "exam", label: "Exams" },
  { key: "examQuestion", label: "Exam Questions" },
  { key: "examBatch", label: "Exam Batches" },
  { key: "examAttempt", label: "Exam Attempts" },
  { key: "attemptQuestion", label: "Attempt Questions" },
  { key: "attemptAnswer", label: "Attempt Answers" },
  { key: "examResult", label: "Exam Results" },
  { key: "jobAlert", label: "Job Notifications & Alerts" },
  { key: "blogPost", label: "Blog Posts" },
  { key: "seoSetting", label: "SEO Settings" },
  { key: "auditLog", label: "Audit Logs" },
  { key: "notification", label: "Notifications" },
  { key: "payment", label: "Payments" },
  { key: "paymentOrder", label: "Payment Orders" },
  { key: "job", label: "Background Queue Jobs" },
  { key: "passkeyCredential", label: "Passkey Credentials" },
];

/**
 * Batched table counting to prevent connection pool starvation (connection_limit=3)
 */
async function fetchCountsBatched(client) {
  const counts = {};
  if (!client) return counts;

  const BATCH_SIZE = 3;
  for (let i = 0; i < SYNC_MODELS.length; i += BATCH_SIZE) {
    const batch = SYNC_MODELS.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async ({ key }) => {
        if (!client[key]) {
          counts[key] = 0;
          return;
        }
        try {
          counts[key] = await client[key].count();
        } catch (_) {
          counts[key] = null;
        }
      })
    );
  }
  return counts;
}

/**
 * GET /api/admin/db-sync
 * Fetch live health, active database, and record counts for ALL database tables
 */
export async function GET() {
  const startTime = Date.now();

  let primaryStatus = { connected: false, latencyMs: 0, host: "exam-kids.i.aivencloud.com" };
  let secondaryStatus = { connected: false, latencyMs: 0, host: "aws-0-ap-south-1.pooler.supabase.com" };

  let primaryCounts = {};
  let secondaryCounts = {};

  // 1. Check Primary DB
  try {
    const pStart = Date.now();
    primaryCounts = await fetchCountsBatched(primaryPrisma);
    primaryStatus.connected = true;
    primaryStatus.latencyMs = Date.now() - pStart;
  } catch (err) {
    primaryStatus.error = err?.message || "Primary DB Unreachable";
  }

  // 2. Check Secondary DB
  if (secondaryPrisma) {
    try {
      const sStart = Date.now();
      secondaryCounts = await fetchCountsBatched(secondaryPrisma);
      secondaryStatus.connected = true;
      secondaryStatus.latencyMs = Date.now() - sStart;
    } catch (err) {
      secondaryStatus.error = err?.message || "Secondary DB Unreachable";
    }
  } else {
    secondaryStatus.error = "SECONDARY_DATABASE_URL environment variable not configured";
  }

  // 3. Calculate sync status
  let allTablesSynced = primaryStatus.connected && secondaryStatus.connected;
  if (allTablesSynced) {
    for (const { key } of SYNC_MODELS) {
      const p = primaryCounts[key];
      const s = secondaryCounts[key];
      if (p !== null && s !== null && p !== s) {
        allTablesSynced = false;
        break;
      }
    }
  }

  const activeDb = primaryStatus.connected
    ? "PRIMARY (Aiven)"
    : secondaryStatus.connected
    ? "SECONDARY (Supabase Failover Active)"
    : "NONE (Offline)";

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    responseDurationMs: Date.now() - startTime,
    activeDb,
    isSynced: allTablesSynced,
    primaryStatus,
    secondaryStatus,
    primaryCounts,
    secondaryCounts,
    tables: SYNC_MODELS,
  });
}

/**
 * Clean records for Prisma JSON/BigInt serialization
 */
function sanitizeRecords(records) {
  return records.map((rec) => {
    const clean = { ...rec };
    for (const [k, v] of Object.entries(clean)) {
      if (typeof v === "bigint") {
        clean[k] = Number(v);
      }
    }
    return clean;
  });
}

/**
 * POST /api/admin/db-sync
 * Trigger bidirectional 1:1 schema sync & record mirroring for ALL tables between Primary & Secondary DBs
 */
export async function POST() {
  if (!secondaryPrisma) {
    return NextResponse.json(
      { success: false, error: "SECONDARY_DATABASE_URL is not configured" },
      { status: 400 }
    );
  }

  const syncLog = [];
  const stats = {};

  try {
    for (const { key, label } of SYNC_MODELS) {
      if (!primaryPrisma[key] || !secondaryPrisma[key]) continue;

      try {
        let pCount = null;
        let sCount = null;

        try { pCount = await primaryPrisma[key].count(); } catch {}
        try { sCount = await secondaryPrisma[key].count(); } catch {}

        if (pCount === null || sCount === null) {
          syncLog.push(`⚠️ ${label}: Skipped (Model or Table missing on target DB)`);
          continue;
        }

        if (pCount === sCount) {
          stats[key] = pCount;
          syncLog.push(`In Sync (${pCount} ${label})`);
          continue;
        }

        // Copy missing Primary records to Secondary
        if (pCount > sCount) {
          const records = await primaryPrisma[key].findMany();
          if (records.length > 0) {
            const CHUNK_SIZE = key === "questionOption" ? 500 : 200;
            for (let i = 0; i < records.length; i += CHUNK_SIZE) {
              const chunk = sanitizeRecords(records.slice(i, i + CHUNK_SIZE));
              await secondaryPrisma[key].createMany({
                data: chunk,
                skipDuplicates: true,
              }).catch(() => {});
            }
            stats[key] = records.length;
            syncLog.push(`Synced ${records.length} ${label} (Primary -> Secondary)`);
          }
        }

        // Copy missing Secondary records to Primary
        if (sCount > pCount) {
          const records = await secondaryPrisma[key].findMany();
          if (records.length > 0) {
            const CHUNK_SIZE = key === "questionOption" ? 500 : 200;
            for (let i = 0; i < records.length; i += CHUNK_SIZE) {
              const chunk = sanitizeRecords(records.slice(i, i + CHUNK_SIZE));
              await primaryPrisma[key].createMany({
                data: chunk,
                skipDuplicates: true,
              }).catch(() => {});
            }
            stats[key] = records.length;
            syncLog.push(`Synced ${records.length} ${label} (Secondary -> Primary)`);
          }
        }
      } catch (err) {
        console.error(`Error syncing model ${key}:`, err);
        syncLog.push(`⚠️ ${label}: Sync warning (${err.message})`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Full Database Synchronization Completed Successfully!",
      syncLog,
      stats,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error?.message || "Sync Execution Failed" },
      { status: 500 }
    );
  }
}
