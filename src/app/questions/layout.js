import { getServerUser } from "@/lib/server-user";
import { AppShell } from "@/components/shell";

export default async function QuestionsLayout({ children }) {
  const user = await getServerUser();
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
