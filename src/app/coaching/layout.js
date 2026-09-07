export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/server-user";
import { AppShell } from "@/components/shell";

export default async function CoachingLayout({ children }) {
  const user = await getServerUser();

  if (!user) {
    redirect("/login?next=/coaching/dashboard&expired=1");
  }

  // Block students completely from coaching administration
  if (user.role === "STUDENT") {
    redirect("/student/dashboard");
  }

  return (
    <AppShell
      role="coaching"
      title="Coaching Console"
      subtitle="Manage students, papers, batches and results"
      user={user}
    >
      {children}
    </AppShell>
  );
}
