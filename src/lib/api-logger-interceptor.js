import http from "node:http";
import { prisma } from "./db.js";
import { COOKIE, verifySessionToken } from "./auth.js";

let isInterceptorInitialized = false;
let lastPruneTime = 0;

/**
 * Retention duration in hours (Default: 6 hours, configurable via API_LOG_RETENTION_HOURS)
 */
export const RETENTION_HOURS = parseInt(process.env.API_LOG_RETENTION_HOURS || "6", 10);

/**
 * Extract specific cookie value from raw cookie header
 */
function getCookieValue(cookieHeader, name) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Periodically purge API logs older than the retention threshold
 */
export async function pruneExpiredApiLogs() {
  try {
    const cutoff = new Date(Date.now() - RETENTION_HOURS * 60 * 60 * 1000);
    const result = await prisma.auditLog.deleteMany({
      where: {
        action: { in: ["API_CALL", "API_ERROR"] },
        createdAt: { lt: cutoff },
      },
    });
    if (result.count > 0) {
      console.log(`[LOGGER_PRUNE] Purged ${result.count} expired API logs older than ${RETENTION_HOURS} hours.`);
    }
    return result.count;
  } catch (err) {
    console.warn("[LOGGER_PRUNE] Failed to prune expired logs:", err.message);
    return 0;
  }
}

/**
 * Initializes the universal HTTP server interceptor for all /api routes
 */
export function initApiLoggerInterceptor() {
  if (isInterceptorInitialized) {
    return;
  }
  isInterceptorInitialized = true;

  const originalEmit = http.Server.prototype.emit;

  http.Server.prototype.emit = function (event, req, res) {
    // Only intercept incoming HTTP requests to /api/ endpoints
    if (
      event === "request" &&
      req &&
      req.url &&
      req.url.startsWith("/api/")
    ) {
      const start = performance.now();
      const rawUrl = req.url;
      const parsedUrl = new URL(rawUrl, "http://localhost");
      const pathname = parsedUrl.pathname;
      const method = (req.method || "GET").toUpperCase();

      // Exclude internal polling and stream endpoints to prevent log bloat / recursive loops
      const isExcluded =
        pathname.startsWith("/api/admin/logs") ||
        pathname === "/api/realtime" ||
        pathname === "/api/ready";

      if (!isExcluded) {
        res.on("finish", async () => {
          try {
            const durationMs = Math.round(performance.now() - start);
            const statusCode = res.statusCode || 200;
            const isError = statusCode >= 400;
            const action = isError ? "API_ERROR" : "API_CALL";

            // Extract client IP and user-agent
            const ipAddress =
              (req.headers["x-forwarded-for"] || "")
                .split(",")[0]
                .trim() ||
              req.socket?.remoteAddress ||
              null;
            const userAgent = req.headers["user-agent"] || null;

            // Extract session user & role from cookies
            const token =
              getCookieValue(req.headers["cookie"], COOKIE) ||
              getCookieValue(req.headers["cookie"], "mahaexam_session") ||
              getCookieValue(req.headers["cookie"], "maha_exam_session");
            let session = null;
            if (token) {
              try {
                session = await verifySessionToken(token);
              } catch (_) {}
            }

            const queryParams = Object.fromEntries(parsedUrl.searchParams.entries());

            const metadata = {
              method,
              route: pathname,
              statusCode,
              durationMs,
              role: session?.role || "ANONYMOUS",
              userEmail: session?.email || null,
              userName: session?.name || null,
              ...(Object.keys(queryParams).length > 0 ? { query: queryParams } : {}),
              ...(isError ? { error: `HTTP ${statusCode} ${res.statusMessage || "Error"}` } : {}),
            };

            // Asynchronously record into auditLog without blocking the response
            await prisma.auditLog.create({
              data: {
                action,
                resourceType: "API_ROUTE",
                resourceId: `${method} ${pathname}`,
                userId: session?.sub || null,
                organizationId: session?.organizationId || null,
                ipAddress,
                userAgent,
                metadata,
              },
            });

            // Trigger background auto-prune once every 30 minutes
            const now = Date.now();
            if (now - lastPruneTime > 30 * 60 * 1000) {
              lastPruneTime = now;
              pruneExpiredApiLogs().catch(() => {});
            }
          } catch (err) {
            console.warn("[API_LOGGER_INTERCEPTOR] Log persist failed:", err.message);
          }
        });
      }
    }

    return originalEmit.apply(this, arguments);
  };

  console.log(`[API_LOGGER] Universal API Interceptor Initialized (Retention: ${RETENTION_HOURS} hours)`);
}
