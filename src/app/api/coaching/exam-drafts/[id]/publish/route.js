import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDraft, validateDraft } from "@/lib/exam-draft-service";
import { audit } from "@/lib/audit";
import { createAssignmentNotifications } from "@/lib/exam-access-service";

export async function POST(request, { params }) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN"].includes(s.role)) {
    return NextResponse.json({ error: "Only admin can publish" }, { status: 403 });
  }
  try {
    const id = (await params).id,
      draft = await getDraft(id, s),
      validation = await validateDraft(id, s);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Draft is not ready", errors: validation.errors },
        { status: 422 },
      );
    }
    const b = await request.json();
    const exam = await prisma.exam.create({
      data: {
        organizationId: draft.organizationId,
        title: draft.title,
        description: draft.description,
        examType: draft.examType,
        language: draft.language,
        durationMinutes: draft.durationMinutes,
        totalQuestions: draft.questions.length,
        passingScore: draft.passingScore,
        fullscreenRequired: draft.fullscreenRequired,
        randomizeQuestions: draft.randomizeQuestions,
        randomizeOptions: draft.randomizeOptions,
        status: b.publishNow ? "PUBLISHED" : "SCHEDULED",
        startAt: b.startAt ? new Date(b.startAt) : null,
        endAt: b.endAt ? new Date(b.endAt) : null,
        questions: {
          create: draft.questions.map((q) => ({
            questionId: q.questionId,
            questionOrder: q.order,
            marks: q.marks,
            negativeMarks: q.negativeMarks,
          })),
        },
        batches: { create: draft.batches.map((x) => ({ batchId: x.batchId })) },
        students: { create: draft.students.map((x) => ({ studentId: x.studentId })) },
      },
    });
    await prisma.examDraft.update({
      where: { id },
      data: { status: b.publishNow ? "PUBLISHED" : "SCHEDULED" },
    });
    await createAssignmentNotifications(exam.id);
    await audit(s, {
      action: "PUBLISH_EXAM_DRAFT",
      resourceType: "EXAM",
      resourceId: exam.id,
      request,
    });
    return NextResponse.json({ exam }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
