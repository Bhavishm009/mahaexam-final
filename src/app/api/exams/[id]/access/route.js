import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { getExamAccess } from "@/lib/access-service";
export async function GET(request, { params }) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    return NextResponse.json(await getExamAccess(s.sub, params.id));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
