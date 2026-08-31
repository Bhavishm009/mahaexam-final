import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";

export async function POST(request, { params }) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["COACHING_ADMIN", "TEACHER", "SUPER_ADMIN"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const b = await request.json();
  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam || (s.organizationId && exam.organizationId !== s.organizationId)) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }
  const batchIds = b.batchIds || [];
  const studentIds = b.studentIds || [];
  await prisma.examBatch.createMany({
    data: batchIds.map((batchId) => ({ examId: id, batchId })),
    skipDuplicates: true,
  });
  await prisma.examStudent.createMany({
    data: studentIds.map((studentId) => ({ examId: id, studentId })),
    skipDuplicates: true,
  });
  return NextResponse.json({ success: true });
}
