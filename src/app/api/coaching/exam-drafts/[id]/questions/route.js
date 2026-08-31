import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { addDraftQuestions, removeDraftQuestion } from "@/lib/exam-draft-service";
async function s() {
  return verifySessionToken((await cookies()).get(COOKIE)?.value);
}
export async function POST(request, { params }) {
  const session = await s();
  if (!session || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    return NextResponse.json({
      draft: await addDraftQuestions(
        (await params).id,
        session,
        (await request.json()).questions || [],
      ),
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
export async function DELETE(request, { params }) {
  const session = await s();
  if (!session || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const u = new URL(request.url);
    return NextResponse.json({
      draft: await removeDraftQuestion(
        (await params).id,
        session,
        u.searchParams.get("questionId"),
      ),
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
