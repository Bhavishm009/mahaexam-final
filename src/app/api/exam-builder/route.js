import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { getBuilderQuestions, createExamWithSnapshot } from "@/lib/exam-builder-service";

async function session() {
  return verifySessionToken((await cookies()).get(COOKIE)?.value);
}

export async function GET(request) {
  const s = await session();
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const u = new URL(request.url);
  try {
    return NextResponse.json({
      questions: await getBuilderQuestions(s, {
        search: u.searchParams.get("search") || "",
        difficulty: u.searchParams.get("difficulty") || "",
      }),
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function POST(request) {
  const s = await session();
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    return NextResponse.json(
      { exam: await createExamWithSnapshot({ session: s, data: await request.json() }) },
      { status: 201 },
    );
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
