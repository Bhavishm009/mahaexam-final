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
  const { examId, startsAt, endsAt } = await request.json();
  const exam = await prisma.exam.findFirst({
    where: { id: examId, organizationId: s.organizationId },
  });
  if (!exam) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }
  const assignment = await prisma.batchExamAssignment.upsert({
    where: { batchId_examId: { batchId: batch.id, examId } },
    update: {
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
    },
    create: {
      batchId: batch.id,
      examId,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
    },
  });
  return NextResponse.json({ assignment });
}
