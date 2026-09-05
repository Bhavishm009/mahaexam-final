import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RETENTION_HOURS, pruneExpiredLogs } from "@/lib/logger";

export async function GET(request) {
  try {
    const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!s || !["SUPER_ADMIN", "ADMIN"].includes(s.role)) {
      return NextResponse.json(
        { error: "Forbidden: Super Admin access required" },
        { status: 403 },
      );
    }

    // Auto-prune logs older than configured retention hours (default 6 hr)
    try {
      await pruneExpiredLogs();
    } catch (_) {}

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "ALL";
    const method = searchParams.get("method")?.toUpperCase() || "ALL";
    const statusGroup = searchParams.get("statusGroup")?.toUpperCase() || "ALL";
    const role = searchParams.get("role")?.toUpperCase() || "ALL";
    const apiRoute = searchParams.get("apiRoute")?.trim() || "ALL";
    const query = searchParams.get("q")?.trim() || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "150", 10), 500);

    const cutoff = new Date(Date.now() - RETENTION_HOURS * 60 * 60 * 1000);

    const where = {
      createdAt: { gte: cutoff },
    };

    // Action filter
    if (filter === "ERRORS") {
      where.action = { in: ["APP_ERROR", "API_ERROR"] };
    } else if (filter === "API_CALL") {
      where.action = "API_CALL";
    } else if (filter === "API_ERROR") {
      where.action = "API_ERROR";
    } else if (filter === "APP_ERROR") {
      where.action = "APP_ERROR";
    } else if (filter !== "ALL") {
      where.action = filter;
    }

    // API Route Prefix filter (e.g. /api/student, /api/auth)
    if (apiRoute !== "ALL" && apiRoute) {
      where.resourceId = {
        contains: apiRoute,
        mode: "insensitive",
      };
    }

    // Role filter
    if (role !== "ALL") {
      if (role === "ANONYMOUS") {
        where.userId = null;
      } else {
        where.user = {
          role: role,
        };
      }
    }

    // Free-text search
    if (query) {
      where.OR = [
        { action: { contains: query, mode: "insensitive" } },
        { resourceType: { contains: query, mode: "insensitive" } },
        { resourceId: { contains: query, mode: "insensitive" } },
        { user: { name: { contains: query, mode: "insensitive" } } },
        { user: { email: { contains: query, mode: "insensitive" } } },
        { ipAddress: { contains: query, mode: "insensitive" } },
      ];
    }

    let logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // In-memory filters for nested JSON metadata (method and status code)
    if (method !== "ALL") {
      logs = logs.filter((l) => {
        const m = l.metadata?.method || (l.resourceId?.startsWith(method) ? method : null);
        return m?.toUpperCase() === method;
      });
    }

    if (statusGroup !== "ALL") {
      logs = logs.filter((l) => {
        const code = Number(l.metadata?.statusCode) || (l.action === "API_ERROR" ? 500 : 200);
        if (statusGroup === "SUCCESS") return code >= 200 && code < 300;
        if (statusGroup === "CLIENT_ERROR") return code >= 400 && code < 500;
        if (statusGroup === "SERVER_ERROR") return code >= 500;
        return true;
      });
    }

    // Overall metric counts within retention window
    const [totalCount, errorCount, apiCallCount] = await Promise.all([
      prisma.auditLog.count({ where: { createdAt: { gte: cutoff } } }),
      prisma.auditLog.count({
        where: {
          action: { in: ["APP_ERROR", "API_ERROR"] },
          createdAt: { gte: cutoff },
        },
      }),
      prisma.auditLog.count({
        where: { action: "API_CALL", createdAt: { gte: cutoff } },
      }),
    ]);

    // Average latency calculation
    let avgLatencyMs = 0;
    const apiLogs = logs.filter((l) => l.metadata && typeof l.metadata.durationMs === "number");
    if (apiLogs.length > 0) {
      const sum = apiLogs.reduce((acc, l) => acc + l.metadata.durationMs, 0);
      avgLatencyMs = Math.round(sum / apiLogs.length);
    }

    return NextResponse.json({
      success: true,
      logs,
      totalCount,
      errorCount,
      apiCallCount,
      successCount: Math.max(0, apiCallCount - errorCount),
      avgLatencyMs,
      retentionHours: RETENTION_HOURS,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to load logs" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!s || s.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only Super Admin can clear or prune logs" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "all";

    if (mode === "prune") {
      const count = await pruneExpiredLogs();
      return NextResponse.json({
        success: true,
        message: `Pruned ${count} logs older than ${RETENTION_HOURS} hours.`,
        retentionHours: RETENTION_HOURS,
      });
    }

    const deleted = await prisma.auditLog.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Cleared ${deleted.count} log entries successfully.`,
      retentionHours: RETENTION_HOURS,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to clear logs" }, { status: 500 });
  }
}
