import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/server-user";
import { AppShell } from "@/components/shell";

export default async function StudentLayout({ children }) {
  const user = await getServerUser();

  if (!user) {
    redirect("/login?next=/student/dashboard&expired=1");
  }

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
