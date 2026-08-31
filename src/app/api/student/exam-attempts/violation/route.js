import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request) {
  try {
    const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
    if (!s) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { attemptId, type = "TAB_SWITCH", count = 1 } = body;

    if (!attemptId) {
      return NextResponse.json({ error: "Attempt ID required" }, { status: 400 });
    }

    await prisma.examAttemptEvent
      .create({
        data: {
          attemptId,
          userId: s.sub,
          type: type === "TAB_SWITCH" ? "TAB_HIDDEN" : "FULLSCREEN_EXIT",
          metadata: { violationType: type, warningCount: count },
        },
      })
      .catch(() => {});

    await prisma.examViolation
      .create({
        data: {
          attemptId,
          studentId: s.sub,
          violationType: type === "FULLSCREEN_EXIT" ? "FULLSCREEN_EXIT" : "TAB_SWITCH",
          warningCount: Number(count),
          occurredAt: new Date(),
        },
      })
      .catch(() => {});

    return NextResponse.json({ success: true, recordedCount: count });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
