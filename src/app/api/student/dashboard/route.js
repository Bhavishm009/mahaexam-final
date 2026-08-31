import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { getStudentDashboard } from "@/lib/student-dashboard-service";
export async function GET() {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    return NextResponse.json(await getStudentDashboard(s.sub));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
