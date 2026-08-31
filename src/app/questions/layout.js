import { AppShell } from "@/components/shell";
export default function QuestionsLayout({ children }) {
  return (
    <AppShell role="admin" title="Question Management" subtitle="Manage the platform question bank">
      {children}
    </AppShell>
  );
}
