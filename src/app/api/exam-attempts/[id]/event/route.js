import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { logEvent } from "@/lib/attempt-engine";
export async function POST(request, { params }) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const b = await request.json();
    return NextResponse.json({ event: await logEvent(s.sub, params.id, b.type, b.metadata || {}) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
