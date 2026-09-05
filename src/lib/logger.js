import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";

import {
  RETENTION_HOURS,
  pruneExpiredApiLogs as pruneExpiredLogs,
} from "@/lib/api-logger-interceptor.js";

export { RETENTION_HOURS, pruneExpiredLogs };

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

/**
 * Detailed API-Level Logger
 * Logs HTTP request method, path, status, latency, user context, and errors.
 */
export async function logApiCall({
  method = "GET",
  route = "/",
  statusCode = 200,
  durationMs = 0,
  userId = null,
  organizationId = null,
  metadata = {},
  error = null,
  request = null,
}) {
  try {
    const ipAddress = request?.headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim() || null;
    const userAgent = request?.headers?.get?.("user-agent") || null;
    const isError = statusCode >= 400 || !!error;
    const action = isError ? "API_ERROR" : "API_CALL";

    const payload = {
      method,
      route,
      statusCode,
      durationMs: Math.round(durationMs),
      ...(error
        ? { error: typeof error === "object" ? error.message || String(error) : String(error) }
        : {}),
      ...metadata,
    };

    const statusTag = isError ? "❌" : "✅";
    console.log(
      `[API_LOG] ${statusTag} ${method} ${route} -> ${statusCode} (${payload.durationMs}ms)`,
    );

    return await prisma.auditLog.create({
      data: {
        action,
        resourceType: "API_ROUTE",
        resourceId: `${method} ${route}`,
        userId: userId || null,
        organizationId: organizationId || null,
        ipAddress,
        userAgent,
        metadata: payload,
      },
    });
  } catch (err) {
    console.warn("Failed to persist API log:", err.message);
    return null;
  }
}

/**
 * Higher-Order Function wrapper for Next.js App Router API Routes.
 * Automatically tracks duration, HTTP status code, session user, and exceptions.
 */
export function withApiLogger(handler, actionName = null) {
  return async function loggedHandler(request, context) {
    const start = performance.now();
    const url = new URL(request.url);
    const routePath = actionName || url.pathname;
    const method = request.method;

    let session = null;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(COOKIE)?.value;
      session = await verifySessionToken(token);
    } catch {
      // Unauthenticated or invalid token
    }

    let response;
    try {
      response = await handler(request, context, session);
      const durationMs = performance.now() - start;

      // Asynchronously record API call log
      logApiCall({
        method,
        route: routePath,
        statusCode: response?.status || 200,
        durationMs,
        userId: session?.sub || null,
        organizationId: session?.organizationId || null,
        request,
      }).catch(() => {});

      return response;
    } catch (error) {
      const durationMs = performance.now() - start;

      logError({
        message: error.message || "Unhandled API Exception",
        stack: error.stack,
        source: "API_ROUTE",
        route: routePath,
        userId: session?.sub || null,
        organizationId: session?.organizationId || null,
        request,
      }).catch(() => {});

      logApiCall({
        method,
        route: routePath,
        statusCode: 500,
        durationMs,
        userId: session?.sub || null,
        organizationId: session?.organizationId || null,
        error: error.message,
        request,
      }).catch(() => {});

      return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}
