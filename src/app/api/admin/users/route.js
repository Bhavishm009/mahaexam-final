import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { listUsers, updateUserStatus } from "@/lib/admin-service";
export async function GET() {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ users: await listUsers() });
}
export async function PATCH(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id, status } = await request.json();
  if (!["ACTIVE", "SUSPENDED", "PENDING"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 422 });
  }
  return NextResponse.json({ user: await updateUserStatus(id, status) });
}
