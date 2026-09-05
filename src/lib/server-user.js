import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * Resolves the authenticated user on the server to pass to AppShell,
 * avoiding client-side layout flashing and extra /api/auth/me round-trips.
 */
export async function getServerUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE)?.value;
    let session = await verifySessionToken(token);
    let userId = session?.sub;

    if (!userId) {
      try {
        const nextAuthSession = await auth();
        userId = nextAuthSession?.user?.id;
      } catch {}
    }

    if (!userId) return null;

    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        organizationId: true,
        studentProfile: {
          select: {
            profilePhoto: true,
            coachingStatus: true,
            _count: {
              select: {
                batchStudents: true,
              },
            },
          },
        },
        _count: {
          select: {
            batchMemberships: {
              where: { status: "ACTIVE" },
            },
          },
        },
      },
    });

    if (!u) return null;

    const hasAcademy = Boolean(
      (u._count?.batchMemberships || 0) > 0 ||
      (u.studentProfile?._count?.batchStudents || 0) > 0 ||
      (u.organizationId && u.studentProfile?.coachingStatus === "COACHING")
    );

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      organizationId: u.organizationId,
      profilePhoto: u.studentProfile?.profilePhoto || null,
      studentProfile: u.studentProfile,
      hasAcademy,
    };
  } catch {
    return null;
  }
}
