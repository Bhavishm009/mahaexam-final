export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/server-user";
import { AppShell } from "@/components/shell";

export default async function QuestionsLayout({ children }) {
  const user = await getServerUser();

  if (!user) {
    redirect("/login?next=/questions/bank");
  }

  // Block students completely from question bank management
  if (user.role === "STUDENT") {
    redirect("/student/dashboard");
  }

  return (
    <AppShell
      role="admin"
      title="Question Management"
      subtitle="Manage the platform question bank"
      user={user}
    >
      {children}
    </AppShell>
  );
}
