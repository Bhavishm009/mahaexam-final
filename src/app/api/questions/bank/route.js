import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { canManageQuestionBank, listQuestionsForExamBuilder } from "@/lib/question-bank-access";

export async function GET(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!canManageQuestionBank(s)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const u = new URL(request.url);
  const questions = await listQuestionsForExamBuilder(s, {
    search: u.searchParams.get("search") || "",
    difficulty: u.searchParams.get("difficulty") || "",
    limit: u.searchParams.get("limit") || 100,
  });
  return NextResponse.json({
    mode: s.role === "SUPER_ADMIN" ? "ALL_QUESTION_BANKS" : "OWN_QUESTION_BANK",
    questions,
  });
}
