import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request, { params }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const s = await verifySessionToken(cookieStore.get(COOKIE)?.value);
  if (!s) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const exam = await prisma.exam.findUnique({
    where: { id },
    select: { id: true, organizationId: true, visibilityMode: true },
  });
  if (!exam) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const rows = await prisma.examLeaderboard.findMany({
    where: { examId: id },
    orderBy: { rank: "asc" },
    take: 100,
    include: { student: { select: { id: true, name: true } } },
  });
  return NextResponse.json(
    { leaderboard: rows },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    },
  );
}
