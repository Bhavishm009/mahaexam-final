import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { listStudentAvailableExams } from "@/lib/exam-access-service";
export async function GET() {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  const userId = s?.role === "STUDENT" ? s.sub : null;
  const exams = await listStudentAvailableExams(userId);
  return NextResponse.json({ exams });
}
