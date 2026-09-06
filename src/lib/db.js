import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

/**
 * Creates an optimized Prisma client connected to the production database.
 * Connection limits and timeouts are tuned for high-concurrency exam delivery.
 */
function createClient(url) {
  if (!url) return null;
  let tunedUrl = url;

  // Connection limit tuned to 15 concurrent pooled connections for peak exam loads
  const targetLimit = process.env.DB_CONNECTION_LIMIT || "15";
  if (tunedUrl.includes("connection_limit=")) {
    tunedUrl = tunedUrl.replace(/connection_limit=\d+/, `connection_limit=${targetLimit}`);
  } else {
    tunedUrl += (tunedUrl.includes("?") ? "&" : "?") + `connection_limit=${targetLimit}`;
  }

  // 30-second buffer pool timeout prevents sudden dropped requests during traffic spikes
  if (tunedUrl.includes("pool_timeout=")) {
    tunedUrl = tunedUrl.replace(/pool_timeout=\d+[a-zA-Z]*/, "pool_timeout=30");
  } else {
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

// Singleton pattern ensures Next.js hot-reloads never leak connection handles
export const primaryPrisma =
  globalForPrisma.__mahaPrimaryPrisma ||
  (primaryUrl ? createClient(primaryUrl) : new PrismaClient());

export const prisma = primaryPrisma;
export const secondaryPrisma = null;

globalForPrisma.__mahaPrimaryPrisma = primaryPrisma;
globalForPrisma.__mahaPrisma = prisma;

/**
 * Backward-compatible helper returning single-database production health status
 */
export function getFailoverStatus() {
  return {
    isFailoverActive: false,
    activeDb: "Primary Database (Aiven PostgreSQL)",
    isSingleDbMode: true,
    provider: "Aiven Managed PostgreSQL",
    status: "HEALTHY",
  };
}

export function isConnectionError(err) {
  if (!err) return false;
  const msg = typeof err === "string" ? err : err?.message || "";
  const code = err?.code || "";
  const metaMsg = typeof err?.meta?.message === "string" ? err.meta.message : "";
  const combined = (msg + " " + metaMsg + " " + code).toLowerCase();

  return (
    code.startsWith("P10") ||
    combined.includes("can't reach database") ||
    combined.includes("econnrefused") ||
    combined.includes("etimedout") ||
    combined.includes("timeout")
  );
}

export async function activateFailover() {
  return false;
}

export async function withFailover(fn) {
  return await fn(prisma);
}

export default prisma;
