import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { scheduleExamNotifications } from "@/lib/exam-scheduler-service";

export async function GET() {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const exams = await prisma.exam.findMany({
    where: s.role === "SUPER_ADMIN" ? {} : { organizationId: s.organizationId },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      slug: true,
      examType: true,
      visibilityMode: true,
      status: true,
      isFree: true,
      price: true,
      startAt: true,
      endAt: true,
      totalQuestions: true,
      durationMinutes: true,
      createdAt: true,
      _count: { select: { attempts: true, students: true } },
    },
  });
  return NextResponse.json({ exams });
}

export async function POST(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const b = await request.json();
    if (!b.title) {
      return NextResponse.json({ error: "Exam title is required" }, { status: 400 });
    }

    const rawSlug = (b.slug || b.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    let slug = rawSlug || `exam-${Date.now()}`;
    const existing = await prisma.exam.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const questionIds = Array.isArray(b.questionIds) ? b.questionIds : [];
    const totalQuestions = questionIds.length || Number(b.totalQuestions || 25);
    const totalMarks = questionIds.length ? questionIds.length * 1 : Number(b.totalMarks || 25);

    // Determine visibility mode: COACHING (private to institute) vs FREE_GLOBAL (open to all students)
    const visibilityMode =
      b.visibilityMode === "FREE_GLOBAL"
        ? "FREE_GLOBAL"
        : b.visibilityMode === "GLOBAL"
          ? "GLOBAL"
          : "COACHING";
    const isFree = visibilityMode === "FREE_GLOBAL" ? true : Boolean(b.isFree);
    const price = visibilityMode === "FREE_GLOBAL" ? 0 : Number(b.price || 0);

    const exam = await prisma.exam.create({
      data: {
        organizationId: s.organizationId || null,
        title: b.title.trim(),
        slug,
        description: b.description || null,
        examType: b.examType || "Police Bharti",
        language: b.language || "mr",
        durationMinutes: Number(b.durationMinutes || 90),
        totalQuestions,
        totalMarks,
        negativeMarks: Number(b.negativeMarks || 0.25),
        passingScore: b.passingScore ? Number(b.passingScore) : 40,
        status: b.status || "LIVE",
        createdBy: s.sub,
        visibilityMode,
        isFree,
        price,
        startAt: b.startAt ? new Date(b.startAt) : null,
        endAt: b.endAt ? new Date(b.endAt) : null,
      },
    });

    if (questionIds.length > 0) {
      await prisma.examQuestion.createMany({
        data: questionIds.map((qid, idx) => ({
          examId: exam.id,
          questionId: qid,
          questionOrder: idx + 1,
          marks: 1,
          negativeMarks: Number(b.negativeMarks || 0.25),
        })),
        skipDuplicates: true,
      });
    }

    if (b.sendNotification !== false) {
      await scheduleExamNotifications(exam, {
        isReschedule: false,
        batchIds: b.batchIds || [],
      });
    }

    return NextResponse.json({ exam }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
