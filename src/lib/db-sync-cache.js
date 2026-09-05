import { primaryPrisma, secondaryPrisma } from "./db.js";

// List of all database models to track and sync
export const SYNC_MODELS = [
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

const globalForCache = globalThis;

if (!globalForCache.__mahaDbSyncCache) {
  globalForCache.__mahaDbSyncCache = {
    lastCheckedAt: 0,
    data: null,
  };
}

/**
 * Invalidate the in-memory DB Sync Cache when write mutations occur
 */
export function invalidateDbSyncCache() {
  const cache = globalForCache.__mahaDbSyncCache;
  if (cache) {
    cache.lastCheckedAt = 0;
    cache.data = null;
  }
}

/**
 * Sequential table counting to guarantee exactly 1 connection is used
 */
async function fetchCountsSequential(client) {
  const counts = {};
  if (!client) return counts;

  for (const { key } of SYNC_MODELS) {
    if (!client[key]) {
      counts[key] = 0;
      continue;
    }
    try {
      counts[key] = await client[key].count();
    } catch (err) {
      counts[key] = null;
    }
  }
  return counts;
}

/**
 * Fetch or compute cached DB Sync & Health status (Cached for 1 Hour)
 */
export async function getOrComputeSyncStatus(forceRefresh = false) {
  const now = Date.now();
  const cache = globalForCache.__mahaDbSyncCache;

  // 1-hour cache TTL (3,600,000 ms)
  const CACHE_TTL_MS = 60 * 60 * 1000;

  if (!forceRefresh && cache.data && now - cache.lastCheckedAt < CACHE_TTL_MS) {
    return {
      ...cache.data,
      isCached: true,
      cachedAt: new Date(cache.lastCheckedAt).toISOString(),
    };
  }

  const startTime = Date.now();

  let primaryStatus = { connected: false, latencyMs: 0, host: "exam-kids.i.aivencloud.com" };
  let secondaryStatus = { connected: false, latencyMs: 0, host: "aws-0-ap-south-1.pooler.supabase.com" };

  let primaryCounts = {};
  let secondaryCounts = {};

  // 1. Ping Primary DB
  try {
    const pStart = Date.now();
    await primaryPrisma.$queryRaw`SELECT 1`;
    primaryStatus.connected = true;
    primaryStatus.latencyMs = Date.now() - pStart;
  } catch (err) {
    primaryStatus.connected = false;
    primaryStatus.error = err?.message || "Primary DB Unreachable";
  }

  // Fetch counts for Primary if connected
  if (primaryStatus.connected) {
    primaryCounts = await fetchCountsSequential(primaryPrisma);
  }

  // 2. Ping Secondary DB
  if (secondaryPrisma) {
    try {
      const sStart = Date.now();
      await secondaryPrisma.$queryRaw`SELECT 1`;
      secondaryStatus.connected = true;
      secondaryStatus.latencyMs = Date.now() - sStart;
    } catch (err) {
      secondaryStatus.connected = false;
      secondaryStatus.error = err?.message || "Secondary DB Unreachable";
    }

    if (secondaryStatus.connected) {
      secondaryCounts = await fetchCountsSequential(secondaryPrisma);
    }
  } else {
    secondaryStatus.error = "SECONDARY_DATABASE_URL environment variable not configured";
  }

  // 3. Calculate sync status (Core models + Log models)
  // Ephemeral logs (auditLog, notification, job) fluctuate rapidly and do not fail the core database sync state
  const EPHEMERAL_LOG_KEYS = new Set(["auditLog", "notification", "job"]);
  let allTablesSynced = primaryStatus.connected && secondaryStatus.connected;

  if (allTablesSynced) {
    for (const { key } of SYNC_MODELS) {
      if (EPHEMERAL_LOG_KEYS.has(key)) continue;
      const p = primaryCounts[key];
      const s = secondaryCounts[key];
      if (p !== null && s !== null && p !== s) {
        allTablesSynced = false;
        break;
      }
    }
  }

  // If Primary has reconnected while failover was active, trigger recovery workflow
  if (primaryStatus.connected && globalThis.__mahaDbFailover?.isFailoverActive) {
    try {
      const { handlePrimaryRecovery } = await import("./db.js");
      await handlePrimaryRecovery();
    } catch (_) {}
  }

  const activeDb = primaryStatus.connected
    ? "PRIMARY (Aiven)"
    : secondaryStatus.connected
    ? "SECONDARY (Supabase Failover Active)"
    : "NONE (Offline)";

  const failoverState = globalThis.__mahaDbFailover || {};
  const isFailoverActive = !primaryStatus.connected || !!failoverState.isFailoverActive;

  const failoverIncident = {
    isFailoverActive,
    startedAt: failoverState.failoverStartedAt || (!primaryStatus.connected ? new Date().toISOString() : null),
    reason: primaryStatus.error || failoverState.failoverReason || (isFailoverActive ? "Primary DB is offline" : null),
    activeDb,
    targetHost: secondaryStatus.host || "aws-0-ap-south-1.pooler.supabase.com",
    adminNotified: !!failoverState.adminNotified,
    lastNotifiedAt: failoverState.lastNotifiedAt ? new Date(failoverState.lastNotifiedAt).toISOString() : null,
    lastRecoveredAt: failoverState.lastRecoveredAt || null,
  };

  const result = {
    success: true,
    timestamp: new Date().toISOString(),
    responseDurationMs: Date.now() - startTime,
    activeDb,
    isSynced: allTablesSynced,
    failoverIncident,
    primaryStatus,
    secondaryStatus,
    primaryCounts,
    secondaryCounts,
    tables: SYNC_MODELS,
    isCached: false,
    cachedAt: new Date().toISOString(),
  };

  // Update global cache
  cache.lastCheckedAt = now;
  cache.data = result;

  return result;
}
