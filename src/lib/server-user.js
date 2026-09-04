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

    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });
  } catch {
    return null;
  }
}
