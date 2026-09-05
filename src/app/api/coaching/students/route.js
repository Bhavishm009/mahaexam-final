import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request) {
  try {
    const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!session || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const orgId = session.organizationId || session.orgId;
    if (!orgId) {
      return NextResponse.json({ error: "Organization ID not found" }, { status: 400 });
    }

    const u = new URL(request.url);
    const q = u.searchParams.get("q") || "";

    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        OR: [
          { organizationId: orgId },
          {
            batchMemberships: {
              some: {
                batch: { organizationId: orgId },
              },
            },
          },
        ],
        AND: q
          ? [
              {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { email: { contains: q, mode: "insensitive" } },
                  { phone: { contains: q } },
                ],
              },
            ]
          : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        studentProfile: {
          select: {
            targetExam: true,
            district: true,
            taluka: true,
            coachingStatus: true,
          },
        },
        batchMemberships: {
          where: {
            batch: { organizationId: orgId },
          },
          select: {
            id: true,
            status: true,
            joinedAt: true,
            batch: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const formatted = students.map((s) => {
      const activeMembership = s.batchMemberships.find((bm) => bm.status === "ACTIVE");
      const latestMembership = s.batchMemberships[0];
      const academyStatus = activeMembership
        ? "ACTIVE"
        : latestMembership?.status === "SUSPENDED" || latestMembership?.status === "REMOVED"
          ? "INACTIVE"
          : "ACTIVE";
      const batch = activeMembership?.batch || latestMembership?.batch || null;

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        status: s.status, // global platform status
        academyStatus, // coaching-specific status: ACTIVE or INACTIVE
        batchName: batch?.name || "General Batch",
        batchId: batch?.id || null,
        batchCode: batch?.code || null,
        membershipId: activeMembership?.id || latestMembership?.id || null,
        targetExam: s.studentProfile?.targetExam || "Police Bharti",
        district: s.studentProfile?.district || null,
        taluka: s.studentProfile?.taluka || null,
        createdAt: s.createdAt,
      };
    });

    return NextResponse.json({ students: formatted });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
