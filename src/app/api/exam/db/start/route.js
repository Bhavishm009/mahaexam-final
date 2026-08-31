import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { startPersistentAttempt } from "@/lib/exam-db-service";
import { hasExamAccess } from "@/lib/access-control";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request) {
  const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Student login required" }, { status: 401 });
  }

  const rl = rateLimit(`exam-start:${session.sub}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
  }

  try {
    const { examId } = await request.json();
    const access = await hasExamAccess({ userId: session.sub, examId });
    if (!access.allowed) {
      return NextResponse.json(
        {
          error:
            access.reason === "PAYMENT_REQUIRED"
              ? "Payment required for this exam."
              : "You cannot access this exam.",
        },
        { status: 403 },
      );
    }
    const attempt = await startPersistentAttempt({ examId, studentId: session.sub });
    return NextResponse.json(attempt);
  } catch (error) {
    const messages = {
      EXAM_NOT_FOUND: "Exam not found.",
      EXAM_NOT_STARTED: "Exam has not started yet.",
      EXAM_ENDED: "Exam has ended.",
      ATTEMPT_LIMIT_REACHED: "Attempt limit reached.",
    };
    return NextResponse.json(
      { error: messages[error.message] || "Unable to start examination." },
      { status: 400 },
    );
  }
}
