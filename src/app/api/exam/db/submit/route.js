import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { submitPersistentAttempt } from "@/lib/exam-db-service";

export async function POST(request) {
  const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Student login required" }, { status: 401 });
  }

  try {
    const { attemptId } = await request.json();
    const attempt = await submitPersistentAttempt(attemptId, session.sub, false);
    return NextResponse.json({ success: true, attempt });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
