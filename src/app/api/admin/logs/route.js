import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request) {
  try {
    const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!s || !["SUPER_ADMIN", "ADMIN"].includes(s.role)) {
      return NextResponse.json(
        { error: "Forbidden: Super Admin access required" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "ALL";
    const query = searchParams.get("q")?.trim() || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 500);

    const where = {};

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

    if (query) {
      where.OR = [
        { action: { contains: query, mode: "insensitive" } },
        { resourceType: { contains: query, mode: "insensitive" } },
        { resourceId: { contains: query, mode: "insensitive" } },
        { user: { name: { contains: query, mode: "insensitive" } } },
        { user: { email: { contains: query, mode: "insensitive" } } },
      ];
    }

    const logs = await prisma.auditLog.findMany({
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

    const [totalCount, errorCount, apiCallCount] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.count({
        where: { action: { in: ["APP_ERROR", "API_ERROR"] } },
      }),
      prisma.auditLog.count({
        where: { action: "API_CALL" },
      }),
    ]);

    // Calculate average response duration for API calls
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
      avgLatencyMs,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to load logs" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!s || s.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only Super Admin can clear logs" },
        { status: 403 },
      );
    }

    const deleted = await prisma.auditLog.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Cleared ${deleted.count} log entries successfully.`,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to clear logs" }, { status: 500 });
  }
}
