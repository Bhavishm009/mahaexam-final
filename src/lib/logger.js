import { prisma } from "@/lib/db";

/**
 * Unified Production Application Logger
 * Records runtime errors, API failures, client exceptions, and system events to the database.
 */
export async function logError({
  message,
  stack = null,
  source = "SERVER",
  route = null,
  userId = null,
  organizationId = null,
  metadata = {},
  request = null,
}) {
  try {
    const ipAddress = request?.headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim() || null;
    const userAgent = request?.headers?.get?.("user-agent") || null;

    console.error(`[APP_ERROR][${source}] ${route ? `[${route}] ` : ""}${message}`, stack || "");

    const errorPayload = {
      message: String(message),
      stack: stack ? String(stack) : null,
      source,
      route,
      ...metadata,
    };

    return await prisma.auditLog.create({
      data: {
        action: "APP_ERROR",
        resourceType: source,
        resourceId: route || "system",
        userId: userId || null,
        organizationId: organizationId || null,
        ipAddress,
        userAgent,
        metadata: errorPayload,
      },
    });
  } catch (err) {
    console.error("Critical: Failed to persist error log to database:", err.message);
    return null;
  }
}

export async function logEvent({
  action,
  resourceType = "SYSTEM",
  resourceId = null,
  userId = null,
  organizationId = null,
  metadata = {},
  request = null,
}) {
  try {
    const ipAddress = request?.headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim() || null;
    const userAgent = request?.headers?.get?.("user-agent") || null;

    return await prisma.auditLog.create({
      data: {
        action,
        resourceType,
        resourceId,
        userId,
        organizationId,
        ipAddress,
        userAgent,
        metadata,
      },
    });
  } catch (err) {
    console.warn("Failed to write event log:", err.message);
    return null;
  }
}
