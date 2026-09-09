"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Globe,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Bell,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLanguage } from "@/components/language-provider";
import { useAuth } from "@/components/auth-provider";
import { UserAvatar } from "@/components/user-avatar";

/**
 * Public default actions shown immediately without waiting on session
 */
function PublicDefaultAuthActions({ isLoginPage, isRegisterPage, t }) {
  return (
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
  );
}

/**
 * Dynamic Auth Actions for Desktop Navbar
 */
function NavbarAuthControls({
  user,
  logout,
  userMenuOpen,
  setUserMenuOpen,
  userMenuRef,
  dashboardHref,
  profileHref,
  isLoginPage,
  isRegisterPage,
  language,
  t,
}) {
  if (user) {
    return (
      <div className="flex items-center gap-2.5">
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen((x) => !x)}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 pr-3 text-xs font-bold text-slate-800 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <UserAvatar src={user?.profilePhoto} name={user?.name} size="xs" />
            <span className="max-w-[110px] truncate font-extrabold text-slate-900 dark:text-white">
              {user?.name?.split(" ")[0] || "Account"}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div className="glass-card absolute right-0 z-50 mt-2 w-56 rounded-2xl p-2.5 shadow-2xl">
              <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                <div className="truncate text-xs font-black text-slate-900 dark:text-white">
                  {user?.name || "User"}
                </div>
                <div className="truncate text-[10px] text-slate-400">{user?.email}</div>
              </div>

              <div className="mt-1 space-y-1">
                <Link
                  href={dashboardHref}
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <LayoutDashboard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>{language === "mr" ? "माझा डॅशबोर्ड" : "Dashboard"}</span>
                </Link>

                <Link
                  href={profileHref}
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>{language === "mr" ? "माझे प्रोफाइल" : "My Profile"}</span>
                </Link>

                <Link
                  href="/student/notifications"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>{language === "mr" ? "सर्व नोटिफिकेशन्स" : "Notifications"}</span>
                </Link>
              </div>

              <div className="mt-1 border-t border-slate-100 pt-1 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{language === "mr" ? "लॉगआउट करा" : "Sign Out"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <PublicDefaultAuthActions isLoginPage={isLoginPage} isRegisterPage={isRegisterPage} t={t} />
  );
}

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  // Close menus automatically on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  const isLoginPage = pathname === "/login" || pathname === "/coaching/login";
  const isRegisterPage = pathname === "/register" || pathname === "/coaching/register";

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
            </span>
            <span className="-mt-1 hidden text-[11px] font-semibold text-slate-500 dark:text-slate-400 sm:block">
              {t.portalSubtitle}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1.5 md:flex lg:gap-2">
          <Link
            href="/exams"
            prefetch={true}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400 ${
              pathname?.startsWith("/exams") || pathname?.startsWith("/exam")
                ? "bg-blue-50 font-bold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                : "text-slate-700 dark:text-slate-200"
            }`}
          >
            {t.navMockTests}
          </Link>
          <Link
            href="/jobs"
            prefetch={true}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400 ${
              pathname === "/jobs"
                ? "bg-blue-50 font-bold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                : "text-slate-700 dark:text-slate-200"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span>{t.navJobs}</span>
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-rose-500" />
            </span>
          </Link>
          <Link
            href="/blogs"
            prefetch={true}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400 ${
              pathname?.startsWith("/blogs")
                ? "bg-blue-50 font-bold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                : "text-slate-700 dark:text-slate-200"
            }`}
          >
            {t.navBlogs}
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
            <span>{language === "mr" ? "मराठी" : "English"}</span>
          </button>

          <ThemeToggle />

          {/* Desktop Auth Controls wrapped in Suspense with instant public fallback */}
          <Suspense
            fallback={
              <PublicDefaultAuthActions
                isLoginPage={isLoginPage}
                isRegisterPage={isRegisterPage}
                t={t}
              />
            }
          >
            <NavbarAuthControls
              user={user}
              logout={logout}
              userMenuOpen={userMenuOpen}
              setUserMenuOpen={setUserMenuOpen}
              userMenuRef={userMenuRef}
              dashboardHref={dashboardHref}
              profileHref={profileHref}
              isLoginPage={isLoginPage}
              isRegisterPage={isRegisterPage}
              language={language}
              t={t}
            />
          </Suspense>
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
              className="shrink-0 transition-transform active:scale-95"
              title="Dashboard"
            >
              <UserAvatar
                src={user?.profilePhoto || user?.studentProfile?.profilePhoto}
                name={user?.name}
                size="sm"
              />
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="shadow-xs grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label={mobileMenuOpen ? "मेनू बंद करा (Close Menu)" : "मेनू उघडा (Open Menu)"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="backdrop-blur-xs fixed inset-0 z-40 bg-slate-950/60 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-down Drawer */}
          <div className="glass-panel animate-in slide-in-from-top-2 relative z-50 max-h-[85vh] overflow-y-auto rounded-b-3xl border-b border-slate-200/80 px-5 py-6 shadow-2xl backdrop-blur-2xl duration-200 dark:border-slate-800/80 md:hidden">
            <nav className="flex flex-col gap-2">
              <Link
                href="/exams"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition ${
                  pathname === "/exams"
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 font-black text-white shadow-md shadow-sky-500/25"
                    : "text-slate-800 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-100 dark:hover:bg-slate-800/80 dark:hover:text-white"
                }`}
              >
                <BookOpen className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                <span>{t.navMockTests}</span>
              </Link>
              <Link
                href="/jobs"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition ${
                  pathname === "/jobs"
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 font-black text-white shadow-md shadow-sky-500/25"
                    : "text-slate-800 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-100 dark:hover:bg-slate-800/80 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-rose-500" />
                  <span>{t.navJobs}</span>
                </div>
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-black text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
                  New
                </span>
              </Link>
              <Link
                href="/blogs"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition ${
                  pathname?.startsWith("/blogs")
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 font-black text-white shadow-md shadow-sky-500/25"
                    : "text-slate-800 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-100 dark:hover:bg-slate-800/80 dark:hover:text-white"
                }`}
              >
                <BookOpen className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                <span>{t.navBlogs}</span>
              </Link>

              {/* Mobile Auth Actions - rendered instantly without pulsing skeleton */}
              <div className="mt-4 flex flex-col gap-2 border-t border-slate-200/70 pt-4 dark:border-slate-800/80">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-100/80 p-3 dark:border-slate-800 dark:bg-slate-900/80">
                      <UserAvatar src={user?.profilePhoto} name={user?.name} size="sm" />
                      <div className="min-w-0 flex-1 truncate">
                        <div className="truncate text-xs font-black text-slate-900 dark:text-white">
                          {user.name || "User"}
                        </div>
                        <div className="truncate text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={dashboardHref}
                      onClick={() => setMobileMenuOpen(false)}
                      className="glass-btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-center text-xs font-bold text-white shadow-md"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>{language === "mr" ? "माझा डॅशबोर्ड" : "My Dashboard"}</span>
                    </Link>

                    <Link
                      href={profileHref}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300/80 bg-white/70 py-2.5 text-center text-xs font-bold text-slate-800 transition hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                      <UserIcon className="h-4 w-4 text-sky-500" />
                      <span>{language === "mr" ? "माझे प्रोफाइल" : "My Profile"}</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200/80 bg-rose-50/90 py-2.5 text-center text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/60 dark:text-rose-300"
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
                        className="w-full rounded-xl border border-slate-300/80 bg-white/80 py-2.5 text-center text-xs font-bold text-slate-800 hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-800"
                      >
                        {t.studentSignIn}
                      </Link>
                    )}
                    {!isRegisterPage && (
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="glass-btn-primary w-full rounded-xl py-2.5 text-center text-xs font-bold text-white shadow-md"
                      >
                        {t.studentRegister}
                      </Link>
                    )}
                    <Link
                      href="/coaching/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full rounded-xl border border-amber-500/30 bg-amber-500/10 py-2.5 text-center text-xs font-bold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
                    >
                      {t.coachingRegister}
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
