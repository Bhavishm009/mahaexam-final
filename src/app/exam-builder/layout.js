import { getServerUser } from "@/lib/server-user";
import { AppShell } from "@/components/shell";

export default async function ExamBuilderLayout({ children }) {
  const user = await getServerUser();
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
