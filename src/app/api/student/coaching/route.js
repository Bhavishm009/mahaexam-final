import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Student login required" }, { status: 401 });
    }

    const userId = session.sub;

    // Fetch batch memberships
    const memberships = await prisma.batchMembership.findMany({
      where: { studentId: userId, status: "ACTIVE" },
      include: {
        batch: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                district: true,
                email: true,
                phone: true,
                teacherProfiles: {
                  include: {
                    user: { select: { id: true, name: true, email: true } },
                  },
                },
              },
            },
            exams: {
              include: {
                exam: {
                  select: {
                    id: true,
                    slug: true,
                    title: true,
                    examType: true,
                    durationMinutes: true,
                    totalQuestions: true,
                    totalMarks: true,
                    negativeMarks: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Group by organization
    const orgMap = new Map();

    for (const m of memberships) {
      const org = m.batch.organization;
      if (!orgMap.has(org.id)) {
        orgMap.set(org.id, {
          id: org.id,
          name: org.name,
          slug: org.slug,
          district: org.district,
          email: org.email,
          phone: org.phone,
          teachers: org.teacherProfiles?.map((tp) => tp.user) || [],
          batches: [],
          exams: [],
        });
      }

      const orgData = orgMap.get(org.id);
      orgData.batches.push({
        id: m.batch.id,
        name: m.batch.name,
        code: m.batch.code,
        joinedAt: m.joinedAt,
      });

      for (const e of m.batch.exams || []) {
        if (e.exam && !orgData.exams.some((x) => x.id === e.exam.id)) {
          orgData.exams.push(e.exam);
        }
      }
    }

    return NextResponse.json({
      organizations: Array.from(orgMap.values()),
      totalEnrolled: orgMap.size,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Student login required" }, { status: 401 });
    }

    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
    }

    const invite = await prisma.coachingInvite.findFirst({
      where: { code: code.trim().toUpperCase(), isActive: true },
      include: { organization: true, batch: true },
    });

    let targetBatchId = invite?.batchId;
    let targetOrgId = invite?.organizationId;

    if (!invite) {
      const org = await prisma.organization.findFirst({
        where: { slug: code.toLowerCase(), status: "ACTIVE" },
        include: { coachingBatches: { where: { isActive: true }, take: 1 } },
      });
      if (!org) {
        return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
      }
      targetOrgId = org.id;
      targetBatchId = org.coachingBatches[0]?.id;
    }

    if (!targetBatchId) {
      let defaultBatch = await prisma.coachingBatch.findFirst({
        where: { organizationId: targetOrgId, isActive: true },
      });
      if (!defaultBatch) {
        defaultBatch = await prisma.coachingBatch.create({
          data: {
            organizationId: targetOrgId,
            name: "General Batch 2025",
            code: `BATCH-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            isActive: true,
          },
        });
      }
      targetBatchId = defaultBatch.id;
    }

    await prisma.batchMembership.upsert({
      where: {
        batchId_studentId: {
          batchId: targetBatchId,
          studentId: session.sub,
        },
      },
      create: {
        batchId: targetBatchId,
        studentId: session.sub,
        status: "ACTIVE",
      },
      update: {
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully joined coaching academy!",
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
