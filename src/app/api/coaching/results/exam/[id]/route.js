import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
export async function GET(request, { params }) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const exam = await prisma.exam.findUnique({
    where: { id: (await params).id },
    select: { id: true, organizationId: true, title: true },
  });
  if (!exam || (s.role !== "SUPER_ADMIN" && exam.organizationId !== s.organizationId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const results = await prisma.examResultSummary.findMany({
    where: { examId: exam.id },
    include: {
      student: { select: { name: true, email: true } },
      subjectBreakdown: { include: { subject: true } },
    },
    orderBy: { rank: "asc" },
  });
  return NextResponse.json({ exam, results });
}
