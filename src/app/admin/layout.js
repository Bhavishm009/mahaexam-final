export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/server-user";
import { AppShell } from "@/components/shell";

export default async function AdminLayout({ children }) {
  const user = await getServerUser();

  if (!user) {
    redirect("/login?next=/admin&expired=1");
  }

  // Block students completely from the entire Super Admin section
  if (user.role === "STUDENT") {
    redirect("/student/dashboard");
  }

  // Coaching Admins & Teachers should use coaching portal unless managing questions
  if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
    if (user.role === "COACHING_ADMIN" || user.role === "TEACHER") {
      // Allowed for coaching admins/teachers
    } else {
      redirect("/student/dashboard");
    }
  }

  return (
    <AppShell role="admin" title="Super Admin" subtitle="Manage the MahaExam platform" user={user}>
      {children}
    </AppShell>
  );
}
