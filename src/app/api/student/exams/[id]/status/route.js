import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { getStudentExamStatus } from "@/lib/exam-access-service";
export async function GET(request, { params }) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "STUDENT") {
    return NextResponse.json({ error: "Student login required" }, { status: 401 });
  }
  return NextResponse.json(await getStudentExamStatus(s.sub, (await params).id));
}
