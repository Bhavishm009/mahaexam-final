import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";

async function session() {
  return verifySessionToken((await cookies()).get(COOKIE)?.value);
}

function allowed(s) {
  return s && ["COACHING_ADMIN", "TEACHER", "SUPER_ADMIN"].includes(s.role);
}

export async function PATCH(request, { params }) {
  const s = await session();
  if (!allowed(s)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orgId = s.organizationId || s.orgId;
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.user.findUnique({
    where: { id },
    include: {
      studentProfile: true,
      batchMemberships: {
        where: { batch: { organizationId: orgId } },
      },
    },
  });

  if (
    !existing ||
    existing.role !== "STUDENT" ||
    (orgId && existing.organizationId !== orgId && existing.batchMemberships.length === 0)
  ) {
    return NextResponse.json({ error: "Student not found in this academy" }, { status: 404 });
  }

  // 1. Toggle Academy Status (Active / Inactive within this coaching academy)
  if (body.academyStatus) {
    const isDeactivating = body.academyStatus === "INACTIVE" || body.academyStatus === "SUSPENDED";
    const dbStatus = isDeactivating ? "SUSPENDED" : "ACTIVE";
    const responseStatus = isDeactivating ? "INACTIVE" : "ACTIVE";

    await prisma.batchMembership.updateMany({
      where: {
        studentId: id,
        batch: { organizationId: orgId },
      },
      data: {
        status: dbStatus,
      },
    });

    // Check if student has any active memberships remaining
    const remainingActive = await prisma.batchMembership.count({
      where: {
        studentId: id,
        status: "ACTIVE",
      },
    });

    await prisma.studentProfile.upsert({
      where: { userId: id },
      create: {
        userId: id,
        coachingStatus: remainingActive > 0 ? "COACHING" : "INDIVIDUAL",
      },
      update: {
        coachingStatus: remainingActive > 0 ? "COACHING" : "INDIVIDUAL",
      },
    });

    return NextResponse.json({
      success: true,
      academyStatus: responseStatus,
      message: `Student status updated to ${responseStatus} for this academy.`,
    });
  }

  // 2. Change assigned batch
  if (body.batchId) {
    const targetBatch = await prisma.coachingBatch.findFirst({
      where: { id: body.batchId, organizationId: orgId },
    });
    if (targetBatch) {
      await prisma.batchMembership.upsert({
        where: {
          batchId_studentId: {
            batchId: targetBatch.id,
            studentId: id,
          },
        },
        create: {
          batchId: targetBatch.id,
          studentId: id,
          status: "ACTIVE",
        },
        update: {
          status: "ACTIVE",
        },
      });
    }
  }

  // 3. Update student profile details if provided
  const updateData = {};
  if (body.name) updateData.name = body.name;
  if (body.email) updateData.email = body.email;
  if (body.phone !== undefined) updateData.phone = body.phone || null;

  const profileUpdate = {};
  if (body.targetExam) profileUpdate.targetExam = body.targetExam;
  if (body.district !== undefined) profileUpdate.district = body.district || null;
  if (body.taluka !== undefined) profileUpdate.taluka = body.taluka || null;

  if (Object.keys(profileUpdate).length > 0) {
    updateData.studentProfile = {
      upsert: {
        create: {
          ...profileUpdate,
          coachingStatus: "COACHING",
        },
        update: profileUpdate,
      },
    };
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, phone: true },
  });

  return NextResponse.json({ success: true, student: updatedUser });
}

export async function DELETE(request, { params }) {
  const s = await session();
  if (!allowed(s)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orgId = s.organizationId || s.orgId;
  const { id } = await params;

  const existing = await prisma.user.findUnique({
    where: { id },
    include: {
      batchMemberships: {
        where: { batch: { organizationId: orgId } },
      },
    },
  });

  if (
    !existing ||
    existing.role !== "STUDENT" ||
    (orgId && existing.organizationId !== orgId && existing.batchMemberships.length === 0)
  ) {
    return NextResponse.json({ error: "Student not found in this academy" }, { status: 404 });
  }

  // 1. Remove all batch memberships in this academy
  await prisma.batchMembership.deleteMany({
    where: {
      studentId: id,
      batch: { organizationId: orgId },
    },
  });

  // Also clean up any classic batch assignments if present
  await prisma.batchStudent
    .deleteMany({
      where: {
        student: { userId: id },
        batch: { organizationId: orgId },
      },
    })
    .catch(() => {});

  // 2. Unlink direct organizationId if it matches this academy
  if (existing.organizationId === orgId) {
    await prisma.user.update({
      where: { id },
      data: { organizationId: null },
    });
  }

  // 3. Check if student has any other active academy memberships across the platform
  const remainingActiveMemberships = await prisma.batchMembership.count({
    where: {
      studentId: id,
      status: "ACTIVE",
    },
  });

  if (remainingActiveMemberships === 0) {
    await prisma.studentProfile.updateMany({
      where: { userId: id },
      data: { coachingStatus: "INDIVIDUAL" },
    });
  }

  // Notice: The student's User account is PRESERVED and remains ACTIVE on MahaExam.
  // Only the relationship with this academy has been deleted.
  return NextResponse.json({
    success: true,
    message:
      "Student successfully removed from academy. Their MahaExam platform account remains active.",
  });
}
