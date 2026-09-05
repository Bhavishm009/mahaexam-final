/**
 * Next.js Server-Side Instrumentation
 * Initializes universal API logging and global server error handling.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initApiLoggerInterceptor } = await import("./lib/api-logger-interceptor.js");
    initApiLoggerInterceptor();
  }
}

/**
 * Global Server Error Catcher
 * Next.js invokes this hook for any unhandled exceptions during request processing.
 */
export async function onRequestError(err, request, context) {
  try {
    const { prisma } = await import("./lib/db.js");
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : null;
    const pathname = request?.path || context?.routePath || "unknown";
    const method = request?.method || "SERVER";

    console.error(`[UNHANDLED_REQUEST_ERROR] ${method} ${pathname}:`, message);

    await prisma.auditLog.create({
      data: {
        action: "API_ERROR",
        resourceType: "API_EXCEPTION",
        resourceId: `${method} ${pathname}`,
        ipAddress: null,
        userAgent: null,
        metadata: {
          method,
          route: pathname,
          statusCode: 500,
          error: message,
          stack,
          routerKind: context?.routerKind,
          routeType: context?.routeType,
        },
      },
    });
  } catch (loggingErr) {
    console.warn("Failed to log unhandled request error:", loggingErr.message);
  }
}
