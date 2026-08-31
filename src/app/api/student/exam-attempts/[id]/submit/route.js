import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { submitSecureAttempt } from "@/lib/secure-exam-service";
import { evaluateAttempt, rankResult } from "@/lib/evaluation-service";
export async function POST(request, { params }) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const b = await request.json().catch(() => ({}));
    const attempt = await submitSecureAttempt({
      attemptId: (await params).id,
      userId: s.sub,
      reason: b.reason === "AUTO_SUBMITTED" ? "AUTO_SUBMITTED" : "MANUAL_SUBMITTED",
    });
    const result = await evaluateAttempt(attempt.id);
    const ranked = await rankResult(result.id);
    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      status: attempt.status,
      submittedAt: attempt.submittedAt,
      resultId: ranked.id,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
