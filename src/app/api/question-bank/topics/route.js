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
  const chapterId = u.searchParams.get("chapterId");
  return NextResponse.json({
    topics: await prisma.topic.findMany({
      where: { ...(chapterId ? { chapterId } : {}), active: true },
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
      topic: await prisma.topic.create({
        data: {
          chapterId: b.chapterId,
          name: b.name,
          nameMr: b.nameMr || null,
          slug: b.slug || b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        },
      }),
    },
    { status: 201 },
  );
}
