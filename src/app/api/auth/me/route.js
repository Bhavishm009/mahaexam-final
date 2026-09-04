import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(request) {
  const cookieStore = await cookies();
  let token = cookieStore.get(COOKIE)?.value;
  if (!token && request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }
  const session = await verifySessionToken(token);

  let userId = session?.sub;
  if (!userId) {
    try {
      const nextAuthSession = await auth();
      userId = nextAuthSession?.user?.id;
    } catch {}
  }

  if (!userId) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
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
