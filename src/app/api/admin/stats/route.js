import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { adminStats } from "@/lib/admin-service";

async function guard() {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "SUPER_ADMIN") {
    return null;
  }
  return s;
}
export async function GET() {
  if (!(await guard())) {
    return NextResponse.json({ error: "Super admin access required" }, { status: 403 });
  }
  return NextResponse.json(await adminStats());
}
