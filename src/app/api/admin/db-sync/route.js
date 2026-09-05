import { NextResponse } from "next/server";
import { primaryPrisma, secondaryPrisma } from "@/lib/db.js";
import { getOrComputeSyncStatus, SYNC_MODELS } from "@/lib/db-sync-cache.js";

/**
 * GET /api/admin/db-sync
 * Fetch cached health, active database, and record counts (Hourly Cache)
 * Use ?refresh=true to force a fresh re-check
 */
export async function GET(req) {
  const url = new URL(req.url);
  const forceRefresh = url.searchParams.get("refresh") === "true";

  const data = await getOrComputeSyncStatus(forceRefresh);
  return NextResponse.json(data);
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
export async function POST(req) {
  if (!secondaryPrisma) {
    return NextResponse.json(
      { success: false, error: "SECONDARY_DATABASE_URL is not configured" },
      { status: 400 }
    );
  }

  let targetTable = null;
  if (req) {
    try {
      const url = new URL(req.url);
      targetTable = url.searchParams.get("table");
      if (!targetTable && req.headers.get("content-type")?.includes("application/json")) {
        const body = await req.json().catch(() => ({}));
        targetTable = body.table || null;
      }
    } catch (_) {}
  }

  // Verify Primary is reachable before attempting sync
  try {
    await primaryPrisma.$queryRaw`SELECT 1`;
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: "Primary Database (Aiven) is currently offline. System is running in automatic failover on Secondary DB. Cannot perform sync until Primary DB is restored.",
      },
      { status: 503 }
    );
  }

  const syncLog = [];
  const stats = {};

  const NATURAL_KEYS = {
    organization: "slug",
    user: "email",
    coachingBatch: "code",
    passkeyCredential: "credentialId",
    pushSubscription: "endpoint",
    subject: "slug",
    exam: "slug",
    subscriptionPlan: "slug",
  };

  const modelsToSync = targetTable
    ? SYNC_MODELS.filter((m) => m.key.toLowerCase() === targetTable.toLowerCase())
    : SYNC_MODELS;

  if (targetTable && modelsToSync.length === 0) {
    return NextResponse.json(
      { success: false, error: `Table '${targetTable}' is not a valid syncable model.` },
      { status: 400 }
    );
  }

  // If doing a full sync, replay failover outbox mutations first
  if (!targetTable) {
    try {
      const { replayFailoverQueue } = await import("@/lib/db-sync-queue.js");
      const replayRes = await replayFailoverQueue();
      if (replayRes && replayRes.replayed > 0) {
        syncLog.push(`📦 Replayed ${replayRes.replayed} failover outbox mutations from Secondary to Primary`);
      }
    } catch (_) {}
  }

  try {
    for (const { key, label } of modelsToSync) {
      if (!primaryPrisma[key] || !secondaryPrisma[key]) continue;

      try {
        let pCount = null;
        let sCount = null;

        try { pCount = await primaryPrisma[key].count(); } catch {}
        try { sCount = await secondaryPrisma[key].count(); } catch {}

        if (pCount === null || sCount === null) {
          syncLog.push(`⚠️ ${label}: Skipped (Table missing or inaccessible)`);
          continue;
        }

        // Fetch IDs to find exact missing records in both directions
        const pRows = await primaryPrisma[key].findMany({ select: { id: true } });
        const sRows = await secondaryPrisma[key].findMany({ select: { id: true } });

        const pIds = pRows.map((r) => r.id);
        const sIds = sRows.map((r) => r.id);

        const pIdSet = new Set(pIds);
        const sIdSet = new Set(sIds);

        const missingInSecondary = pIds.filter((id) => !sIdSet.has(id));
        const missingInPrimary = sIds.filter((id) => !pIdSet.has(id));

        if (missingInSecondary.length === 0 && missingInPrimary.length === 0) {
          stats[key] = pCount;
          syncLog.push(`In Sync (${pCount} ${label})`);
          continue;
        }

        const CHUNK_SIZE = 150;
        const naturalKey = NATURAL_KEYS[key];

        // 1. Copy records missing in Secondary (Primary -> Secondary)
        if (missingInSecondary.length > 0) {
          let syncedToSecondary = 0;
          for (let i = 0; i < missingInSecondary.length; i += CHUNK_SIZE) {
            const chunkIds = missingInSecondary.slice(i, i + CHUNK_SIZE);
            const records = await primaryPrisma[key].findMany({
              where: { id: { in: chunkIds } },
            });
            const cleanChunk = sanitizeRecords(records);

            try {
              const res = await secondaryPrisma[key].createMany({
                data: cleanChunk,
                skipDuplicates: true,
              });
              syncedToSecondary += res.count || cleanChunk.length;
            } catch (chunkErr) {
              // Fallback to per-item upsert with natural key reconciliation
              for (const item of cleanChunk) {
                try {
                  await secondaryPrisma[key].upsert({
                    where: { id: item.id },
                    create: item,
                    update: item,
                  });
                  syncedToSecondary++;
                } catch (itemErr) {
                  // If unique natural key exists with a different ID on secondary, reconcile it
                  if (naturalKey && item[naturalKey]) {
                    try {
                      const conflict = await secondaryPrisma[key].findFirst({
                        where: { [naturalKey]: item[naturalKey] },
                        select: { id: true },
                      });
                      if (conflict && conflict.id !== item.id) {
                        await secondaryPrisma[key].delete({ where: { id: conflict.id } }).catch(() => {});
                        await secondaryPrisma[key].create({ data: item });
                        syncedToSecondary++;
                        continue;
                      }
                    } catch (_) {}
                  }
                }
              }
            }
          }
          syncLog.push(`Synced ${syncedToSecondary} ${label} (Primary -> Secondary)`);
        }

        // 2. Copy records missing in Primary (Secondary -> Primary)
        if (missingInPrimary.length > 0) {
          let syncedToPrimary = 0;
          for (let i = 0; i < missingInPrimary.length; i += CHUNK_SIZE) {
            const chunkIds = missingInPrimary.slice(i, i + CHUNK_SIZE);
            const records = await secondaryPrisma[key].findMany({
              where: { id: { in: chunkIds } },
            });
            const cleanChunk = sanitizeRecords(records);

            try {
              const res = await primaryPrisma[key].createMany({
                data: cleanChunk,
                skipDuplicates: true,
              });
              syncedToPrimary += res.count || cleanChunk.length;
            } catch (chunkErr) {
              // Fallback to per-item upsert
              for (const item of cleanChunk) {
                try {
                  await primaryPrisma[key].upsert({
                    where: { id: item.id },
                    create: item,
                    update: item,
                  });
                  syncedToPrimary++;
                } catch (_) {}
              }
            }
          }
          syncLog.push(`Synced ${syncedToPrimary} ${label} (Secondary -> Primary)`);
        }

        try {
          stats[key] = await primaryPrisma[key].count();
        } catch {
          stats[key] = pCount;
        }
      } catch (err) {
        console.error(`Error syncing model ${key}:`, err);
        syncLog.push(`⚠️ ${label}: Sync warning (${err.message})`);
      }
    }

    const freshStatus = await getOrComputeSyncStatus(true);

    return NextResponse.json({
      success: true,
      message: targetTable
        ? `Table '${modelsToSync[0]?.label}' Synchronized Successfully!`
        : "Full Database Synchronization Completed Successfully!",
      targetTable: targetTable || null,
      syncLog,
      stats,
      status: freshStatus,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error?.message || "Sync Execution Failed" },
      { status: 500 }
    );
  }
}
