import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { auth } from "@/auth";
import { getCoachingDashboard } from "@/lib/coaching-dashboard-service";
import { CoachingDashboardClient } from "./coaching-client";

export const metadata = {
  title: "Coaching Dashboard — MahaExam",
  description: "Manage academy batches, students, test series and performance.",
};

export default async function CoachingDashboardPage() {
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
          organizationId: nextAuthSession.user.organizationId,
        };
      }
    } catch {}
  }

  if (!session || !["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(session.role)) {
    redirect("/coaching/login?next=/coaching/dashboard");
  }

  let initialData = null;
  try {
    initialData = await getCoachingDashboard(session);
  } catch (error) {
    console.error("Failed to load coaching dashboard on server:", error);
  }

  return <CoachingDashboardClient initialData={initialData} />;
}
