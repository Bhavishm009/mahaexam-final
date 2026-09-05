import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    const userId = session?.sub || session?.id || session?.userId;
    if (!session || !userId || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Student login required" }, { status: 401 });
    }

    // 1. Fetch user's direct organization & student profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        organizationId: true,
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
        studentProfile: {
          select: {
            id: true,
            coachingStatus: true,
          },
        },
      },
    });

    // 2. Fetch CoachingBatch memberships (BatchMembership)
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
                    _count: {
                      select: { questions: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // 3. Fetch classic Batch enrollments (BatchStudent)
    const batchStudents = await prisma.batchStudent.findMany({
      where: {
        student: {
          userId: userId,
        },
      },
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
                    _count: {
                      select: { questions: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Group all by organization ID
    const orgMap = new Map();

    function ensureOrg(org) {
      if (!org?.id) return null;
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
      return orgMap.get(org.id);
    }

    // Add direct organization if present
    if (user?.organization) {
      ensureOrg(user.organization);
    }

    // Process BatchMemberships
    for (const m of memberships) {
      if (!m.batch?.organization) continue;
      const orgData = ensureOrg(m.batch.organization);

      if (!orgData.batches.some((b) => b.id === m.batch.id)) {
        orgData.batches.push({
          id: m.batch.id,
          name: m.batch.name,
          code: m.batch.code,
          joinedAt: m.joinedAt,
        });
      }

      for (const e of m.batch.exams || []) {
        if (e.exam && !orgData.exams.some((x) => x.id === e.exam.id)) {
          const qCount = e.exam.totalQuestions || e.exam._count?.questions || 100;
          orgData.exams.push({
            ...e.exam,
            totalQuestions: qCount,
          });
        }
      }
    }

    // Process BatchStudent
    for (const bs of batchStudents) {
      if (!bs.batch?.organization) continue;
      const orgData = ensureOrg(bs.batch.organization);

      if (!orgData.batches.some((b) => b.id === bs.batch.id)) {
        orgData.batches.push({
          id: bs.batch.id,
          name: bs.batch.name,
          code: bs.batch.name,
          joinedAt: bs.joinedAt,
        });
      }

      for (const e of bs.batch.exams || []) {
        if (e.exam && !orgData.exams.some((x) => x.id === e.exam.id)) {
          const qCount = e.exam.totalQuestions || e.exam._count?.questions || 100;
          orgData.exams.push({
            ...e.exam,
            totalQuestions: qCount,
          });
        }
      }
    }

    const organizations = Array.from(orgMap.values());

    return NextResponse.json({
      organizations,
      totalEnrolled: organizations.length,
      hasAcademy: organizations.length > 0 || Boolean(user?.organizationId),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    const userId = session?.sub || session?.id || session?.userId;
    if (!session || !userId || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Student login required" }, { status: 401 });
    }

    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
    }

    const normalizedCode = code.trim().toUpperCase();

    const invite = await prisma.coachingInvite.findFirst({
      where: { code: normalizedCode, isActive: true },
      include: { organization: true, batch: true },
    });

    let targetBatchId = invite?.batchId;
    let targetOrgId = invite?.organizationId;

    if (!invite) {
      const org = await prisma.organization.findFirst({
        where: {
          OR: [{ slug: code.trim().toLowerCase() }, { id: code.trim() }],
          status: "ACTIVE",
        },
        include: { coachingBatches: { where: { isActive: true }, take: 1 } },
      });
      if (!org) {
        return NextResponse.json({ error: "Invalid academy or invite code" }, { status: 404 });
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
            name: "General Batch",
            code: `BATCH-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            isActive: true,
          },
        });
      }
      targetBatchId = defaultBatch.id;
    }

    // 1. Create or activate BatchMembership
    await prisma.batchMembership.upsert({
      where: {
        batchId_studentId: {
          batchId: targetBatchId,
          studentId: userId,
        },
      },
      create: {
        batchId: targetBatchId,
        studentId: userId,
        status: "ACTIVE",
      },
      update: {
        status: "ACTIVE",
      },
    });

    // 2. Link student to organization and update coachingStatus
    await prisma.user.update({
      where: { id: userId },
      data: {
        organizationId: targetOrgId,
      },
    });

    await prisma.studentProfile.upsert({
      where: { userId: userId },
      create: {
        userId: userId,
        coachingStatus: "COACHING",
      },
      update: {
        coachingStatus: "COACHING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully joined academy!",
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
