import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { submitAttempt } from "@/lib/attempt-engine";
import { evaluateAndReturn } from "@/lib/result-engine";
export async function POST(request, { params }) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    await submitAttempt(s.sub, params.id, false);
    const result = await evaluateAndReturn(params.id);
    return NextResponse.json({ result });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
