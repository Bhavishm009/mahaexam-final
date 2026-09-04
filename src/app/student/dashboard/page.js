import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { auth } from "@/auth";
import { getStudentDashboard } from "@/lib/student-dashboard-service";
import { StudentDashboardClient } from "./dashboard-client";

export const metadata = {
  title: "Student Dashboard — MahaExam",
  description: "Your personalized exam practice and performance dashboard.",
};

export default async function StudentDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  let session = await verifySessionToken(token);
  let userId = session?.sub;

  if (!userId) {
    try {
      const nextAuthSession = await auth();
      userId = nextAuthSession?.user?.id;
      if (nextAuthSession?.user) {
        session = { sub: userId, role: nextAuthSession.user.role };
      }
    } catch {}
  }

  if (!userId) {
    redirect("/login?next=/student/dashboard");
  }

  if (session?.role && session.role !== "STUDENT" && session.role !== "SUPER_ADMIN") {
    if (session.role === "COACHING_ADMIN" || session.role === "TEACHER") {
      redirect("/coaching/dashboard");
    }
  }

  let initialData = null;
  try {
    initialData = await getStudentDashboard(userId);
  } catch (error) {
    console.error("Failed to load student dashboard on server:", error);
  }

  return <StudentDashboardClient initialData={initialData} />;
}
