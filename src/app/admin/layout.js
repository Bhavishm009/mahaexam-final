export const dynamic = "force-dynamic";

import { getServerUser } from "@/lib/server-user";
import { AppShell } from "@/components/shell";

export default async function AdminLayout({ children }) {
  const user = await getServerUser();
  return (
    <AppShell role="admin" title="Super Admin" subtitle="Manage the MahaExam platform" user={user}>
      {children}
    </AppShell>
  );
}
