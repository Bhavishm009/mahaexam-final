import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { listQuestionBank, createQuestion } from "@/lib/question-bank-service";

async function session() {
  return verifySessionToken((await cookies()).get(COOKIE)?.value);
}

export async function GET(request) {
  const s = await session();
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const u = new URL(request.url);
  const items = await listQuestionBank({
    organizationId: s.organizationId,
    subjectId: u.searchParams.get("subjectId") || undefined,
    chapterId: u.searchParams.get("chapterId") || undefined,
    topicId: u.searchParams.get("topicId") || undefined,
    difficulty: u.searchParams.get("difficulty") || undefined,
    search: u.searchParams.get("search") || undefined,
    take: u.searchParams.get("take"),
  });
  return NextResponse.json({ questions: items });
}

export async function POST(request) {
  const s = await session();
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const b = await request.json();
    if (
      !b.questionText ||
      !b.subjectId ||
      !Array.isArray(b.options) ||
      b.options.length < 2 ||
      b.options.filter((o) => o.isCorrect).length !== 1
    ) {
      return NextResponse.json(
        {
          error:
            "Question must have text, subject, at least 2 options and exactly 1 correct answer.",
        },
        { status: 422 },
      );
    }
    return NextResponse.json(
      { question: await createQuestion({ session: s, data: b }) },
      { status: 201 },
    );
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
