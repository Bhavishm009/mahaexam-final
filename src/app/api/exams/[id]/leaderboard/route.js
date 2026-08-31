import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
export async function GET(request, { params }) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const exam = await prisma.exam.findUnique({
    where: { id: params.id },
    select: { id: true, organizationId: true, visibilityMode: true },
  });
  if (!exam) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const rows = await prisma.examLeaderboard.findMany({
    where: { examId: params.id },
    orderBy: { rank: "asc" },
    take: 100,
    include: { student: { select: { id: true, name: true } } },
  });
  return NextResponse.json({ leaderboard: rows });
}
