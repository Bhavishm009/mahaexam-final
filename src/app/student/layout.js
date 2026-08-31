import { AppShell } from "@/components/shell";
export default function StudentLayout({ children }) {
  return (
    <AppShell
      role="student"
      title="Student Portal"
      subtitle="Prepare, practice and track your performance"
    >
      {children}
    </AppShell>
  );
}
