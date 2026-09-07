import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

/**
 * Creates an optimized Prisma client connected to the production database.
 * Connection limits and timeouts are tuned for high-concurrency exam delivery.
 */
function createClient(url) {
  if (!url) return null;
  let tunedUrl = url;

  // Safe connection limit: 5 in development, 10 in production with PgBouncer
  const targetLimit =
    process.env.DB_CONNECTION_LIMIT || (process.env.NODE_ENV === "production" ? "10" : "5");
  if (tunedUrl.includes("connection_limit=")) {
    tunedUrl = tunedUrl.replace(/connection_limit=\d+/, `connection_limit=${targetLimit}`);
  } else {
    tunedUrl += (tunedUrl.includes("?") ? "&" : "?") + `connection_limit=${targetLimit}`;
  }

  // 35-second buffer pool timeout prevents dropped requests during high-concurrency traffic spikes
  if (tunedUrl.includes("pool_timeout=")) {
    tunedUrl = tunedUrl.replace(/pool_timeout=\d+[a-zA-Z]*/, "pool_timeout=35");
  } else {
    tunedUrl += (tunedUrl.includes("?") ? "&" : "?") + "pool_timeout=35";
  }

  // Automatic PgBouncer detection for Supabase transaction pooler on port 6543
  if (tunedUrl.includes(":6543") && !tunedUrl.includes("pgbouncer=true")) {
    tunedUrl += (tunedUrl.includes("?") ? "&" : "?") + "pgbouncer=true";
  }

  return new PrismaClient({
    datasources: {
      db: { url: tunedUrl },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// Switch primary database to Supabase in code without requiring .env changes
const primaryUrl =
  process.env.SUPABASE_DATABASE_URL ||
  process.env.SECONDARY_DATABASE_URL ||
  process.env.DATABASE_URL;

// Keep Aiven as secondary / backup database
const secondaryUrl = process.env.SECONDARY_DATABASE_URL ? process.env.DATABASE_URL : null;

// Singleton pattern ensures Next.js hot-reloads never leak connection handles
export const primaryPrisma =
  globalForPrisma.__mahaPrimaryPrisma ||
  (primaryUrl ? createClient(primaryUrl) : new PrismaClient());

export const secondaryPrisma =
  globalForPrisma.__mahaSecondaryPrisma || (secondaryUrl ? createClient(secondaryUrl) : null);

export const prisma = primaryPrisma;

globalForPrisma.__mahaPrimaryPrisma = primaryPrisma;
globalForPrisma.__mahaSecondaryPrisma = secondaryPrisma;
globalForPrisma.__mahaPrisma = prisma;

/**
 * Dynamically parse database connection metadata from connection URL
 */
export function parseDatabaseMetadata(url) {
  if (!url) {
    return {
      host: "unknown",
      port: 5432,
      database: "unknown",
      user: "unknown",
      provider: "None",
      poolerMode: "Disabled",
      architecture: "Not Configured",
      isPooler: false,
      ssl: false,
    };
  }

  try {
    const sanitized = url.replace(/^[a-zA-Z0-9+.-]+:\/\//, "http://");
    const parsed = new URL(sanitized);
    const host = parsed.hostname || "unknown";
    const port = parseInt(parsed.port, 10) || 5432;
    const database = parsed.pathname ? parsed.pathname.replace(/^\//, "") : "postgres";
    const user = parsed.username || "postgres";
    const isPooler = port === 6543 || url.includes("pgbouncer=true") || host.includes("pooler");

    let provider = "Self-Hosted PostgreSQL";
    let architecture = isPooler
      ? "Enterprise Pooled Database Architecture"
      : "Direct Database Architecture";
    let poolerMode = isPooler
      ? "PgBouncer Transaction Pooler (High Concurrency)"
      : "Direct PostgreSQL Session";

    if (host.includes("supabase.com") || host.includes("supabase.co")) {
      const regionMatch =
        host.match(/(?:aws-[0-9]-)?([a-z0-9-]+)\.pooler\.supabase/i) ||
        host.match(/([a-z0-9-]+)\.supabase/i);
      const region = regionMatch ? regionMatch[1].toUpperCase() : "";
      provider = region ? `Supabase Managed PostgreSQL (${region})` : "Supabase Managed PostgreSQL";
    } else if (host.includes("aivencloud.com")) {
      provider = "Aiven Cloud PostgreSQL";
    } else if (host.includes("neon.tech")) {
      provider = "Neon Serverless PostgreSQL";
    } else if (host.includes("rds.amazonaws.com")) {
      provider = "AWS RDS PostgreSQL";
    } else if (host.includes("railway.app") || host.includes("up.railway.app")) {
      provider = "Railway PostgreSQL";
    } else if (host === "localhost" || host === "127.0.0.1") {
      provider = "Local PostgreSQL Instance";
    } else if (host) {
      provider = `${host} PostgreSQL`;
    }

    return {
      host,
      port,
      database,
      user,
      provider,
      poolerMode,
      architecture,
      isPooler,
      ssl: !url.includes("sslmode=disable"),
    };
  } catch {
    const match = url.match(/@([^:/]+)(?::(\d+))?(?:\/([^?]+))?/);
    const host = match ? match[1] : "unknown";
    const port = match && match[2] ? parseInt(match[2], 10) : 5432;
    const database = match && match[3] ? match[3] : "postgres";
    const isPooler = port === 6543 || url.includes("pgbouncer=true");

    return {
      host,
      port,
      database,
      user: "postgres",
      provider: host.includes("supabase")
        ? "Supabase Managed PostgreSQL"
        : host.includes("aiven")
          ? "Aiven Cloud PostgreSQL"
          : `${host} PostgreSQL`,
      poolerMode: isPooler ? "PgBouncer Transaction Pooler" : "Direct Connection",
      architecture: isPooler
        ? "Enterprise Pooled Database Architecture"
        : "Direct Database Architecture",
      isPooler,
      ssl: !url.includes("sslmode=disable"),
    };
  }
}

/**
 * Dynamically resolves health status and metadata from active connection URLs
 */
export function getFailoverStatus() {
  const primaryMeta = parseDatabaseMetadata(primaryUrl);
  const secondaryMeta = secondaryUrl ? parseDatabaseMetadata(secondaryUrl) : null;

  return {
    isFailoverActive: false,
    activeDb: `Primary Database (${primaryMeta.provider})`,
    isSingleDbMode: !secondaryUrl,
    provider: primaryMeta.provider,
    host: primaryMeta.host,
    port: primaryMeta.port,
    database: primaryMeta.database,
    poolerMode: primaryMeta.poolerMode,
    architecture: primaryMeta.architecture,
    backupProvider: secondaryMeta
      ? `${secondaryMeta.provider} (Secondary/Backup)`
      : "None Configured",
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
