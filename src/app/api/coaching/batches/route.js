import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
function auth(s) {
  return s && ["COACHING_ADMIN", "TEACHER"].includes(s.role);
}
export async function GET() {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!auth(s)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({
    batches: await prisma.coachingBatch.findMany({
      where: { organizationId: s.organizationId },
      include: { _count: { select: { memberships: true } } },
      orderBy: { createdAt: "desc" },
    }),
  });
}
export async function POST(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!auth(s)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { name } = await request.json();
  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 422 });
  }
  const code = `B${Date.now().toString(36).toUpperCase()}`;
  const batch = await prisma.coachingBatch.create({
    data: { organizationId: s.organizationId, name, code },
  });
  return NextResponse.json({ batch }, { status: 201 });
}
