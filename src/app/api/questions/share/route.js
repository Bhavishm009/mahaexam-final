import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { questionId, organizationId } = await request.json();
  if (!questionId || !organizationId) {
    return NextResponse.json({ error: "questionId and organizationId required" }, { status: 422 });
  }
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true, organizationId: true },
  });
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }
  if (s.role !== "SUPER_ADMIN" && question.organizationId !== s.organizationId) {
    return NextResponse.json(
      { error: "You can only share questions owned by your coaching organization" },
      { status: 403 },
    );
  }
  const grant = await prisma.questionShareGrant.upsert({
    where: { questionId_organizationId: { questionId, organizationId } },
    update: { grantedById: s.sub },
    create: { questionId, organizationId, grantedById: s.sub },
  });
  return NextResponse.json({ grant });
}

export async function DELETE(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { questionId, organizationId } = await request.json();
  const q = await prisma.question.findUnique({
    where: { id: questionId },
    select: { organizationId: true },
  });
  if (!q) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }
  if (s.role !== "SUPER_ADMIN" && q.organizationId !== s.organizationId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.questionShareGrant.deleteMany({ where: { questionId, organizationId } });
  return NextResponse.json({ success: true });
}
