import { getServerUser } from "@/lib/server-user";
import { AppShell } from "@/components/shell";

export default async function CoachingLayout({ children }) {
  const user = await getServerUser();
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
