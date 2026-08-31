import { AppShell } from "@/components/shell";
export default function ExamBuilderLayout({ children }) {
  return (
    <AppShell role="admin" title="Exam Builder" subtitle="Create and publish examinations">
      {children}
    </AppShell>
  );
}
