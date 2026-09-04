import { PrismaClient } from "@prisma/client";

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
const secondaryUrl = process.env.SECONDARY_DATABASE_URL || process.env.SHADOW_DATABASE_URL;

// Instantiate Primary and optional Failover Secondary Prisma clients
export const primaryPrisma =
  globalForPrisma.__mahaPrimaryPrisma ||
  (primaryUrl ? createClient(primaryUrl) : new PrismaClient());

export const secondaryPrisma =
  globalForPrisma.__mahaSecondaryPrisma ||
  (secondaryUrl ? createClient(secondaryUrl) : null);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__mahaPrimaryPrisma = primaryPrisma;
  globalForPrisma.__mahaSecondaryPrisma = secondaryPrisma;
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

function isConnectionError(err) {
  if (!err) return false;
  const msg = err.message || "";
  const code = err.code || "";
  return (
    code.startsWith("P10") ||
    msg.includes("Can't reach database server") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("connection closed") ||
    msg.includes("Connection terminated")
  );
}

/**
 * Execute an arbitrary database operation with automatic failover to Secondary DB
 */
export async function executeWithFailover(fn) {
  try {
    return await fn(primaryPrisma);
  } catch (err) {
    if (secondaryPrisma && isConnectionError(err)) {
      console.warn(
        "⚠️ [DB Failover Active] Primary DB unreachable. Executing query on Secondary Shadow DB..."
      );
      return await fn(secondaryPrisma);
    }
    throw err;
  }
}

/**
 * Smart Failover & Dual-Sync Prisma Client Proxy
 * Automatically routes queries to Secondary DB if Primary is down.
 * Mirrors write mutations to Secondary DB to maintain shadow database state.
 */
export const prisma = new Proxy(primaryPrisma, {
  get(target, prop, receiver) {
    // Handle $transaction with automatic failover
    if (prop === "$transaction") {
      return async (...args) => {
        try {
          return await primaryPrisma.$transaction(...args);
        } catch (err) {
          if (secondaryPrisma && isConnectionError(err)) {
            console.warn(
              "⚠️ [DB Failover Active] $transaction failed on Primary DB. Retrying on Secondary DB..."
            );
            return await secondaryPrisma.$transaction(...args);
          }
          throw err;
        }
      };
    }

    // Handle $queryRaw / $executeRaw with automatic failover
    if (prop === "$queryRaw" || prop === "$executeRaw") {
      return async (...args) => {
        try {
          return await primaryPrisma[prop](...args);
        } catch (err) {
          if (secondaryPrisma && isConnectionError(err)) {
            console.warn(
              `⚠️ [DB Failover Active] ${String(prop)} failed on Primary DB. Retrying on Secondary DB...`
            );
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
            let primaryResult;
            let primaryFailed = false;

            try {
              primaryResult = await origMethod.apply(modelTarget, args);
            } catch (err) {
              if (secondaryPrisma && isConnectionError(err)) {
                primaryFailed = true;
                console.warn(
                  `⚠️ [DB Failover Active] ${String(prop)}.${String(methodProp)} failed on Primary DB. Retrying on Secondary DB...`
                );
                const secondaryModel = secondaryPrisma[prop];
                if (secondaryModel && typeof secondaryModel[methodProp] === "function") {
                  return await secondaryModel[methodProp](...args);
                }
              }
              throw err;
            }

            // Dual write sync to secondary database if method is a write mutation and primary succeeded
            if (!primaryFailed && secondaryPrisma && WRITE_METHODS.has(String(methodProp))) {
              const secondaryModel = secondaryPrisma[prop];
              if (secondaryModel && typeof secondaryModel[methodProp] === "function") {
                secondaryModel[methodProp](...args).catch((secErr) => {
                  console.warn(
                    `⚠️ [Shadow DB Sync Warning] Secondary DB write failed for ${String(prop)}.${String(methodProp)}:`,
                    secErr?.message
                  );
                });
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
