import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { scheduleExamNotifications } from "@/lib/exam-scheduler-service";

export async function GET() {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const exams = await prisma.exam.findMany({
    where: { visibilityMode: { in: ["GLOBAL", "FREE_GLOBAL"] } },
    include: {
      _count: {
        select: {
          questions: true,
          attempts: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ exams });
}

export async function POST(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const b = await request.json();
    if (!b.title || !b.slug || !b.durationMinutes || !b.totalQuestions) {
      return NextResponse.json(
        { error: "title, slug, durationMinutes and totalQuestions are required" },
        { status: 422 },
      );
    }
    const exam = await prisma.exam.create({
      data: {
        title: b.title,
        slug: b.slug,
        description: b.description || null,
        examType: b.examType || "Police Bharti",
        language: b.language || "mr",
        durationMinutes: Number(b.durationMinutes),
        totalQuestions: Number(b.totalQuestions),
        totalMarks: Number(b.totalMarks || b.totalQuestions),
        negativeMarks: Number(b.negativeMarks || 0),
        passingScore:
          b.passingScore === null || b.passingScore === undefined ? null : Number(b.passingScore),
        fullscreenRequired: b.fullscreenRequired !== false,
        startAt: b.startAt ? new Date(b.startAt) : null,
        endAt: b.endAt ? new Date(b.endAt) : null,
        status: b.status || "LIVE",
        createdBy: s.sub,
        organizationId: null,
        visibilityMode: b.isFree === false ? "GLOBAL" : "FREE_GLOBAL",
        isFree: b.isFree !== false,
        price: b.isFree === false ? Number(b.price || 0) : 0,
      },
    });

    // Auto-link existing questions if any
    const existingQuestions = await prisma.question.findMany({
      take: Number(b.totalQuestions),
      orderBy: { createdAt: "asc" },
    });
    if (existingQuestions.length) {
      await prisma.examQuestion.createMany({
        data: existingQuestions.map((q, idx) => ({
          examId: exam.id,
          questionId: q.id,
          questionOrder: idx + 1,
          marks: 1,
          negativeMarks: Number(b.negativeMarks || 0),
        })),
        skipDuplicates: true,
      });
    }

    if (b.sendNotification !== false) {
      await scheduleExamNotifications(exam, { isReschedule: false });
    }
    return NextResponse.json({ exam }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function PATCH(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const {
      id,
      status,
      title,
      examType,
      durationMinutes,
      totalMarks,
      negativeMarks,
      startAt,
      endAt,
      isFree,
      price,
    } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Exam ID is required" }, { status: 400 });
    }

    const dataToUpdate = {};
    if (status) {
      dataToUpdate.status = status;
    }
    if (title) {
      dataToUpdate.title = title;
    }
    if (examType) {
      dataToUpdate.examType = examType;
    }
    if (isFree !== undefined) {
      dataToUpdate.isFree = Boolean(isFree);
      dataToUpdate.visibilityMode = isFree ? "FREE_GLOBAL" : "GLOBAL";
    }
    if (price !== undefined) {
      dataToUpdate.price = Number(price);
    }
    if (durationMinutes !== undefined) {
      dataToUpdate.durationMinutes = Number(durationMinutes);
    }
    if (totalMarks !== undefined) {
      dataToUpdate.totalMarks = Number(totalMarks);
    }
    if (negativeMarks !== undefined) {
      dataToUpdate.negativeMarks = Number(negativeMarks);
    }
    if (startAt !== undefined) {
      dataToUpdate.startAt = startAt ? new Date(startAt) : null;
    }
    if (endAt !== undefined) {
      dataToUpdate.endAt = endAt ? new Date(endAt) : null;
    }

    const updated = await prisma.exam.update({
      where: { id },
      data: dataToUpdate,
    });

    if (startAt !== undefined || status === "SCHEDULED") {
      await scheduleExamNotifications(updated, { isReschedule: true });
    }

    return NextResponse.json({ exam: updated, success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Exam ID is required" }, { status: 400 });
    }
    await prisma.exam.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
