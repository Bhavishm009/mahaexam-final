"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import { getInitials } from "@/lib/avatar";
import NotificationCenter from "@/components/notification-center";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  ClipboardList,
  BarChart3,
  Trophy,
  Bell,
  CreditCard,
  User,
  LogOut,
  Menu,
  X,
  Database,
  Globe,
  Activity,
  Users,
  Wallet,
  Settings,
  UserCheck,
  Layers3,
  FileText,
  UserCircle,
  ChevronDown,
} from "lucide-react";

const navDefinitions = {
  student: [
    {
      labelMr: "डॅशबोर्ड",
      labelEn: "Dashboard",
      href: "/student/dashboard",
      icon: LayoutDashboard,
    },
    {
      labelMr: "माझ्या अकॅडेमी",
      labelEn: "My Academies",
      href: "/student/academies",
      icon: Building2,
    },
    { labelMr: "माझ्या परीक्षा", labelEn: "My Exams", href: "/student/exams", icon: BookOpen },
    { labelMr: "निकाल व रँक", labelEn: "Results", href: "/student/results", icon: ClipboardList },
    {
      labelMr: "प्रगती विश्लेषण",
      labelEn: "Analytics",
      href: "/student/analytics",
      icon: BarChart3,
    },
    { labelMr: "लीडरबोर्ड", labelEn: "Leaderboard", href: "/student/leaderboard", icon: Trophy },
    { labelMr: "सूचना", labelEn: "Notifications", href: "/student/notifications", icon: Bell },
    {
      labelMr: "माझे पेमेंट्स",
      labelEn: "My Payments",
      href: "/student/payments",
      icon: CreditCard,
    },
    { labelMr: "माझे प्रोफाइल", labelEn: "My Profile", href: "/student/profile", icon: User },
  ],
  coaching: [
    {
      labelMr: "डॅशबोर्ड",
      labelEn: "Dashboard",
      href: "/coaching/dashboard",
      icon: LayoutDashboard,
    },
    { labelMr: "विद्यार्थी", labelEn: "Students", href: "/coaching/students", icon: Users },
    { labelMr: "शिक्षक टीम", labelEn: "Teachers", href: "/coaching/teachers", icon: UserCheck },
    {
      labelMr: "नोंदणी लिंक्स",
      labelEn: "Registration Links",
      href: "/coaching/invites",
      icon: Link,
    },
    { labelMr: "बॅचेस", labelEn: "Batches", href: "/coaching/batches", icon: Layers3 },
    {
      labelMr: "प्रश्न बँक",
      labelEn: "Question Bank",
      href: "/coaching/questions",
      icon: Database,
    },
    { labelMr: "परीक्षा", labelEn: "Exams", href: "/coaching/exams", icon: FileText },
    { labelMr: "निकाल", labelEn: "Results", href: "/coaching/results", icon: ClipboardList },
    { labelMr: "विश्लेषण", labelEn: "Analytics", href: "/coaching/analytics", icon: BarChart3 },
    { labelMr: "उत्पन्न व शुल्क", labelEn: "Finance", href: "/coaching/finance", icon: Wallet },
    {
      labelMr: "सबस्क्रिप्शन",
      labelEn: "Subscription",
      href: "/coaching/subscription",
      icon: CreditCard,
    },
    {
      labelMr: "माझे प्रोफाइल",
      labelEn: "My Profile",
      href: "/coaching/profile",
      icon: User,
    },
  ],
  admin: [
    {
      labelMr: "Dashboard",
      labelEn: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      labelMr: "SEO Management 🚀",
      labelEn: "SEO Management 🚀",
      href: "/admin/seo",
      icon: Globe,
    },
    {
      labelMr: "Job Alerts & Push 🔔",
      labelEn: "Job Alerts & Push 🔔",
      href: "/admin/jobs",
      icon: Bell,
    },
    {
      labelMr: "Blog Posts 📰",
      labelEn: "Blog Posts 📰",
      href: "/admin/blogs",
      icon: FileText,
    },
    {
      labelMr: "System & Error Logs 🚨",
      labelEn: "System & Error Logs 🚨",
      href: "/admin/logs",
      icon: Activity,
    },
    {
      labelMr: "Database Sync & Failover 🗄️",
      labelEn: "Database Sync & Failover 🗄️",
      href: "/admin/db-sync",
      icon: Database,
    },
    {
      labelMr: "Organizations",
      labelEn: "Organizations",
      href: "/admin/organizations",
      icon: Users,
    },
    {
      labelMr: "Global Exams",
      labelEn: "Global Exams",
      href: "/admin/global-exams",
      icon: BookOpen,
    },
    { labelMr: "Questions", labelEn: "Questions", href: "/questions/bank", icon: Database },
    { labelMr: "Analytics", labelEn: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { labelMr: "Payments", labelEn: "Payments", href: "/admin/payments", icon: CreditCard },
    { labelMr: "Finance", labelEn: "Finance", href: "/admin/finance", icon: Wallet },
    { labelMr: "Users", labelEn: "Users", href: "/admin/users", icon: Users },
    { labelMr: "Plans", labelEn: "Plans", href: "/admin/plans", icon: Settings },
    {
      labelMr: "My Profile",
      labelEn: "My Profile",
      href: "/admin/profile",
      icon: User,
    },
  ],
};

function NavLinks({ role, close }) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const items = navDefinitions[role] || navDefinitions.student;

  return (
    <nav className="space-y-1 font-sans">
      {items.map((item) => {
        const isRootDashboard =
          item.href === "/admin" ||
          item.href === "/student/dashboard" ||
          item.href === "/coaching/dashboard";
        const active = isRootDashboard
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        const label = (role === "admin" || language !== "mr") ? item.labelEn : item.labelMr;

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            onClick={close}
            className={`group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all ${
              active
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                active
                  ? "text-white"
                  : "text-slate-400 group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-blue-400"
              }`}
            />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Shell({ children, role = "student", user }) {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user || null);
  const router = useRouter();
  const { language, toggleLanguage } = useLanguage();

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  useEffect(() => {
    if (currentUser) return;
    async function loadCurrentUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (res.ok && data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      } catch {
        // ignore network error
      }
    }
    loadCurrentUser();
  }, [currentUser]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.push("/login");
    router.refresh();
  }

  const roleLabels = {
    STUDENT: "Student Candidate",
    COACHING_ADMIN: "Coaching Academy Admin",
    TEACHER: "Faculty / Teacher",
    SUPER_ADMIN: "Super Admin Console",
  };

  const userInitials = getInitials(currentUser?.name);
  const profileUrl =
    role === "admin"
      ? "/admin/profile"
      : role === "coaching"
        ? "/coaching/profile"
        : "/student/profile";

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar Desktop */}
      <aside
        data-shell-sidebar="true"
        className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white p-4 transition-colors dark:border-slate-800 dark:bg-slate-950 md:flex"
      >
        <div className="space-y-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 px-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 font-black text-white shadow-sm">
              M
            </div>
            <div>
              <div className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                Maha<span className="text-blue-600 dark:text-blue-400">Exam</span>
              </div>
              <div className="text-[10px] font-semibold text-slate-400">
                {roleLabels[currentUser?.role] || roleLabels[user?.role] || (role === "admin" ? "Super Admin Console" : role)}
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="overflow-y-auto pr-1">
            <NavLinks role={role} />
          </div>
        </div>

        {/* Bottom User Card */}
        <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-2.5 dark:bg-slate-900">
            <Link
              href={profileUrl}
              className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl p-1 transition hover:bg-slate-200/60 dark:hover:bg-slate-800"
              title="View Profile"
            >
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-blue-100 font-black text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {userInitials}
              </div>
              <div className="min-w-0 truncate">
                <div className="truncate text-xs font-bold text-slate-900 dark:text-white">
                  {currentUser?.name || user?.name || "User"}
                </div>
                <div className="truncate text-[10px] text-slate-400">
                  {currentUser?.email || user?.email || "Account"}
                </div>
              </div>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/60 dark:hover:text-rose-400"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top App Header */}
        <header
          data-shell-header="true"
          className="sticky top-0 z-30 flex h-16 items-center justify-between gap-1.5 border-b border-slate-200 bg-white/95 px-2.5 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-950/95 sm:px-6"
        >
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="shrink-0 rounded-xl border border-slate-200 p-1.5 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="whitespace-nowrap text-xs font-black tracking-tight text-slate-900 dark:text-white sm:text-sm">
              {role === "student" && (language === "mr" ? "विद्यार्थी डॅशबोर्ड" : "Student Portal")}
              {role === "coaching" && (language === "mr" ? "अकॅडेमी कन्सोल" : "Coaching Portal")}
              {role === "admin" && "Super Admin Console"}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {/* Language Switcher */}
            {role !== "admin" && (
              <button
                type="button"
                onClick={toggleLanguage}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1.5 text-xs font-bold text-slate-800 transition hover:bg-slate-200 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:px-2.5 sm:py-1.5"
                title="Language / भाषा"
              >
                <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">{language === "mr" ? "मराठी" : "English"}</span>
                <span className="sm:hidden">{language === "mr" ? "म" : "EN"}</span>
              </button>
            )}

            <ThemeToggle />

            <NotificationCenter />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 pr-2.5 text-xs font-bold text-slate-800 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <div className="grid h-7 w-7 place-items-center rounded-xl bg-blue-600 font-black text-white">
                  {userInitials}
                </div>
                <span className="hidden sm:inline">
                  {currentUser?.name?.split(" ")[0] || user?.name?.split(" ")[0] || "Account"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    <div className="border-b border-slate-100 px-3 py-2 text-xs dark:border-slate-800">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {currentUser?.name || user?.name || "User"}
                      </div>
                      <div className="truncate text-[10px] text-slate-400">
                        {currentUser?.email || user?.email || "Account"}
                      </div>
                    </div>

                    <Link
                      href={profileUrl}
                      onClick={() => setUserMenuOpen(false)}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <UserCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>{role === "admin" ? "My Profile" : language === "mr" ? "माझे प्रोफाइल" : "My Profile"}</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{role === "admin" ? "Sign Out" : language === "mr" ? "लॉगआउट करा" : "Sign Out"}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main data-shell-main="true" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="animate-in fade-in fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm duration-200 md:hidden"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-in slide-in-from-left flex h-full w-72 flex-col justify-between border-r border-slate-200 bg-white p-4 shadow-2xl transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <Link href="/" className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-600 font-black text-white">
                    M
                  </div>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    Maha<span className="text-blue-600 dark:text-blue-400">Exam</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-y-auto pr-1">
                <NavLinks role={role} close={() => setOpen(false)} />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 py-3 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/60 dark:text-rose-300"
              >
                <LogOut className="h-4 w-4" />
                <span>{role === "admin" ? "Sign Out" : language === "mr" ? "लॉगआउट करा" : "Sign Out"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Alias — all layout files import AppShell
export { Shell as AppShell };
