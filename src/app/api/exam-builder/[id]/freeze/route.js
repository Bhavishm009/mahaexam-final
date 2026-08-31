import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { freezeExam } from "@/lib/exam-publish-service";
export async function POST(request, { params }) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    return NextResponse.json({ exam: await freezeExam(s, params.id) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
