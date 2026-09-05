import { PrismaClient } from "@prisma/client";
import { invalidateDbSyncCache } from "./db-sync-cache.js";

const globalForPrisma = globalThis;

function createClient(url) {
  if (!url) return null;
  let tunedUrl = url;
  
  // Optimize connection limit from 3 to 10 (or configurable via DB_CONNECTION_LIMIT)
  // Aiven max_connections is 20, so 10 provides 3.3x more concurrency headroom while leaving 10 for background jobs/admin.
  const targetLimit = process.env.DB_CONNECTION_LIMIT || "10";
  if (tunedUrl.includes("connection_limit=3")) {
    tunedUrl = tunedUrl.replace("connection_limit=3", `connection_limit=${targetLimit}`);
  } else if (!tunedUrl.includes("connection_limit=")) {
    tunedUrl += (tunedUrl.includes("?") ? "&" : "?") + `connection_limit=${targetLimit}`;
  }

  // Ensure connection pool timeout allows sufficient buffer (30s) during high concurrency bursts
  if (tunedUrl.includes("pool_timeout=10") || tunedUrl.includes("pool_timeout=20")) {
    tunedUrl = tunedUrl.replace(/pool_timeout=\d+/, "pool_timeout=30");
  } else if (!tunedUrl.includes("pool_timeout=")) {
    tunedUrl += (tunedUrl.includes("?") ? "&" : "?") + "pool_timeout=30";
  }

  return new PrismaClient({
    datasources: {
      db: { url: tunedUrl },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const primaryUrl = process.env.DATABASE_URL;
let secondaryUrl = process.env.SECONDARY_DATABASE_URL || process.env.SHADOW_DATABASE_URL;

// Auto-fix IPv6 Supabase host to IPv4 pooler host if old host is present
if (secondaryUrl && secondaryUrl.includes("db.mhhmyckndlmylpgciblz.supabase.co:5432")) {
  secondaryUrl = secondaryUrl.replace(
    "db.mhhmyckndlmylpgciblz.supabase.co:5432",
    "aws-0-ap-south-1.pooler.supabase.com:6543"
  );
  if (!secondaryUrl.includes("pgbouncer=true")) {
    secondaryUrl += (secondaryUrl.includes("?") ? "&" : "?") + "pgbouncer=true";
  }
}

export const primaryPrisma =
  globalForPrisma.__mahaPrimaryPrisma ||
  (primaryUrl ? createClient(primaryUrl) : new PrismaClient());

export const secondaryPrisma =
  globalForPrisma.__mahaSecondaryPrisma ||
  (secondaryUrl ? createClient(secondaryUrl) : null);

globalForPrisma.__mahaPrimaryPrisma = primaryPrisma;
if (secondaryPrisma) {
  globalForPrisma.__mahaSecondaryPrisma = secondaryPrisma;
}

// Global failover state & circuit breaker
if (!globalForPrisma.__mahaDbFailover) {
  globalForPrisma.__mahaDbFailover = {
    isFailoverActive: false,
    failoverStartedAt: null,
    failoverReason: null,
    lastPrimaryProbeAt: 0,
    lastNotifiedAt: 0,
    adminNotified: false,
    activeDb: "PRIMARY (Aiven)",
  };
}

export function getFailoverStatus() {
  return {
    ...globalForPrisma.__mahaDbFailover,
  };
}

const WRITE_METHODS = new Set([
  "create",
  "createMany",
  "update",
  "updateMany",
  "upsert",
  "delete",
  "deleteMany",
]);

export function isConnectionError(err) {
  if (!err) return false;
  const msg = typeof err === "string" ? err : (err?.message || "");
  const code = err?.code || "";
  const metaMsg = typeof err?.meta?.message === "string" ? err.meta.message : "";
  const combined = (msg + " " + metaMsg + " " + code).toLowerCase();

  return (
    code.startsWith("P10") ||
    code === "P2037" ||
    combined.includes("p2037") ||
    combined.includes("can't reach database") ||
    combined.includes("cannot reach database") ||
    combined.includes("econnrefused") ||
    combined.includes("econnreset") ||
    combined.includes("etimedout") ||
    combined.includes("enotfound") ||
    combined.includes("ehostunreach") ||
    combined.includes("eai_again") ||
    combined.includes("socket hang up") ||
    combined.includes("connection closed") ||
    combined.includes("connection terminated") ||
    combined.includes("terminating connection") ||
    combined.includes("the server closed the connection") ||
    combined.includes("remaining connection slots") ||
    combined.includes("superuser attribute") ||
    combined.includes("too many clients") ||
    combined.includes("too many connections") ||
    combined.includes("max_connections") ||
    combined.includes("pool_timeout") ||
    combined.includes("timeout") ||
    combined.includes("timed out") ||
    combined.includes("failed to connect") ||
    combined.includes("error opening a tls connection") ||
    combined.includes("database system is shutting down") ||
    combined.includes("database is in recovery mode")
  );
}

/**
 * Activate failover to secondary database and trigger instant Super Admin notification
 */
export async function activateFailover(err) {
  const state = globalForPrisma.__mahaDbFailover;
  const now = Date.now();
  const rawReason = err?.message || "Primary DB unreachable";
  const cleanReason = rawReason.replace(/\n+/g, " ").trim();

  state.isFailoverActive = true;
  if (!state.failoverStartedAt) {
    state.failoverStartedAt = new Date().toISOString();
  }
  state.failoverReason = cleanReason;
  state.activeDb = "SECONDARY (Supabase Failover Active)";

  // Invalidate cache immediately so DB sync page shows failover status
  try {
    invalidateDbSyncCache();
  } catch (_) {}

  // Skip notifications during Next.js production build or deployment static generation
  if (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.IS_BUILD ||
    process.env.NEXT_PUBLIC_IS_BUILD ||
    process.env.CI === "true" ||
    process.env.CI === "1"
  ) {
    return;
  }

  // Track failure count to avoid transient 2-second container deployment restart blips
  state.failureCount = (state.failureCount || 0) + 1;

  // Send instant notification to Super Admin only on sustained failure (throttled to once every 15 mins)
  if (
    state.failureCount >= 3 &&
    secondaryPrisma &&
    (!state.lastNotifiedAt || now - state.lastNotifiedAt > 15 * 60 * 1000)
  ) {
    state.lastNotifiedAt = now;
    state.adminNotified = true;

    // Asynchronously dispatch notification without blocking current database query
    (async () => {
      try {
        // Distributed database throttle: Check if any serverless lambda already alerted in the last 15 mins
        const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
        const recentAlert = await secondaryPrisma.notification.findFirst({
          where: {
            title: { contains: "CRITICAL: Primary Database Down" },
            createdAt: { gte: fifteenMinsAgo },
          },
          select: { id: true },
        });

        if (recentAlert) {
          return;
        }

        const superAdmin = await secondaryPrisma.user.findFirst({
          where: { role: "SUPER_ADMIN" },
          select: { id: true, email: true, name: true },
        });

        if (superAdmin) {
          // 1. In-App High Priority Notification in Secondary Database
          await secondaryPrisma.notification.create({
            data: {
              userId: superAdmin.id,
              title: "🚨 CRITICAL: Primary Database Down - Failover Activated",
              message: `Primary Database (Aiven) connection failed: ${cleanReason.slice(0, 180)}. System has automatically switched to Secondary Failover Database (Supabase) to maintain uninterrupted service.`,
              type: "SYSTEM",
              data: {
                event: "PRIMARY_DB_FAILOVER",
                timestamp: state.failoverStartedAt,
                reason: cleanReason,
                targetDb: "Supabase IPv4 Pooler (aws-0-ap-south-1.pooler.supabase.com)",
              },
            },
          });
          console.log(
            `🚨 [DB Failover Alert] Created in-app failover alert for Super Admin (${superAdmin.email})`
          );

          // 2. Emergency Email Alert
          if (superAdmin.email) {
            try {
              const { sendFailoverAlertEmail } = await import("./email-service.js");
              await sendFailoverAlertEmail({
                to: superAdmin.email,
                adminName: superAdmin.name || "Super Admin",
                reason: cleanReason,
                timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
              });
              console.log(
                `🚨 [DB Failover Alert] Sent emergency failover alert email to ${superAdmin.email}`
              );
            } catch (mailErr) {
              console.warn("[DB Failover Alert] Email alert dispatch failed:", mailErr?.message);
            }
          }
        }
      } catch (notifyErr) {
        console.warn("[DB Failover Alert] Error creating Super Admin notification:", notifyErr?.message);
      }
    })();
  }
}

/**
 * Handle Primary Database recovery: switch traffic back to Primary and notify Super Admin
 */
export async function handlePrimaryRecovery() {
  const state = globalForPrisma.__mahaDbFailover;
  if (!state.isFailoverActive) return;

  const outageStartedAt = state.failoverStartedAt;
  const restoredAt = new Date().toISOString();
  const wasAdminNotified = state.adminNotified;

  state.isFailoverActive = false;
  state.failureCount = 0;
  state.failoverStartedAt = null;
  state.failoverReason = null;
  state.adminNotified = false;
  state.activeDb = "PRIMARY (Aiven)";
  state.lastNotifiedAt = 0; // Reset failover throttle so any future failover triggers immediate notification
  state.lastRecoveredAt = restoredAt;

  console.log(
    "✅ [DB Failover Recovery] Primary Database restored! Switched back to Primary Master DB."
  );

  // Invalidate cache immediately so DB Sync page shows Primary is back online
  try {
    invalidateDbSyncCache();
  } catch (_) {}

  // Automatically replay any mutations that occurred while Primary was offline
  import("./db-sync-queue.js")
    .then(({ replayFailoverQueue }) => replayFailoverQueue())
    .catch((replayErr) => {
      console.warn("⚠️ [DB Failover Recovery] Error during queue replay:", replayErr?.message);
    });

  // Only dispatch recovery notification if an actual outage alert was sent earlier
  if (!wasAdminNotified) {
    return;
  }

  // Instant notification to Super Admin that Primary Database has recovered
  (async () => {
    try {
      // Distributed database throttle: Check if any instance already dispatched a recovery alert in the last 15 mins
      const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
      const recentRecovery = await primaryPrisma.notification.findFirst({
        where: {
          title: { contains: "RESTORED: Primary Database Online" },
          createdAt: { gte: fifteenMinsAgo },
        },
        select: { id: true },
      }).catch(() => null);

      if (recentRecovery) {
        return;
      }

      const superAdmin = await primaryPrisma.user.findFirst({
        where: { role: "SUPER_ADMIN" },
        select: { id: true, email: true, name: true },
      }).catch(async () => {
        if (secondaryPrisma) {
          return await secondaryPrisma.user.findFirst({
            where: { role: "SUPER_ADMIN" },
            select: { id: true, email: true, name: true },
          });
        }
        return null;
      });

      if (superAdmin) {
        // 1. In-App Notification (write to both primary and secondary)
        const notifData = {
          userId: superAdmin.id,
          title: "✅ RESTORED: Primary Database Online",
          message: `Primary Database (Aiven) connection has been successfully restored! All live queries and writes have been routed back to the Primary Master DB. System is operating normally.`,
          type: "SYSTEM",
          data: {
            event: "PRIMARY_DB_RECOVERED",
            timestamp: restoredAt,
            downtimeStartedAt: outageStartedAt,
            targetDb: "exam-kids.i.aivencloud.com:20770",
          },
        };

        await primaryPrisma.notification.create({ data: notifData }).catch(() => {});
        if (secondaryPrisma) {
          await secondaryPrisma.notification.create({ data: notifData }).catch(() => {});
        }
        console.log(
          `✅ [DB Recovery Alert] Created in-app recovery alert for Super Admin (${superAdmin.email})`
        );

        // 2. Emergency Recovery Email Alert via Google SMTP
        if (superAdmin.email) {
          try {
            const { sendRecoveryAlertEmail } = await import("./email-service.js");
            await sendRecoveryAlertEmail({
              to: superAdmin.email,
              adminName: superAdmin.name || "Super Admin",
              downtimeStartedAt: outageStartedAt
                ? new Date(outageStartedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
                : null,
              restoredAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
              host: "exam-kids.i.aivencloud.com",
            });
            console.log(
              `✅ [DB Recovery Alert] Sent recovery alert email to ${superAdmin.email}`
            );
          } catch (mailErr) {
            console.warn("[DB Recovery Alert] Email dispatch failed:", mailErr?.message);
          }
        }
      }
    } catch (err) {
      console.warn("[DB Recovery Alert] Error alerting Super Admin of recovery:", err?.message);
    }
  })();
}

/**
 * Background check if Primary Database has recovered
 */
async function checkPrimaryRecovery() {
  const state = globalForPrisma.__mahaDbFailover;
  const now = Date.now();

  // Probe primary at most once every 60 seconds
  if (state.isFailoverActive && now - state.lastPrimaryProbeAt > 60000) {
    state.lastPrimaryProbeAt = now;
    try {
      await primaryPrisma.$queryRaw`SELECT 1`;
      await handlePrimaryRecovery();
    } catch (_) {
      // Primary is still unreachable; remain in failover mode
    }
  }
}

/**
 * Execute an arbitrary database operation with automatic failover to Secondary DB
 */
export async function executeWithFailover(fn) {
  const state = globalForPrisma.__mahaDbFailover;

  if (state.isFailoverActive && secondaryPrisma) {
    checkPrimaryRecovery().catch(() => {});
    return await fn(secondaryPrisma);
  }

  try {
    return await fn(primaryPrisma);
  } catch (err) {
    if (secondaryPrisma && isConnectionError(err)) {
      console.warn(
        "⚠️ [DB Failover Active] Primary DB unreachable. Switching to Secondary Shadow DB...",
        err?.message
      );
      await activateFailover(err);
      return await fn(secondaryPrisma);
    }
    throw err;
  }
}

/**
 * Smart Failover & Dual-Sync Prisma Client Proxy
 * - Directly routes to Secondary DB if Primary is down.
 * - Dispatches instant notifications to Super Admin on failover.
 * - Mirrors write mutations to Secondary DB to maintain shadow database state.
 */
export const prisma = new Proxy(primaryPrisma, {
  get(target, prop, receiver) {
    const state = globalForPrisma.__mahaDbFailover;

    // Handle $transaction with automatic failover
    if (prop === "$transaction") {
      return async (...args) => {
        if (state.isFailoverActive && secondaryPrisma) {
          checkPrimaryRecovery().catch(() => {});
          return await secondaryPrisma.$transaction(...args);
        }

        try {
          return await primaryPrisma.$transaction(...args);
        } catch (err) {
          if (secondaryPrisma && isConnectionError(err)) {
            console.warn(
              "⚠️ [DB Failover Active] $transaction failed on Primary DB. Retrying on Secondary DB...",
              err?.message
            );
            await activateFailover(err);
            return await secondaryPrisma.$transaction(...args);
          }
          throw err;
        }
      };
    }

    // Handle $queryRaw / $executeRaw with automatic failover
    if (prop === "$queryRaw" || prop === "$executeRaw") {
      return async (...args) => {
        if (state.isFailoverActive && secondaryPrisma) {
          checkPrimaryRecovery().catch(() => {});
          return await secondaryPrisma[prop](...args);
        }

        try {
          return await primaryPrisma[prop](...args);
        } catch (err) {
          if (secondaryPrisma && isConnectionError(err)) {
            console.warn(
              `⚠️ [DB Failover Active] ${String(prop)} failed on Primary DB. Retrying on Secondary DB...`,
              err?.message
            );
            await activateFailover(err);
            return await secondaryPrisma[prop](...args);
          }
          throw err;
        }
      };
    }

    // Handle Prisma Models (e.g. prisma.user, prisma.exam, prisma.question)
    const model = target[prop];
    if (model && typeof model === "object") {
      return new Proxy(model, {
        get(modelTarget, methodProp) {
          const origMethod = modelTarget[methodProp];
          if (typeof origMethod !== "function") {
            return origMethod;
          }

          return async (...args) => {
            // If failover is already active, bypass Primary and route directly to Secondary DB
            if (state.isFailoverActive && secondaryPrisma) {
              checkPrimaryRecovery().catch(() => {});
              const secondaryModel = secondaryPrisma[prop];
              if (secondaryModel && typeof secondaryModel[methodProp] === "function") {
                const secRes = await secondaryModel[methodProp](...args);
                if (WRITE_METHODS.has(String(methodProp))) {
                  invalidateDbSyncCache();
                  // Log mutation to durable outbox queue for replay when Primary recovers
                  import("./db-sync-queue.js")
                    .then(({ enqueueFailoverMutation }) =>
                      enqueueFailoverMutation({
                        model: String(prop),
                        method: String(methodProp),
                        args,
                        resultId: secRes?.id || null,
                      })
                    )
                    .catch(() => {});
                }
                return secRes;
              }
            }

            // Pre-populate IDs for createMany so both Primary and Secondary receive identical records
            if (String(methodProp) === "createMany" && args[0]?.data && Array.isArray(args[0].data)) {
              for (const item of args[0].data) {
                if (item && typeof item === "object" && !item.id) {
                  item.id = "cm" + Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
                }
              }
            }

            let primaryResult;
            let primaryFailed = false;

            try {
              primaryResult = await origMethod.apply(modelTarget, args);
            } catch (err) {
              if (secondaryPrisma && isConnectionError(err)) {
                primaryFailed = true;
                console.warn(
                  `⚠️ [DB Failover Active] ${String(prop)}.${String(methodProp)} failed on Primary DB. Retrying on Secondary DB...`,
                  err?.message
                );
                await activateFailover(err);
                const secondaryModel = secondaryPrisma[prop];
                if (secondaryModel && typeof secondaryModel[methodProp] === "function") {
                  const secRes = await secondaryModel[methodProp](...args);
                  invalidateDbSyncCache();
                  if (WRITE_METHODS.has(String(methodProp))) {
                    import("./db-sync-queue.js")
                      .then(({ enqueueFailoverMutation }) =>
                        enqueueFailoverMutation({
                          model: String(prop),
                          method: String(methodProp),
                          args,
                          resultId: secRes?.id || null,
                        })
                      )
                      .catch(() => {});
                  }
                  return secRes;
                }
              }
              throw err;
            }

            // Dual write sync to secondary database if method is a write mutation and primary succeeded
            if (WRITE_METHODS.has(String(methodProp))) {
              invalidateDbSyncCache();
              if (!primaryFailed && secondaryPrisma) {
                const secondaryModel = secondaryPrisma[prop];
                if (secondaryModel && typeof secondaryModel[methodProp] === "function") {
                  // Construct secondary args ensuring identical ID preservation
                  let secArgs = args;
                  try {
                    secArgs = JSON.parse(
                      JSON.stringify(args, (k, v) => (typeof v === "bigint" ? Number(v) : v))
                    );

                    // Ensure secondary create uses the EXACT id created by Primary
                    if (String(methodProp) === "create" && primaryResult?.id && secArgs[0]?.data) {
                      if (!secArgs[0].data.id) {
                        secArgs[0].data.id = primaryResult.id;
                      }
                    } else if (String(methodProp) === "upsert" && primaryResult?.id && secArgs[0]?.create) {
                      if (!secArgs[0].create.id) {
                        secArgs[0].create.id = primaryResult.id;
                      }
                    }
                  } catch (_) {
                    secArgs = args;
                  }

                  secondaryModel[methodProp](...secArgs)
                    .then(() => invalidateDbSyncCache())
                    .catch(async (secErr) => {
                      // If create fails due to unique constraint, try safe upsert/update
                      if (secErr?.code === "P2002" && primaryResult?.id && secArgs[0]?.data) {
                        try {
                          await secondaryModel.update({
                            where: { id: primaryResult.id },
                            data: secArgs[0].data,
                          });
                          invalidateDbSyncCache();
                          return;
                        } catch (_) {}
                      }
                      console.warn(
                        `⚠️ [Shadow DB Sync Warning] Secondary DB write failed for ${String(prop)}.${String(methodProp)}:`,
                        secErr?.message
                      );
                      invalidateDbSyncCache();
                    });
                }
              }
            }

            return primaryResult;
          };
        },
      });
    }

    return Reflect.get(target, prop, receiver);
  },
});
