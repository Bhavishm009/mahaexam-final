import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { listPayments } from "@/lib/admin-service";
export async function GET() {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ payments: await listPayments() });
}
