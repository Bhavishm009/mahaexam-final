"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import { UserAvatar } from "@/components/user-avatar";
import { useAuth } from "@/components/auth-provider";
import NotificationCenter from "@/components/notification-center";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
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
      labelMr: "Database Health & Status 🗄️",
      labelEn: "Database Health & Status 🗄️",
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
    { labelMr: "Questions", labelEn: "Questions", href: "/admin/questions/bank", icon: Database },
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

function NavLinks({ role, close, user }) {
  const pathname = usePathname();
  const { language } = useLanguage();
  let items = navDefinitions[role] || navDefinitions.student;

  if (role === "student") {
    const hasAcademy = Boolean(
      user?.hasAcademy ||
      user?.organizationId ||
      user?.studentProfile?.coachingStatus === "COACHING" ||
      (user?.batchMembershipsCount || 0) > 0 ||
      (user?._count?.batchMemberships || 0) > 0 ||
      (user?.studentProfile?._count?.batchStudents || 0) > 0,
    );
    if (!hasAcademy) {
      items = items.filter((item) => item.href !== "/student/academies");
    }
  }

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
        const label = role === "admin" || language !== "mr" ? item.labelEn : item.labelMr;

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            onClick={close}
            className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
              active
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25 dark:bg-blue-600"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-100"
            }`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                active
                  ? "text-white"
                  : "text-slate-500 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400"
              }`}
            />
            <span className="truncate">{label}</span>
            {active && (
              <span className="absolute right-2 h-1.5 w-1.5 rounded-full bg-white opacity-80" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function Shell({ children, role = "student", user }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user || null);
  const router = useRouter();
  const { language, toggleLanguage } = useLanguage();
  const { user: authUser } = useAuth();

  useEffect(() => {
    if (user) {
      setCurrentUser((prev) => ({
        ...prev,
        ...user,
        profilePhoto: user.profilePhoto || user.studentProfile?.profilePhoto || prev?.profilePhoto,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (authUser) {
      setCurrentUser((prev) => ({
        ...prev,
        ...authUser,
        profilePhoto:
          authUser.profilePhoto || authUser.studentProfile?.profilePhoto || prev?.profilePhoto,
      }));
    }
  }, [authUser]);

  useEffect(() => {
    if (currentUser?.profilePhoto) return;
    async function loadCurrentUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (res.ok && data.authenticated && data.user) {
          setCurrentUser((prev) => ({
            ...prev,
            ...data.user,
            profilePhoto: data.user.profilePhoto || data.user.studentProfile?.profilePhoto || null,
          }));
        }
      } catch {
        // ignore network error
      }
    }
    loadCurrentUser();
  }, [currentUser?.profilePhoto]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.push("/login");
    router.refresh();
  }

  const roleLabels = {
    STUDENT: "Student Candidate",
    COACHING_ADMIN: "Coaching Academy",
    TEACHER: "Faculty / Teacher",
    SUPER_ADMIN: "Super Admin",
  };

  const activeUser = authUser || currentUser || user;
  const profilePhotoUrl =
    currentUser?.profilePhoto ||
    authUser?.profilePhoto ||
    user?.profilePhoto ||
    currentUser?.studentProfile?.profilePhoto ||
    authUser?.studentProfile?.profilePhoto ||
    user?.studentProfile?.profilePhoto ||
    null;

  const profileUrl =
    role === "admin"
      ? "/admin/profile"
      : role === "coaching"
        ? "/coaching/profile"
        : "/student/profile";

  return (
    <div className="flex min-h-screen w-full max-w-full bg-slate-50/70 font-sans text-slate-900 transition-colors dark:bg-[#030712] dark:text-slate-100">
      {/* Sidebar Desktop */}
      <aside
        data-shell-sidebar="true"
        className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-slate-200/80 bg-white p-4 backdrop-blur-xl transition-colors dark:border-slate-800/80 dark:bg-slate-950 md:flex"
      >
        <div className="space-y-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 px-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 font-black text-white shadow-sm shadow-blue-500/20">
              M
            </div>
            <div>
              <div className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                Maha<span className="text-blue-600 dark:text-blue-400">Exam</span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <Badge
                  variant="outline"
                  className="border-slate-200 px-1.5 py-0 text-[10px] font-bold text-slate-500 dark:border-slate-800"
                >
                  {roleLabels[activeUser?.role] || (role === "admin" ? "Admin" : role)}
                </Badge>
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="scrollbar-thin max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
            <NavLinks role={role} user={activeUser} />
          </div>
        </div>

        {/* Bottom User Card */}
        <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/60">
            <Link
              href={profileUrl}
              className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl p-1 transition hover:bg-white dark:hover:bg-slate-800"
              title="View Profile"
            >
              <UserAvatar src={profilePhotoUrl} name={activeUser?.name || "User"} size="xs" />
              <div className="min-w-0 truncate">
                <div className="truncate text-xs font-bold text-slate-900 dark:text-white">
                  {activeUser?.name || "User"}
                </div>
                <div className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                  {activeUser?.email || "Account"}
                </div>
              </div>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/60 dark:hover:text-red-400"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 max-w-full flex-1 flex-col">
        {/* Top App Header */}
        <header
          data-shell-header="true"
          className="sticky top-0 z-40 flex h-16 w-full shrink-0 items-center justify-between gap-1.5 border-b border-slate-200/80 bg-white/80 px-3 backdrop-blur-xl transition-colors dark:border-slate-800/80 dark:bg-slate-950/80 sm:px-6"
        >
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Mobile Sheet Drawer Trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="shrink-0 rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden"
                  aria-label="Open Navigation"
                >
                  <Menu className="h-4 w-4" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="flex w-72 flex-col justify-between p-5">
                <div className="space-y-6">
                  <SheetHeader>
                    <SheetTitle className="text-left">
                      <Link href="/" className="flex items-center gap-3">
                        <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-600 font-black text-white">
                          M
                        </div>
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          Maha<span className="text-blue-600 dark:text-blue-400">Exam</span>
                        </span>
                      </Link>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                    <NavLinks role={role} close={() => setMobileOpen(false)} user={activeUser} />
                  </div>
                </div>

                <div className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <Link
                    href={profileUrl}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <UserAvatar src={profilePhotoUrl} name={activeUser?.name || "User"} size="xs" />
                    <div className="min-w-0 truncate">
                      <div className="truncate text-xs font-bold text-slate-900 dark:text-white">
                        {activeUser?.name || "User"}
                      </div>
                      <div className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                        {activeUser?.email || "Account"}
                      </div>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/80 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/50 dark:text-red-300"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>
                      {role === "admin"
                        ? "Sign Out"
                        : language === "mr"
                          ? "लॉगआउट करा"
                          : "Sign Out"}
                    </span>
                  </button>
                </div>
              </SheetContent>
            </Sheet>

            <div className="whitespace-nowrap text-xs font-black tracking-tight text-slate-900 dark:text-white sm:text-sm">
              {role === "student" && (language === "mr" ? "विद्यार्थी डॅशबोर्ड" : "Student Portal")}
              {role === "coaching" && (language === "mr" ? "अकॅडेमी कन्सोल" : "Coaching Portal")}
              {role === "admin" && "Super Admin Console"}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            {/* Language Switcher */}
            {role !== "admin" && (
              <button
                type="button"
                onClick={toggleLanguage}
                className="shadow-2xs inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                title="Language / भाषा"
              >
                <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">{language === "mr" ? "मराठी" : "English"}</span>
                <span className="sm:hidden">{language === "mr" ? "म" : "EN"}</span>
              </button>
            )}

            <ThemeToggle />

            <NotificationCenter />

            {/* shadcn DropdownMenu for Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="shadow-2xs flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2.5 text-xs font-bold text-slate-800 transition hover:bg-slate-50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <UserAvatar src={profilePhotoUrl} name={activeUser?.name || "User"} size="xs" />
                  <span className="hidden font-bold sm:inline">
                    {activeUser?.name?.split(" ")[0] || "Account"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {activeUser?.name || "User"}
                  </div>
                  <div className="truncate text-[10px] font-normal text-slate-500 dark:text-slate-400">
                    {activeUser?.email || "Account"}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={profileUrl} className="flex w-full items-center gap-2">
                    <UserCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>
                      {role === "admin"
                        ? "My Profile"
                        : language === "mr"
                          ? "माझे प्रोफाइल"
                          : "My Profile"}
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:text-red-400 dark:focus:bg-red-950/50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>
                    {role === "admin" ? "Sign Out" : language === "mr" ? "लॉगआउट करा" : "Sign Out"}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="min-w-0 max-w-full flex-1 p-3.5 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

// Alias — all layout files import AppShell
export { Shell as AppShell };
