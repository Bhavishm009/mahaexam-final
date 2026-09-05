import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listUsers, updateUserStatus } from "@/lib/admin-service";

export async function GET() {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ users: await listUsers() });
}

export async function POST(request) {
  try {
    const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!s || s.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Super Admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { name, email, password, phone, role, organizationId, academyName } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Validation Error: Full name is required." },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Validation Error: A valid email address is required." },
        { status: 400 },
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Validation Error: Password must be at least 6 characters." },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json({ error: "A user with this email address already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    let targetOrgId = organizationId || null;

    if (role === "COACHING_ADMIN" && !targetOrgId && academyName) {
      const slug = `${academyName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.random().toString(36).substring(2, 6)}`;
      const org = await prisma.organization.create({
        data: {
          name: academyName,
          slug,
          status: "ACTIVE",
          planType: "PRO",
        },
      });
      targetOrgId = org.id;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        phone: phone || null,
        role: role || "STUDENT",
        organizationId: targetOrgId,
        status: "ACTIVE",
        ...(role === "STUDENT" ? { studentProfile: { create: {} } } : {}),
        ...(role === "TEACHER" ? { teacherProfile: { create: {} } } : {}),
      },
      include: {
        organization: { select: { name: true } },
      },
    });

    return NextResponse.json(
      { success: true, user, message: "User created successfully!" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 });
  }
}

export async function PATCH(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id, status } = await request.json();
  if (!["ACTIVE", "SUSPENDED", "PENDING"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 422 });
  }
  return NextResponse.json({ user: await updateUserStatus(id, status) });
}

export async function DELETE(request) {
  try {
    const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!s || s.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Super Admin access required" },
        { status: 403 },
      );
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const { deleteUserSafely } = await import("@/lib/admin-service");
    await deleteUserSafely(id);

    return NextResponse.json({
      success: true,
      message: "User deleted safely. All question bank items and exams have been preserved!",
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 });
  }
}
