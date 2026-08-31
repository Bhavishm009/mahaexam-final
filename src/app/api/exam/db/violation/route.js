import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { addPersistentViolation } from "@/lib/exam-db-service";

export async function POST(request) {
  const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Student login required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const attempt = await addPersistentViolation({
      attemptId: body.attemptId,
      studentId: session.sub,
      type: body.type,
      metadata: body.metadata || {},
    });
    return NextResponse.json({
      success: true,
      status: attempt.status,
      violationCount: attempt.violations?.length,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
