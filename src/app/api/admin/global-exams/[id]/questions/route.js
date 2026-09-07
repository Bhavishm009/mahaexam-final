import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function authGuard(examId) {
  const token = (await cookies()).get(COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session || !["SUPER_ADMIN", "ADMIN", "COACHING_ADMIN", "TEACHER"].includes(session.role)) {
    return null;
  }

  // If role is coaching admin or teacher, verify organization ownership of the exam if applicable
  if (examId && (session.role === "COACHING_ADMIN" || session.role === "TEACHER")) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { organizationId: true, createdBy: true },
    });
    if (
      exam &&
      exam.organizationId &&
      session.organizationId &&
      exam.organizationId !== session.organizationId
    ) {
      return null;
    }
  }

  return session;
}

/**
 * GET /api/admin/global-exams/[id]/questions
 * Fetch all questions currently assigned to an exam, with subject breakdown and subject list.
 */
export async function GET(request, { params }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Exam ID is required" }, { status: 400 });
  }

  const session = await authGuard(id);
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [exam, allSubjects] = await Promise.all([
      prisma.exam.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          slug: true,
          examType: true,
          language: true,
          totalQuestions: true,
          totalMarks: true,
          negativeMarks: true,
          durationMinutes: true,
          status: true,
          organizationId: true,
          questions: {
            include: {
              question: {
                include: {
                  options: {
                    orderBy: { optionOrder: "asc" },
                  },
                  subject: {
                    select: { id: true, name: true, nameMr: true },
                  },
                },
              },
            },
            orderBy: { questionOrder: "asc" },
          },
        },
      }),
      prisma.subject.findMany({
        include: {
          _count: { select: { questions: true } },
        },
        orderBy: { name: "asc" },
      }),
    ]);

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Compute subject breakdown for questions currently in this exam
    const subjectBreakdown = {};
    for (const eq of exam.questions) {
      const subName = eq.question?.subject?.name || "General";
      const subNameMr = eq.question?.subject?.nameMr || subName;
      if (!subjectBreakdown[subName]) {
        subjectBreakdown[subName] = { count: 0, nameMr: subNameMr };
      }
      subjectBreakdown[subName].count += 1;
    }

    return NextResponse.json({
      success: true,
      exam,
      subjectBreakdown,
      allSubjects: allSubjects.map((s) => ({
        id: s.id,
        name: s.name,
        nameMr: s.nameMr,
        questionCount: s._count?.questions || 0,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch exam questions:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load exam questions" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/global-exams/[id]/questions
 * Add selected questions from question bank to an exam.
 */
export async function POST(request, { params }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Exam ID is required" }, { status: 400 });
  }

  const session = await authGuard(id);
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { questionIds, marks, negativeMarks } = body;

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one question to add." },
        { status: 400 },
      );
    }

    const exam = await prisma.exam.findUnique({
      where: { id },
      select: { id: true, negativeMarks: true },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Find existing questions to avoid duplicate adds
    const existing = await prisma.examQuestion.findMany({
      where: { examId: id },
      select: { questionId: true, questionOrder: true },
    });

    const existingIds = new Set(existing.map((e) => e.questionId));
    const newIds = questionIds.filter((qid) => !existingIds.has(qid));

    if (newIds.length === 0) {
      const allLinkedQuestions = await prisma.examQuestion.findMany({
        where: { examId: id },
        include: {
          question: {
            include: {
              options: { orderBy: { optionOrder: "asc" } },
              subject: { select: { id: true, name: true, nameMr: true } },
            },
          },
        },
        orderBy: { questionOrder: "asc" },
      });

      return NextResponse.json({
        success: true,
        message: "All selected questions are already linked to this examination.",
        addedCount: 0,
        totalQuestions: allLinkedQuestions.length,
        questions: allLinkedQuestions,
      });
    }

    let maxOrder = existing.reduce((max, e) => Math.max(max, e.questionOrder), 0);

    const questionRows = newIds.map((qid) => {
      maxOrder += 1;
      return {
        examId: id,
        questionId: qid,
        questionOrder: maxOrder,
        marks: marks !== undefined ? Number(marks) : 1,
        negativeMarks:
          negativeMarks !== undefined ? Number(negativeMarks) : Number(exam.negativeMarks || 0),
      };
    });

    await prisma.examQuestion.createMany({
      data: questionRows,
      skipDuplicates: true,
    });

    // Fetch updated questions for instant UI update without extra roundtrip
    const updatedQuestions = await prisma.examQuestion.findMany({
      where: { examId: id },
      include: {
        question: {
          include: {
            options: { orderBy: { optionOrder: "asc" } },
            subject: { select: { id: true, name: true, nameMr: true } },
          },
        },
      },
      orderBy: { questionOrder: "asc" },
    });

    await prisma.exam.update({
      where: { id },
      data: {
        totalQuestions: updatedQuestions.length,
        totalMarks: updatedQuestions.length,
      },
    });

    const subjectBreakdown = {};
    for (const eq of updatedQuestions) {
      const subName = eq.question?.subject?.name || "General";
      const subNameMr = eq.question?.subject?.nameMr || subName;
      if (!subjectBreakdown[subName]) {
        subjectBreakdown[subName] = { count: 0, nameMr: subNameMr };
      }
      subjectBreakdown[subName].count += 1;
    }

    return NextResponse.json({
      success: true,
      addedCount: newIds.length,
      totalQuestions: updatedQuestions.length,
      questions: updatedQuestions,
      subjectBreakdown,
      message: `Added ${newIds.length} question(s) to paper`,
    });
  } catch (error) {
    console.error("Failed to add questions to exam:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to add questions to exam" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/global-exams/[id]/questions
 * Remove a question from an exam or clear all questions, then re-index question orders.
 */
export async function DELETE(request, { params }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Exam ID is required" }, { status: 400 });
  }

  const session = await authGuard(id);
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    let questionId = url.searchParams.get("questionId");
    let clearAll = url.searchParams.get("clearAll") === "true";

    if (
      !questionId &&
      !clearAll &&
      request.headers.get("content-type")?.includes("application/json")
    ) {
      const body = await request.json().catch(() => ({}));
      questionId = body.questionId;
      clearAll = body.clearAll === true;
    }

    if (clearAll) {
      await prisma.examQuestion.deleteMany({
        where: { examId: id },
      });

      await prisma.exam.update({
        where: { id },
        data: {
          totalQuestions: 0,
          totalMarks: 0,
        },
      });

      return NextResponse.json({
        success: true,
        totalQuestions: 0,
        questions: [],
        subjectBreakdown: {},
        message: "All questions removed from this examination paper.",
      });
    }

    if (!questionId) {
      return NextResponse.json(
        { error: "Question ID is required to remove from exam" },
        { status: 400 },
      );
    }

    await prisma.examQuestion.deleteMany({
      where: {
        examId: id,
        questionId: questionId,
      },
    });

    // Re-index remaining questions
    const remaining = await prisma.examQuestion.findMany({
      where: { examId: id },
      orderBy: { questionOrder: "asc" },
    });

    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].questionOrder !== i + 1) {
        await prisma.examQuestion.update({
          where: { id: remaining[i].id },
          data: { questionOrder: i + 1 },
        });
      }
    }

    // Fetch updated questions for instant UI update
    const updatedQuestions = await prisma.examQuestion.findMany({
      where: { examId: id },
      include: {
        question: {
          include: {
            options: { orderBy: { optionOrder: "asc" } },
            subject: { select: { id: true, name: true, nameMr: true } },
          },
        },
      },
      orderBy: { questionOrder: "asc" },
    });

    // Update totalQuestions and totalMarks on the exam
    await prisma.exam.update({
      where: { id },
      data: {
        totalQuestions: updatedQuestions.length,
        totalMarks: updatedQuestions.length,
      },
    });

    const subjectBreakdown = {};
    for (const eq of updatedQuestions) {
      const subName = eq.question?.subject?.name || "General";
      const subNameMr = eq.question?.subject?.nameMr || subName;
      if (!subjectBreakdown[subName]) {
        subjectBreakdown[subName] = { count: 0, nameMr: subNameMr };
      }
      subjectBreakdown[subName].count += 1;
    }

    return NextResponse.json({
      success: true,
      totalQuestions: updatedQuestions.length,
      questions: updatedQuestions,
      subjectBreakdown,
      message: "Question removed from exam successfully.",
    });
  } catch (error) {
    console.error("Failed to remove question from exam:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to remove question from exam" },
      { status: 500 },
    );
  }
}
