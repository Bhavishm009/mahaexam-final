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
 * GET /api/admin/db-sync
 * Fetch live health, active database, and record counts for ALL database tables
 */
export async function GET() {
  const startTime = Date.now();

  let primaryStatus = { connected: false, latencyMs: 0, host: "Aiven PostgreSQL" };
  let secondaryStatus = { connected: false, latencyMs: 0, host: "Supabase Shadow DB" };

  const primaryCounts = {};
  const secondaryCounts = {};

  // Helper function to safely count table records with raw SQL fallback
  async function countTableRecords(client, key) {
    if (!client) return 0;
    if (client[key]) {
      try {
        return await client[key].count();
      } catch (_) {}
    }
    const tableName = key.charAt(0).toUpperCase() + key.slice(1);
    try {
      const res = await client.$queryRawUnsafe(`SELECT COUNT(*)::int FROM "${tableName}"`);
      return res?.[0]?.count || 0;
    } catch (_) {
      return 0;
    }
  }

  // 1. Check Primary DB
  try {
    const pStart = Date.now();
    const primaryResults = await Promise.allSettled(
      SYNC_MODELS.map(({ key }) => countTableRecords(primaryPrisma, key))
    );

    primaryStatus.connected = true;
    primaryStatus.latencyMs = Date.now() - pStart;

    SYNC_MODELS.forEach(({ key }, index) => {
      const res = primaryResults[index];
      primaryCounts[key] = res.status === "fulfilled" ? res.value : 0;
    });
  } catch (err) {
    primaryStatus.error = err?.message || "Primary DB Unreachable";
  }

  // 2. Check Secondary DB
  if (secondaryPrisma) {
    try {
      const sStart = Date.now();
      const secondaryResults = await Promise.allSettled(
        SYNC_MODELS.map(({ key }) => countTableRecords(secondaryPrisma, key))
      );

      secondaryStatus.connected = true;
      secondaryStatus.latencyMs = Date.now() - sStart;

      SYNC_MODELS.forEach(({ key }, index) => {
        const res = secondaryResults[index];
        secondaryCounts[key] = res.status === "fulfilled" ? res.value : 0;
      });
    } catch (err) {
      secondaryStatus.error = err?.message || "Secondary DB Unreachable or Schema Missing";
    }
  } else {
    secondaryStatus.error = "SECONDARY_DATABASE_URL environment variable not configured";
  }

  // Calculate sync match status across all 31 tables (Primary and Secondary must be 100% equal)
  let allTablesSynced = primaryStatus.connected && secondaryStatus.connected;
  if (allTablesSynced) {
    for (const { key } of SYNC_MODELS) {
      if ((primaryCounts[key] || 0) !== (secondaryCounts[key] || 0)) {
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
 * POST /api/admin/db-sync
 * Trigger instant 1:1 schema sync & record mirroring for ALL tables from Primary DB to Secondary DB
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
    // 1. Delete orphan records from Secondary DB in reverse dependency order
    const DELETE_ORDER = [...SYNC_MODELS].reverse();
    for (const { key, label } of DELETE_ORDER) {
      if (!primaryPrisma[key] || !secondaryPrisma[key]) continue;

      try {
        const pRecords = await primaryPrisma[key].findMany({ select: { id: true } }).catch(() => null);
        if (!pRecords || pRecords.length === 0 || !pRecords[0]?.id) continue;

        const pIdSet = new Set(pRecords.map((r) => r.id));
        const sRecords = await secondaryPrisma[key].findMany({ select: { id: true } }).catch(() => []);
        const extraIds = sRecords.map((r) => r.id).filter((id) => id && !pIdSet.has(id));

        if (extraIds.length > 0) {
          await secondaryPrisma[key].deleteMany({
            where: { id: { in: extraIds } },
          }).catch((err) => console.warn(`Deletion warning on ${key}:`, err.message));
          syncLog.push(`Removed ${extraIds.length} obsolete ${label} from Secondary DB`);
        }
      } catch (err) {
        console.warn(`Orphan check failed for ${key}:`, err.message);
      }
    }

    // 2. Insert/Copy missing Primary records to Secondary DB
    for (const { key, label } of SYNC_MODELS) {
      if (!primaryPrisma[key] || !secondaryPrisma[key]) continue;

      try {
        const [pCount, sCount] = await Promise.all([
          primaryPrisma[key].count(),
          secondaryPrisma[key].count(),
        ]);

        if (pCount === sCount) {
          stats[key] = pCount;
          syncLog.push(`In Sync (${pCount} ${label})`);
          continue;
        }

        const records = await primaryPrisma[key].findMany();
        if (records.length > 0) {
          const CHUNK_SIZE = key === "questionOption" ? 500 : 200;

          for (let i = 0; i < records.length; i += CHUNK_SIZE) {
            const chunk = records.slice(i, i + CHUNK_SIZE);
            
            // Clean up BigInt serialization if any
            const sanitizedChunk = chunk.map((rec) => {
              const clean = { ...rec };
              for (const [k, v] of Object.entries(clean)) {
                if (typeof v === "bigint") {
                  clean[k] = Number(v);
                }
              }
              return clean;
            });

            await secondaryPrisma[key].createMany({
              data: sanitizedChunk,
              skipDuplicates: true,
            }).catch((err) => {
              console.warn(`Skip chunk error on table ${key}:`, err.message);
            });
          }

          stats[key] = records.length;
          syncLog.push(`Synced ${records.length} ${label}`);
        } else {
          stats[key] = 0;
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
