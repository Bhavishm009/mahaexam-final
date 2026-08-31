import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";

async function get() {
  return verifySessionToken((await cookies()).get(COOKIE)?.value);
}
export async function PATCH(request, { params }) {
  const s = await get();
  if (!s || !["COACHING_ADMIN", "TEACHER", "SUPER_ADMIN"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const b = await request.json();
  const q = await prisma.question.findUnique({ where: { id } });
  if (!q || (s.organizationId && q.organizationId !== s.organizationId)) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }
  const updated = await prisma.question.update({
    where: { id },
    data: {
      questionText: b.questionText,
      questionTextMr: b.questionTextMr || null,
      difficulty: b.difficulty || q.difficulty,
      marks: Number(b.marks ?? q.marks),
      negativeMarks: Number(b.negativeMarks ?? q.negativeMarks),
      status: b.status || q.status,
    },
  });
  return NextResponse.json({ question: updated });
}
export async function DELETE(request, { params }) {
  const s = await get();
  if (!s || !["COACHING_ADMIN", "TEACHER", "SUPER_ADMIN"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const q = await prisma.question.findUnique({ where: { id } });
  if (!q || (s.organizationId && q.organizationId !== s.organizationId)) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }
  await prisma.question.update({ where: { id }, data: { status: "ARCHIVED" } });
  return NextResponse.json({ success: true });
}
