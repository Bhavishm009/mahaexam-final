import { AppShell } from "@/components/shell";
export default function CoachingLayout({ children }) {
  return (
    <AppShell
      role="coaching"
      title="Coaching Console"
      subtitle="Manage students, papers, batches and results"
    >
      {children}
    </AppShell>
  );
}
