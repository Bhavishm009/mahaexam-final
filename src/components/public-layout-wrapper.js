"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const PublicNavbar = dynamic(
  () => import("@/components/public-navbar").then((mod) => mod.PublicNavbar),
  { ssr: true },
);

const PublicFooter = dynamic(
  () => import("@/components/public-footer").then((mod) => mod.PublicFooter),
  { ssr: true },
);

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
