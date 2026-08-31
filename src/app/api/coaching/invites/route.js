import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!session || !["COACHING_ADMIN", "TEACHER", "SUPER_ADMIN"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const orgId = session.orgId || session.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "Coaching organization not found" }, { status: 400 });
    }

    const invites = await prisma.coachingInvite.findMany({
      where: { organizationId: orgId },
      include: {
        batch: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const batches = await prisma.coachingBatch.findMany({
      where: { organizationId: orgId, isActive: true },
      select: { id: true, name: true, code: true },
    });

    return NextResponse.json({ invites, batches });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!session || !["COACHING_ADMIN", "TEACHER", "SUPER_ADMIN"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const orgId = session.orgId || session.organizationId;
    const body = await request.json();
    const { batchId, name } = body;

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { slug: true, name: true },
    });

    const code = `${(org.slug || "academy").substring(0, 6).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;

    const invite = await prisma.coachingInvite.create({
      data: {
        organizationId: orgId,
        batchId: batchId || null,
        code,
        name: name || `${org.name} Student Invite Link`,
        isActive: true,
      },
      include: {
        batch: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ success: true, invite }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
