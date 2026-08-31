import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { getPersistentAttempt } from "@/lib/exam-db-service";

export async function GET(request, { params }) {
  const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Student login required" }, { status: 401 });
  }

  try {
    const { id } = await params;
    return NextResponse.json(await getPersistentAttempt(id, session.sub));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}
