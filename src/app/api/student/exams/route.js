import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { auth } from "@/auth";
import { listStudentAvailableExams } from "@/lib/exam-access-service";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  const s = await verifySessionToken(token);
  let userId = s?.sub || null;

  if (!userId) {
    try {
      const nextAuthSession = await auth();
      userId = nextAuthSession?.user?.id || null;
    } catch {}
  }

  const exams = await listStudentAvailableExams(userId);
  return NextResponse.json({ exams });
}
