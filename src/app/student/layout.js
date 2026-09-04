import { getServerUser } from "@/lib/server-user";
import { AppShell } from "@/components/shell";

export default async function StudentLayout({ children }) {
  const user = await getServerUser();

  return (
    <AppShell
      role="student"
      title="Student Portal"
      subtitle="Prepare, practice and track your performance"
      user={user}
    >
      {children}
    </AppShell>
  );
}
