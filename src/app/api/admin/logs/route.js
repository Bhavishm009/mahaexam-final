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
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 200);

    const where = {};

    if (filter === "ERRORS") {
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

    const errorCount = await prisma.auditLog.count({
      where: { action: "APP_ERROR" },
    });

    return NextResponse.json({
      logs,
      totalCount: logs.length,
      errorCount,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to load logs" }, { status: 500 });
  }
}
