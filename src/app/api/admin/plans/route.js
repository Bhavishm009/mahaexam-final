import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { listPlans, updatePlan } from "@/lib/admin-service";
export async function GET() {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ plans: await listPlans() });
}
export async function PATCH(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || s.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id, ...data } = await request.json();
  const allowed = {};
  for (const key of [
    "name",
    "description",
    "price",
    "maxStudents",
    "maxBatches",
    "maxExams",
    "active",
    "features",
  ]) {
    if (data[key] !== undefined) {
      allowed[key] = data[key];
    }
  }
  return NextResponse.json({ plan: await updatePlan(id, allowed) });
}
