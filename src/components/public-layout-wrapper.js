"use client";

import { usePathname } from "next/navigation";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";

export function PublicLayoutWrapper({ children }) {
  const pathname = usePathname();

  // Check if current route is a dashboard / shell / exam attempt route that should not have public navbar/footer
  const isDashboard =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/student") ||
    (pathname.startsWith("/coaching") &&
      !pathname.startsWith("/coaching/login") &&
      !pathname.startsWith("/coaching/register")) ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/exam-builder") ||
    pathname.startsWith("/questions") ||
    pathname.includes("/attempt") ||
    pathname.includes("/test");

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
