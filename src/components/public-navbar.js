"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  BookOpen,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Globe,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLanguage } from "@/components/language-provider";
import { useAuth } from "@/components/auth-provider";
import { getInitials } from "@/lib/avatar";

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  const isLoginPage = pathname === "/login" || pathname === "/coaching/login";
  const isRegisterPage = pathname === "/register" || pathname === "/coaching/register";

  const userInitials = getInitials(user?.name);
  const dashboardHref =
    user?.role === "SUPER_ADMIN"
      ? "/admin"
      : user?.role === "COACHING_ADMIN" || user?.role === "TEACHER"
        ? "/coaching/dashboard"
        : "/student/dashboard";

  const profileHref =
    user?.role === "SUPER_ADMIN"
      ? "/admin/profile"
      : user?.role === "COACHING_ADMIN" || user?.role === "TEACHER"
        ? "/coaching/profile"
        : "/student/profile";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 font-black text-white shadow-md shadow-blue-500/20 transition-transform group-hover:scale-105">
            M
          </div>
          <div>
            <span className="flex items-center gap-1.5 text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Maha<span className="text-blue-600 dark:text-blue-400">Exam</span>
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:border-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                महाराष्ट्र
              </span>
            </span>
            <span className="-mt-1 hidden text-[11px] font-semibold text-slate-500 dark:text-slate-400 sm:block">
              {t.portalSubtitle}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 md:flex lg:gap-2">
          <Link
            href="/#exams"
            className="rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-400"
          >
            {t.navMockTests}
          </Link>
          <Link
            href="/#features"
            className="rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-400"
          >
            {t.navFeatures}
          </Link>
          <Link
            href="/#coaching"
            className="rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-400"
          >
            {t.navCoaching}
          </Link>
          <Link
            href="/#pricing"
            className="rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-400"
          >
            {t.navPricing}
          </Link>
          <Link
            href="/#faq"
            className="rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-400"
          >
            {t.navFaq}
          </Link>
        </nav>

        {/* Action Buttons, Language Toggle & Theme Toggle */}
        <div className="hidden items-center gap-2.5 md:flex">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-slate-200 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            title="भाषा बदला / Switch Language"
          >
            <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>{language === "mr" ? "English" : "मराठी"}</span>
          </button>

          <ThemeToggle />

          {loading && !user ? (
            <div className="h-8 w-28 animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-800/80" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link
                href={profileHref}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                title="माझे प्रोफाइल / Profile"
              >
                <div className="grid h-6 w-6 place-items-center rounded-lg bg-blue-600 text-[11px] font-black text-white">
                  {userInitials}
                </div>
                <span className="max-w-[100px] truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                  {user?.name?.split(" ")[0] || "User"}
                </span>
              </Link>
              <Link
                href={dashboardHref}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500 active:scale-95"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>{language === "mr" ? "डॅशबोर्ड" : "Dashboard"}</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50/70 px-2.5 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 active:scale-95 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70"
                title="लॉगआउट करा / Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">{language === "mr" ? "लॉगआउट" : "Logout"}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {!isLoginPage && (
                <Link
                  href="/login"
                  className="rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                >
                  {t.signIn}
                </Link>
              )}
              {!isRegisterPage && (
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500 active:scale-95"
                >
                  <span>{t.startFree}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <Globe className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            <span>{language === "mr" ? "EN" : "मराठी"}</span>
          </button>

          <ThemeToggle />

          {user && (
            <Link
              href={dashboardHref}
              className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-xs font-black text-white shadow-sm"
              title="Dashboard"
            >
              {userInitials}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="animate-in slide-in-from-top-2 border-b border-slate-200 bg-white px-4 py-6 shadow-xl duration-200 dark:border-slate-800 dark:bg-slate-900 md:hidden">
          <nav className="flex flex-col gap-2">
            <Link
              href="/#exams"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-400"
            >
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span>{t.navMockTests}</span>
            </Link>
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-400"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>{t.navFeatures}</span>
            </Link>
            <Link
              href="/#coaching"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-400"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>{t.navCoaching}</span>
            </Link>
            <Link
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-400"
            >
              <BookOpen className="h-4 w-4 text-purple-600" />
              <span>{t.navPricing}</span>
            </Link>

            <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              {loading && !user ? (
                <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-800/80" />
              ) : user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-100 p-3 dark:bg-slate-800/80">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 font-black text-white">
                      {userInitials}
                    </div>
                    <div className="min-w-0 flex-1 truncate">
                      <div className="truncate text-xs font-bold text-slate-900 dark:text-white">
                        {user.name || "User"}
                      </div>
                      <div className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-center text-xs font-bold text-white shadow-md hover:bg-blue-500"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>{language === "mr" ? "माझा डॅशबोर्ड" : "My Dashboard"}</span>
                  </Link>

                  <Link
                    href={profileHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <UserIcon className="h-4 w-4 text-blue-600" />
                    <span>{language === "mr" ? "माझे प्रोफाइल" : "My Profile"}</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-center text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/60 dark:text-rose-300"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{language === "mr" ? "लॉगआउट करा" : "Sign Out"}</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {!isLoginPage && (
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full rounded-xl border border-slate-200 py-2.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      {t.studentSignIn}
                    </Link>
                  )}
                  {!isRegisterPage && (
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full rounded-xl bg-blue-600 py-2.5 text-center text-xs font-bold text-white shadow-md hover:bg-blue-500"
                    >
                      {t.studentRegister}
                    </Link>
                  )}
                  <Link
                    href="/coaching/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full rounded-xl border border-amber-500/30 bg-amber-500/10 py-2.5 text-center text-xs font-bold text-amber-700 dark:text-amber-400"
                  >
                    {t.coachingRegister}
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
