import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function authGuard() {
  const token = (await cookies()).get(COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
    return null;
  }
  return session;
}

/**
 * GET /api/admin/global-exams/[id]/questions
 * Fetch all questions currently assigned to an exam.
 */
export async function GET(request, { params }) {
  const session = await authGuard();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Exam ID is required" }, { status: 400 });
  }

  try {
    const exam = await prisma.exam.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        examType: true,
        totalQuestions: true,
        totalMarks: true,
        negativeMarks: true,
        status: true,
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
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, exam });
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
  const session = await authGuard();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Exam ID is required" }, { status: 400 });
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
      return NextResponse.json({
        success: true,
        message: "All selected questions are already linked to this examination.",
        addedCount: 0,
        totalQuestions: existing.length,
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

    // Update totalQuestions on the exam
    const updatedCount = await prisma.examQuestion.count({ where: { examId: id } });
    await prisma.exam.update({
      where: { id },
      data: {
        totalQuestions: updatedCount,
        totalMarks: updatedCount,
      },
    });

    return NextResponse.json({
      success: true,
      addedCount: newIds.length,
      totalQuestions: updatedCount,
      message: `Successfully added ${newIds.length} question(s) to the examination!`,
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
 * Remove a question from an exam and re-index question orders.
 */
export async function DELETE(request, { params }) {
  const session = await authGuard();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Exam ID is required" }, { status: 400 });
  }

  try {
    const url = new URL(request.url);
    let questionId = url.searchParams.get("questionId");

    if (!questionId && request.headers.get("content-type")?.includes("application/json")) {
      const body = await request.json().catch(() => ({}));
      questionId = body.questionId;
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

    // Update totalQuestions on the exam
    await prisma.exam.update({
      where: { id },
      data: {
        totalQuestions: remaining.length,
        totalMarks: remaining.length,
      },
    });

    return NextResponse.json({
      success: true,
      totalQuestions: remaining.length,
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
