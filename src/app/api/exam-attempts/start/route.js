import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { startAttempt } from "@/lib/attempt-engine";
import { getExamAccess } from "@/lib/access-service";
export async function POST(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { examId } = await request.json();
    const access = await getExamAccess(s.sub, examId);
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason, exam: access.exam }, { status: 402 });
    }
    return NextResponse.json(await startAttempt(s.sub, examId), { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
