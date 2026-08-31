import { NextResponse } from "next/server";
import { recordViolation } from "@/lib/exam-service";

export async function POST(request) {
  try {
    const body = await request.json();
    const attempt = recordViolation(body.attemptId, body.type, body.metadata || {});
    return NextResponse.json({
      success: true,
      violationCount: attempt.violations.length,
      status: attempt.status,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
