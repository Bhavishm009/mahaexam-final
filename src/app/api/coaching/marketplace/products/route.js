import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
export async function POST(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { examId, price, platformFeePct = 20 } = await request.json();
  const p = Number(platformFeePct);
  const share = 100 - p;
  if (p < 0 || p > 100 || Number(price) <= 0) {
    return NextResponse.json({ error: "Invalid price or fee" }, { status: 422 });
  }
  const exam = await prisma.exam.findFirst({
    where: { id: examId, organizationId: s.organizationId },
  });
  if (!exam) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }
  const product = await prisma.coachingExamProduct.upsert({
    where: { examId },
    update: { price: Number(price), platformFeePct: p, coachSharePct: share, isPublished: true },
    create: {
      organizationId: s.organizationId,
      examId,
      price: Number(price),
      platformFeePct: p,
      coachSharePct: share,
      isPublished: true,
    },
  });
  await prisma.exam.update({
    where: { id: examId },
    data: { isFree: false, price: Number(price) },
  });
  return NextResponse.json({ product });
}
export async function GET() {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    products: await prisma.coachingExamProduct.findMany({
      where: { isPublished: true },
      include: { exam: { select: { id: true, title: true, price: true } } },
      orderBy: { createdAt: "desc" },
    }),
  });
}
