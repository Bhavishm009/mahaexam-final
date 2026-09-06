export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/server-user";
import { AppShell } from "@/components/shell";

export default async function ExamBuilderLayout({ children }) {
  const user = await getServerUser();

  if (!user) {
    redirect("/login?next=/exam-builder");
  }

  // Block students completely from exam builder
  if (user.role === "STUDENT") {
    redirect("/student/dashboard");
  }

  return (
    <AppShell
      role="admin"
      title="Exam Builder"
      subtitle="Create and publish examinations"
      user={user}
    >
      {children}
    </AppShell>
  );
}
