import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { getDraft, updateDraft } from "@/lib/exam-draft-service";

async function getS() {
  return verifySessionToken((await cookies()).get(COOKIE)?.value);
}
export async function GET(request, { params }) {
  const s = await getS();
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    return NextResponse.json({ draft: await getDraft((await params).id, s) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}
export async function PATCH(request, { params }) {
  const s = await getS();
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    return NextResponse.json({
      draft: await updateDraft((await params).id, s, await request.json()),
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
