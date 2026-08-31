import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { getQuestionBankScope } from "@/lib/question-bank-access";
import { prisma } from "@/lib/db";

export async function POST(request, { params }) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const exam = await prisma.exam.findUnique({ where: { id: params.id } });
  if (!exam) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }
  if (s.role !== "SUPER_ADMIN" && exam.organizationId !== s.organizationId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (exam.frozenAt) {
    return NextResponse.json({ error: "Exam is frozen" }, { status: 409 });
  }
  const b = await request.json();
  if (!b.name || !b.questionCount) {
    return NextResponse.json({ error: "name and questionCount required" }, { status: 422 });
  }
  await getQuestionBankScope(s);
  const pool = await prisma.examQuestionPool.create({
    data: {
      examId: params.id,
      name: b.name,
      sectionName: b.sectionName || null,
      questionCount: Number(b.questionCount),
      selectionMode: b.selectionMode || "RANDOM",
      difficulty: b.difficulty || null,
      subjectId: b.subjectId || null,
      topic: b.topic || null,
    },
  });
  return NextResponse.json({ pool }, { status: 201 });
}
export async function GET(request, { params }) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const pools = await prisma.examQuestionPool.findMany({
    where: { examId: params.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ pools });
}
