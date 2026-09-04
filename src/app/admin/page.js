import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { auth } from "@/auth";
import { adminStats } from "@/lib/admin-service";
import { AdminDashboardClient } from "./admin-client";

export const metadata = {
  title: "Super Admin Dashboard — MahaExam",
  description: "Platform analytics, organizations, exams, and system administration.",
};

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  let session = await verifySessionToken(token);

  if (!session) {
    try {
      const nextAuthSession = await auth();
      if (nextAuthSession?.user) {
        session = {
          sub: nextAuthSession.user.id,
          role: nextAuthSession.user.role,
        };
      }
    } catch {}
  }

  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
    redirect("/login?next=/admin");
  }

  let initialStats = null;
  try {
    initialStats = await adminStats();
  } catch (error) {
    console.error("Failed to load admin stats on server:", error);
  }

  return <AdminDashboardClient initialStats={initialStats} />;
}
