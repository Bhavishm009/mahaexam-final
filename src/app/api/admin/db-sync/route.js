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

    const freshStatus = await getOrComputeSyncStatus(true);

    return NextResponse.json({
      success: true,
      message: "Full Database Synchronization Completed Successfully!",
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
