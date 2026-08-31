import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { recordAttemptEvent } from "@/lib/secure-exam-service";
const allowed = new Set([
  "TAB_HIDDEN",
  "FULLSCREEN_EXIT",
  "COPY_ATTEMPT",
  "PASTE_ATTEMPT",
  "NETWORK_OFFLINE",
  "NETWORK_ONLINE",
  "TIMER_SYNC",
  "QUESTION_MARKED",
  "QUESTION_UNMARKED",
]);
export async function POST(request, { params }) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const b = await request.json();
  if (!allowed.has(b.type)) {
    return NextResponse.json({ error: "Invalid event" }, { status: 422 });
  }
  try {
    return NextResponse.json({
      event: await recordAttemptEvent({
        attemptId: (await params).id,
        userId: s.sub,
        type: b.type,
        metadata: b.metadata || {},
      }),
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
