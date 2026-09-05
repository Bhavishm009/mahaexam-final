import { primaryPrisma, secondaryPrisma } from "./db.js";

const JOB_TYPE = "DB_SYNC_FAILOVER_REPLAY";

/**
 * Clean data for Prisma JSON serialization (handling BigInt, Dates, functions)
 */
function sanitizePayload(data) {
  if (data === null || data === undefined) return data;
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (typeof value === "bigint") return Number(value);
      return value;
    })
  );
}

/**
 * Enqueue a mutation executed on Secondary during Primary outage
 */
export async function enqueueFailoverMutation({ model, method, args, resultId }) {
  if (!secondaryPrisma) return;

  try {
    const cleanArgs = sanitizePayload(args);

    await secondaryPrisma.job.create({
      data: {
        type: JOB_TYPE,
        status: "PENDING",
        payload: {
          model,
          method,
          args: cleanArgs,
          resultId: resultId || null,
          enqueuedAt: new Date().toISOString(),
        },
        attempts: 0,
        runAt: new Date(),
      },
    });

    console.log(
      `📦 [Failover Outbox] Enqueued mutation: ${model}.${method} (id=${resultId || "n/a"}) for replay to Primary.`
    );
  } catch (err) {
    console.warn(
      `⚠️ [Failover Outbox Warning] Failed to log mutation to Secondary outbox:`,
      err?.message
    );
  }
}

/**
 * Get count and summary of pending mutations in the outbox
 */
export async function getFailoverQueueStats() {
  if (!secondaryPrisma) return { pendingCount: 0, totalCount: 0 };

  try {
    const pendingCount = await secondaryPrisma.job.count({
      where: {
        type: JOB_TYPE,
        status: "PENDING",
      },
    });

    const failedCount = await secondaryPrisma.job.count({
      where: {
        type: JOB_TYPE,
        status: "FAILED",
      },
    });

    return { pendingCount, failedCount };
  } catch (_) {
    return { pendingCount: 0, failedCount: 0 };
  }
}

let isReplaying = false;

/**
 * Replay mutations enqueued while Primary DB was offline back to Primary DB
 */
export async function replayFailoverQueue() {
  if (!secondaryPrisma || isReplaying) return { replayed: 0, skipped: 0, failed: 0 };

  // First verify Primary is truly reachable
  try {
    await primaryPrisma.$queryRaw`SELECT 1`;
  } catch (_) {
    console.warn("⏳ [Failover Replay] Primary DB still unreachable. Postponing outbox replay.");
    return { replayed: 0, skipped: 0, failed: 0, error: "Primary DB unreachable" };
  }

  isReplaying = true;
  let replayed = 0;
  let skipped = 0;
  let failed = 0;

  try {
    const pendingJobs = await secondaryPrisma.job.findMany({
      where: {
        type: JOB_TYPE,
        status: "PENDING",
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    if (pendingJobs.length === 0) {
      isReplaying = false;
      return { replayed: 0, skipped: 0, failed: 0 };
    }

    console.log(
      `🚀 [Failover Replay] Replaying ${pendingJobs.length} mutations from Secondary Outbox to Primary Master DB...`
    );

    for (const job of pendingJobs) {
      const { model, method, args, resultId } = job.payload || {};

      if (!primaryPrisma[model] || typeof primaryPrisma[model][method] !== "function") {
        console.warn(`[Failover Replay] Invalid model/method in job ${job.id}: ${model}.${method}`);
        await secondaryPrisma.job.update({
          where: { id: job.id },
          data: { status: "COMPLETED", lastError: "Model/method does not exist", completedAt: new Date() },
        });
        skipped++;
        continue;
      }

      try {
        // Execute mutation on Primary
        await primaryPrisma[model][method](...(args || []));

        await secondaryPrisma.job.update({
          where: { id: job.id },
          data: { status: "COMPLETED", completedAt: new Date() },
        });

        replayed++;
        console.log(`✅ [Failover Replay] Successfully synced ${model}.${method} (id=${resultId}) to Primary.`);
      } catch (mutationErr) {
        const errMsg = mutationErr?.message || "";

        // If Primary connection dropped during replay, stop immediately and retry later
        if (
          errMsg.includes("can't reach database") ||
          errMsg.includes("connection closed") ||
          errMsg.includes("timed out")
        ) {
          console.warn(`⚠️ [Failover Replay] Primary dropped connection during replay. Pausing.`);
          await secondaryPrisma.job.update({
            where: { id: job.id },
            data: { attempts: (job.attempts || 0) + 1, lastError: errMsg },
          });
          failed++;
          break;
        }

        // If error is unique constraint or already exists, it's already in sync
        if (mutationErr?.code === "P2002" || errMsg.includes("Unique constraint failed")) {
          console.log(`ℹ️ [Failover Replay] ${model}.${method} already exists on Primary. Marking completed.`);
          await secondaryPrisma.job.update({
            where: { id: job.id },
            data: { status: "COMPLETED", completedAt: new Date() },
          });
          skipped++;
          continue;
        }

        // For other errors, increment attempts
        const nextAttempts = (job.attempts || 0) + 1;
        const newStatus = nextAttempts >= 5 ? "FAILED" : "PENDING";
        await secondaryPrisma.job.update({
          where: { id: job.id },
          data: { attempts: nextAttempts, status: newStatus, lastError: errMsg },
        });

        failed++;
        console.warn(`⚠️ [Failover Replay Warning] Error replaying ${model}.${method} to Primary:`, errMsg);
      }
    }

    return { replayed, skipped, failed };
  } catch (error) {
    console.error("Error during failover queue replay:", error);
    return { replayed, skipped, failed: failed + 1, error: error?.message };
  } finally {
    isReplaying = false;
  }
}
