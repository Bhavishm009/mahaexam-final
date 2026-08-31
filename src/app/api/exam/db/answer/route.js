import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { savePersistentAnswer } from "@/lib/exam-db-service";

export async function POST(request) {
  const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Student login required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const answer = await savePersistentAnswer({
      ...body,
      studentId: session.sub,
    });
    return NextResponse.json({ success: true, answer });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }
}
