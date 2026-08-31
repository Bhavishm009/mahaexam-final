import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
export async function POST(request, { params }) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const batch = await prisma.coachingBatch.findFirst({
    where: { id: params.id, organizationId: s.organizationId },
  });
  if (!batch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  }
  const { studentId } = await request.json();
  const student = await prisma.user.findFirst({
    where: { id: studentId, role: "STUDENT", organizationId: s.organizationId },
  });
  if (!student) {
    return NextResponse.json({ error: "Student not in coaching" }, { status: 400 });
  }
  const membership = await prisma.batchMembership.upsert({
    where: { batchId_studentId: { batchId: batch.id, studentId } },
    update: { status: "ACTIVE" },
    create: { batchId: batch.id, studentId },
  });
  return NextResponse.json({ membership });
}
