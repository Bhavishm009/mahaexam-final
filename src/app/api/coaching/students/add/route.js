import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendStudentCredentialsEmail } from "@/lib/email";

export async function POST(request) {
  try {
    const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!session || !["COACHING_ADMIN", "TEACHER", "SUPER_ADMIN"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const orgId = session.orgId || session.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "Coaching organization not found" }, { status: 400 });
    }

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, name: true },
    });

    const body = await request.json();
    const { name, email, phone, batchId, sendEmail = true } = body;

    if (!name || (!email && !phone)) {
      return NextResponse.json(
        { error: "Student name and email or phone are required" },
        { status: 400 },
      );
    }

    let targetBatch = null;
    if (batchId) {
      targetBatch = await prisma.coachingBatch.findFirst({
        where: { id: batchId, organizationId: orgId },
      });
    }

    if (!targetBatch) {
      // Find or create default batch
      targetBatch = await prisma.coachingBatch.findFirst({
        where: { organizationId: orgId, isActive: true },
      });
      if (!targetBatch) {
        targetBatch = await prisma.coachingBatch.create({
          data: {
            organizationId: orgId,
            name: "General Batch 2025",
            code: `BATCH-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            isActive: true,
          },
        });
      }
    }

    // Check if user already exists
    const existingUser = email
      ? await prisma.user.findUnique({ where: { email } })
      : await prisma.user.findUnique({ where: { phone } });

    let tempPassword = null;

    if (existingUser) {
      // Connect existing student to batch
      await prisma.batchMembership.upsert({
        where: {
          batchId_studentId: {
            batchId: targetBatch.id,
            studentId: existingUser.id,
          },
        },
        create: {
          batchId: targetBatch.id,
          studentId: existingUser.id,
          status: "ACTIVE",
        },
        update: {
          status: "ACTIVE",
        },
      });

      // Send notification email
      if (sendEmail && existingUser.email) {
        await sendStudentCredentialsEmail({
          email: existingUser.email,
          name: existingUser.name,
          password: "(Your existing platform password)",
          coachingName: org.name,
          batchName: targetBatch.name,
        }).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        message: `Existing student ${existingUser.name} enrolled into ${targetBatch.name}`,
        user: { id: existingUser.id, name: existingUser.name, email: existingUser.email },
        batch: { id: targetBatch.id, name: targetBatch.name },
        isNewUser: false,
      });
    }

    // Create new student
    tempPassword = `Maha@${Math.floor(1000 + Math.random() * 9000)}`;
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const newUser = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          name,
          email: email || null,
          phone: phone || null,
          passwordHash,
          role: "STUDENT",
          status: "ACTIVE",
          studentProfile: {
            create: {
              targetExam: "Police Bharti",
              coachingStatus: "COACHING",
            },
          },
        },
      });

      await tx.batchMembership.create({
        data: {
          batchId: targetBatch.id,
          studentId: u.id,
          status: "ACTIVE",
        },
      });

      return u;
    });

    if (sendEmail && email) {
      await sendStudentCredentialsEmail({
        email,
        name,
        password: tempPassword,
        coachingName: org.name,
        batchName: targetBatch.name,
      }).catch(() => {});
    }

    return NextResponse.json(
      {
        success: true,
        message: `Student ${newUser.name} created and added to ${targetBatch.name}. Login credentials sent via email!`,
        user: { id: newUser.id, name: newUser.name, email: newUser.email },
        credentials: { email: newUser.email, tempPassword },
        batch: { id: targetBatch.id, name: targetBatch.name },
        isNewUser: true,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Add student error:", error);
    return NextResponse.json({ error: error.message || "Failed to add student" }, { status: 500 });
  }
}
