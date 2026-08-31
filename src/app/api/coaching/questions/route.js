import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";

async function session() {
  return verifySessionToken((await cookies()).get(COOKIE)?.value);
}
function allowed(s) {
  return s && ["COACHING_ADMIN", "TEACHER", "SUPER_ADMIN"].includes(s.role);
}

export async function GET(request) {
  const s = await session();
  if (!allowed(s)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const subjectId = searchParams.get("subjectId");
  const where = {
    ...(s.organizationId ? { organizationId: s.organizationId } : {}),
    ...(subjectId ? { subjectId } : {}),
    ...(search ? { questionText: { contains: search, mode: "insensitive" } } : {}),
  };
  const questions = await prisma.question.findMany({
    where,
    include: { options: true, subject: true, topic: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ questions });
}

export async function POST(request) {
  const s = await session();
  if (!allowed(s)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const b = await request.json();
  if (
    !b.questionText ||
    !b.subjectId ||
    !Array.isArray(b.options) ||
    b.options.length < 2 ||
    b.correctIndex === undefined
  ) {
    return NextResponse.json(
      { error: "Question, subject, options and correct answer are required" },
      { status: 400 },
    );
  }
  const q = await prisma.question.create({
    data: {
      organizationId: s.organizationId || null,
      subjectId: b.subjectId,
      topicId: b.topicId || null,
      questionText: b.questionText,
      questionTextMr: b.questionTextMr || null,
      explanation: b.explanation || null,
      explanationMr: b.explanationMr || null,
      difficulty: b.difficulty || "MEDIUM",
      marks: Number(b.marks || 1),
      negativeMarks: Number(b.negativeMarks || 0),
      status: b.status || "DRAFT",
      createdBy: s.sub,
      options: {
        create: b.options.map((x, i) => ({
          optionText: x.text || x,
          optionTextMr: x.textMr || null,
          optionOrder: i + 1,
          isCorrect: i === Number(b.correctIndex),
        })),
      },
    },
    include: { options: true },
  });
  return NextResponse.json({ question: q }, { status: 201 });
}
