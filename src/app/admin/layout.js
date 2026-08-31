import { AppShell } from "@/components/shell";
export default function AdminLayout({ children }) {
  return (
    <AppShell role="admin" title="Super Admin" subtitle="Manage the MahaExam platform">
      {children}
    </AppShell>
  );
}
