import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
export async function GET(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const u = new URL(request.url);
  const subjectId = u.searchParams.get("subjectId");
  return NextResponse.json({
    chapters: await prisma.chapter.findMany({
      where: { ...(subjectId ? { subjectId } : {}), active: true },
      orderBy: { sortOrder: "asc" },
    }),
  });
}
export async function POST(request) {
  const s = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  if (!s || !["SUPER_ADMIN", "COACHING_ADMIN"].includes(s.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const b = await request.json();
  return NextResponse.json(
    {
      chapter: await prisma.chapter.create({
        data: {
          subjectId: b.subjectId,
          name: b.name,
          nameMr: b.nameMr || null,
          slug: b.slug || b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        },
      }),
    },
    { status: 201 },
  );
}
