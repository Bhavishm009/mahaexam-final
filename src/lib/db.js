import { PrismaClient } from "@prisma/client";
import { invalidateDbSyncCache } from "./db-sync-cache.js";

const globalForPrisma = globalThis;

function createClient(url) {
  if (!url) return null;
  return new PrismaClient({
    datasources: {
      db: { url },
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

  // Send instant notification to Super Admin (throttled to once every 15 mins per incident)
  if (secondaryPrisma && (!state.lastNotifiedAt || now - state.lastNotifiedAt > 15 * 60 * 1000)) {
    state.lastNotifiedAt = now;
    state.adminNotified = true;

    // Asynchronously dispatch notification without blocking current database query
    (async () => {
      try {
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
      console.log(
        "✅ [DB Failover Recovery] Primary DB is back online! Restoring Primary as Master DB."
      );
      state.isFailoverActive = false;
      state.failoverStartedAt = null;
      state.failoverReason = null;
      state.activeDb = "PRIMARY (Aiven)";
      invalidateDbSyncCache();
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
                }
                return secRes;
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
                  secondaryModel[methodProp](...args)
                    .then(() => invalidateDbSyncCache())
                    .catch((secErr) => {
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
