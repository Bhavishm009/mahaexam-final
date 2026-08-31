import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendTeacherCredentialsEmail } from "@/lib/email";

export async function GET() {
  try {
    const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!session || !["COACHING_ADMIN", "SUPER_ADMIN"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const orgId = session.orgId || session.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "Organization not found" }, { status: 400 });
    }

    const teachers = await prisma.user.findMany({
      where: {
        organizationId: orgId,
        role: "TEACHER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        batchesTaught: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ teachers });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!session || !["COACHING_ADMIN", "SUPER_ADMIN"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const orgId = session.orgId || session.organizationId;
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, name: true },
    });

    const body = await request.json();
    const { name, email, phone } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Teacher name and email are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account already exists with this email address." },
        { status: 400 },
      );
    }

    const tempPassword = `Teach@${Math.floor(1000 + Math.random() * 9000)}`;
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const teacher = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          name,
          email,
          phone: phone || null,
          passwordHash,
          role: "TEACHER",
          status: "ACTIVE",
          organizationId: orgId,
          teacherProfile: {
            create: {
              organizationId: orgId,
            },
          },
        },
      });
      return u;
    });

    await sendTeacherCredentialsEmail({
      email,
      name,
      password: tempPassword,
      coachingName: org.name,
    }).catch(() => {});

    return NextResponse.json(
      {
        success: true,
        message: `Teacher ${teacher.name} created. Login credentials sent to ${email}!`,
        teacher: { id: teacher.id, name: teacher.name, email: teacher.email },
        credentials: { email, tempPassword },
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
