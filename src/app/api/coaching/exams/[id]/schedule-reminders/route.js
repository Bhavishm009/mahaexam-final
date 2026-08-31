import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { enqueueExamReminder } from "@/lib/job-queue";

export async function POST(request, { params }) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["COACHING_ADMIN", "TEACHER", "SUPER_ADMIN"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: { students: true, batches: { include: { batch: { include: { students: true } } } } },
  });
  if (!exam || (s.organizationId && exam.organizationId !== s.organizationId)) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }
  if (!exam.startAt) {
    return NextResponse.json({ error: "Exam must have a start time" }, { status: 400 });
  }
  const ids = new Set(exam.students.map((x) => x.studentId));
  exam.batches.forEach((b) => b.batch.students.forEach((x) => ids.add(x.studentId)));
  const offsets = [24 * 60, 60, 15];
  const jobs = [];
  for (const studentId of ids) {
    for (const mins of offsets) {
      const runAt = new Date(new Date(exam.startAt).getTime() - mins * 60000);
      if (runAt > new Date()) {
        jobs.push(
          await enqueueExamReminder({ userId: studentId, examId: id, title: exam.title, runAt }),
        );
      }
    }
  }
  return NextResponse.json({ created: jobs.length });
}
