import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
async function s() {
  return verifySessionToken((await cookies()).get(COOKIE)?.value);
}
export async function GET(request) {
  const session = await s();
  if (!session || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const u = new URL(request.url),
    q = u.searchParams.get("q") || "";
  const students = await prisma.user.findMany({
    where: {
      organizationId: session.organizationId,
      role: "STUDENT",
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, email: true, status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ students });
}
