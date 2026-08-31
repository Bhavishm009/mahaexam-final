import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { assignDraft } from "@/lib/exam-draft-service";
import { prisma } from "@/lib/db";

async function session() {
  return verifySessionToken((await cookies()).get(COOKIE)?.value);
}

export async function GET() {
  const s = await session();
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const [batches, students] = await Promise.all([
    prisma.batch.findMany({
      where: { organizationId: s.organizationId, status: { not: "ARCHIVED" } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { organizationId: s.organizationId, role: "STUDENT", status: { not: "SUSPENDED" } },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return NextResponse.json({ batches, students });
}
export async function POST(request, { params }) {
  const s = await session();
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    return NextResponse.json({
      draft: await assignDraft((await params).id, s, await request.json()),
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
