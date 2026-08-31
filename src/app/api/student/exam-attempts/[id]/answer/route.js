import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { saveAnswer } from "@/lib/secure-exam-service";
export async function POST(request, { params }) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const b = await request.json();
    const answer = await saveAnswer({
      attemptId: (await params).id,
      userId: s.sub,
      questionId: b.questionId,
      optionId: b.optionId,
      marked: b.marked,
    });
    return NextResponse.json({ answer, savedAt: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json(
      { error: e.message },
      { status: e.message === "TIME_EXPIRED" ? 403 : 400 },
    );
  }
}
