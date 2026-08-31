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
  const { id } = await params;
  const body = await request.json();
  const existing = await prisma.user.findUnique({
    where: { id },
    include: { studentProfile: true },
  });
  if (
    !existing ||
    existing.role !== "STUDENT" ||
    (s.organizationId && existing.organizationId !== s.organizationId)
  ) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }
  const student = await prisma.user.update({
    where: { id },
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      status: body.status || existing.status,
      studentProfile: {
        update: {
          education: body.education || null,
          district: body.district || null,
          taluka: body.taluka || null,
          targetExam: body.targetExam || null,
        },
      },
    },
  });
  return NextResponse.json({ student });
}

export async function DELETE(request, { params }) {
  const s = await session();
  if (!allowed(s)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const existing = await prisma.user.findUnique({ where: { id } });
  if (
    !existing ||
    existing.role !== "STUDENT" ||
    (s.organizationId && existing.organizationId !== s.organizationId)
  ) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }
  await prisma.user.update({ where: { id }, data: { status: "SUSPENDED" } });
  return NextResponse.json({ success: true });
}
