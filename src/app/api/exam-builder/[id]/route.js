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
    where: { id: params.id },
    include: {
      sections: true,
      questionSnapshots: true,
      questionPools: true,
      publishAudits: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!exam) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (s.role !== "SUPER_ADMIN" && exam.organizationId !== s.organizationId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ exam });
}
