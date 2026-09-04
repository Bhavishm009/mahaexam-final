"use client";

import Link from "next/link";
import { GraduationCap, ArrowRight, Building2, LayoutDashboard, BookOpen } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useAuth } from "@/components/auth-provider";

export function HeroCta({ initialSession }) {
  const { t } = useLanguage();
  const { user } = useAuth();

  const currentUser = user || initialSession;

  const dashboardHref =
    currentUser?.role === "SUPER_ADMIN"
      ? "/admin"
      : currentUser?.role === "COACHING_ADMIN" || currentUser?.role === "TEACHER"
        ? "/coaching/dashboard"
        : "/student/dashboard";

  if (currentUser) {
    return (
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <Link
          href={dashboardHref}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-500 active:scale-95 sm:px-7 sm:py-4 sm:text-base"
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>माझा डॅशबोर्ड (My Dashboard)</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/student/exams"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800 sm:px-7 sm:py-4 sm:text-base"
        >
          <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span>सर्व उपलब्ध परीक्षा (All Exams)</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
      <Link
        href="/login"
        className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-500 active:scale-95 sm:px-7 sm:py-4 sm:text-base"
      >
        <GraduationCap className="h-5 w-5" />
        <span>{t.heroCtaMock}</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
      <Link
        href="/coaching/register"
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800 sm:px-7 sm:py-4 sm:text-base"
      >
        <Building2 className="h-5 w-5 text-amber-500" />
        <span>{t.heroCtaCoaching}</span>
      </Link>
    </div>
  );
}

