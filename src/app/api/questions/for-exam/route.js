import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { canUseQuestion, listQuestionsForExamBuilder } from "@/lib/question-bank-access";

export async function GET(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const u = new URL(request.url);
  const questions = await listQuestionsForExamBuilder(s, {
    search: u.searchParams.get("search") || "",
    difficulty: u.searchParams.get("difficulty") || "",
    limit: u.searchParams.get("limit") || 200,
  });
  return NextResponse.json({ questions });
}

export async function POST(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { questionIds = [] } = await request.json();
  if (!Array.isArray(questionIds) || !questionIds.length) {
    return NextResponse.json({ error: "questionIds required" }, { status: 422 });
  }
  const checks = await Promise.all(questionIds.map((id) => canUseQuestion(s, id)));
  const denied = questionIds.filter((_, i) => !checks[i]);
  if (denied.length) {
    return NextResponse.json(
      { error: "One or more questions are not permitted for this user", denied },
      { status: 403 },
    );
  }
  return NextResponse.json({ allowed: true, count: questionIds.length });
}
