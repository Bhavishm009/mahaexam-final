import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken, createSessionToken, sessionCookieOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
    }

    const invite = await prisma.coachingInvite.findFirst({
      where: {
        code,
        isActive: true,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            district: true,
            email: true,
            phone: true,
          },
        },
        batch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!invite) {
      // Also try matching by organization slug
      const org = await prisma.organization.findFirst({
        where: { slug: code.toLowerCase(), status: "ACTIVE" },
        select: {
          id: true,
          name: true,
          slug: true,
          district: true,
          email: true,
          phone: true,
          coachingBatches: {
            where: { isActive: true },
            take: 1,
            select: { id: true, name: true, code: true },
          },
        },
      });

      if (org) {
        return NextResponse.json({
          invite: {
            code: org.slug,
            organization: org,
            batch: org.coachingBatches[0] || null,
          },
        });
      }

      return NextResponse.json({ error: "Invalid or expired invite link" }, { status: 404 });
    }

    // Check if current logged in student is already enrolled
    const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    let alreadyEnrolled = false;

    if (session && invite.batchId) {
      const membership = await prisma.batchMembership.findUnique({
        where: {
          batchId_studentId: {
            batchId: invite.batchId,
            studentId: session.sub,
          },
        },
      });
      alreadyEnrolled = Boolean(membership);
    }

    return NextResponse.json({
      invite,
      currentUser: session ? { id: session.sub, role: session.role } : null,
      alreadyEnrolled,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { code, name, email, phone, password, targetExam, district, taluka } = body;

    if (!code) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
    }

    // Find invite
    const invite = await prisma.coachingInvite.findFirst({
      where: { code: code.trim().toUpperCase(), isActive: true },
      include: {
        organization: true,
        batch: true,
      },
    });

    let targetOrgId = null;
    let targetBatchId = null;

    if (invite) {
      targetOrgId = invite.organizationId;
      targetBatchId = invite.batchId;
    } else {
      const org = await prisma.organization.findFirst({
        where: { slug: code.toLowerCase(), status: "ACTIVE" },
        include: { coachingBatches: { where: { isActive: true }, take: 1 } },
      });
      if (!org) {
        return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
      }
      targetOrgId = org.id;
      targetBatchId = org.coachingBatches[0]?.id || null;
    }

    // Ensure we have a target batch
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

    // Check if student is already logged in
    const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    let studentUser = null;
    let token = null;

    if (session && session.role === "STUDENT") {
      studentUser = await prisma.user.findUnique({ where: { id: session.sub } });
      if (studentUser) {
        await prisma.studentProfile.upsert({
          where: { userId: studentUser.id },
          create: {
            userId: studentUser.id,
            targetExam: targetExam || "Police Bharti",
            district: district || null,
            taluka: taluka || null,
            coachingStatus: "COACHING",
          },
          update: {
            coachingStatus: "COACHING",
            ...(district ? { district } : {}),
            ...(taluka ? { taluka } : {}),
            ...(targetExam ? { targetExam } : {}),
          },
        });
      }
    } else {
      // If not logged in, authenticate or create account
      if (!email && !phone) {
        return NextResponse.json({ error: "Email or phone number is required" }, { status: 400 });
      }

      const existing = email
        ? await prisma.user.findUnique({ where: { email } })
        : await prisma.user.findUnique({ where: { phone } });

      if (existing) {
        if (!password) {
          return NextResponse.json(
            { error: "Account exists. Please enter password to join." },
            { status: 401 },
          );
        }
        const ok = await bcrypt.compare(password, existing.passwordHash);
        if (!ok) {
          return NextResponse.json(
            { error: "Invalid password for existing account." },
            { status: 401 },
          );
        }
        studentUser = existing;

        await prisma.studentProfile.upsert({
          where: { userId: studentUser.id },
          create: {
            userId: studentUser.id,
            targetExam: targetExam || "Police Bharti",
            district: district || null,
            taluka: taluka || null,
            coachingStatus: "COACHING",
          },
          update: {
            coachingStatus: "COACHING",
            ...(district ? { district } : {}),
            ...(taluka ? { taluka } : {}),
            ...(targetExam ? { targetExam } : {}),
          },
        });
      } else {
        if (!password || password.length < 6) {
          return NextResponse.json(
            { error: "Password must be at least 6 characters." },
            { status: 400 },
          );
        }
        const passwordHash = await bcrypt.hash(password, 12);
        studentUser = await prisma.user.create({
          data: {
            name: name || "Student",
            email: email || null,
            phone: phone || null,
            passwordHash,
            role: "STUDENT",
            status: "ACTIVE",
            organizationId: targetOrgId,
            studentProfile: {
              create: {
                targetExam: targetExam || "Police Bharti",
                district: district || null,
                taluka: taluka || null,
                coachingStatus: "COACHING",
              },
            },
          },
        });
      }

      token = await createSessionToken(studentUser);
    }

    // Attach student to coaching batch
    await prisma.batchMembership.upsert({
      where: {
        batchId_studentId: {
          batchId: targetBatchId,
          studentId: studentUser.id,
        },
      },
      create: {
        batchId: targetBatchId,
        studentId: studentUser.id,
        status: "ACTIVE",
      },
      update: {
        status: "ACTIVE",
      },
    });

    if (targetOrgId && !studentUser.organizationId) {
      await prisma.user.update({
        where: { id: studentUser.id },
        data: { organizationId: targetOrgId },
      });
    }

    if (invite) {
      await prisma.coachingInvite.update({
        where: { id: invite.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    const response = NextResponse.json({
      success: true,
      message: `You have successfully joined the academy!`,
      redirect: "/student/academies",
    });

    if (token) {
      response.cookies.set(COOKIE, token, sessionCookieOptions());
    }

    return response;
  } catch (error) {
    console.error("Join invite error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
