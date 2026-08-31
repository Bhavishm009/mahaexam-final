import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session?.sub) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      preferredLanguage: true,
      organizationId: true,
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      studentProfile: {
        select: {
          id: true,
          targetExam: true,
          education: true,
          district: true,
          taluka: true,
          coachingStatus: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 404 });
  }

  return NextResponse.json({
    authenticated: true,
    user,
  });
}
