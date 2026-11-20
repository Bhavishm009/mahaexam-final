import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { getExamAccess } from "@/lib/access-service";
export async function GET(request, { params }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const s = await verifySessionToken(cookieStore.get(COOKIE)?.value);
  if (!s || s.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    return NextResponse.json(await getExamAccess(s.sub, id));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
