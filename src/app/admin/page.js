"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  CreditCard,
  Layers,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  BookOpen,
  FileCheck2,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats)
      .catch(() => {});
  }, []);

  async function triggerSeed() {
    if (
      !confirm(
        "Do you want to populate / verify all 27 Mock Exams with 2,700 questions in the database?",
      )
    ) {
      return;
    }
    try {
      setSeeding(true);
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert("✅ " + data.message);
        window.location.reload();
      } else {
        alert("❌ Seeding error: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      alert("❌ Seeding failed: " + e.message);
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Header Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Super Admin Console
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              System Operational
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Platform Administration
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Central dashboard for managing partner academies, global mock tests, user access, and
            error monitoring.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={triggerSeed}
            disabled={seeding}
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-500/20 active:scale-95 disabled:opacity-50 dark:text-emerald-300"
          >
            <Sparkles className="h-4 w-4" />
            <span>{seeding ? "Seeding Database..." : "Seed 27 Exams (1-Click)"}</span>
          </button>
          <Link
            href="/admin/organizations"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-500 active:scale-95"
          >
            <Building2 className="h-4 w-4" />
            <span>+ Add Academy</span>
          </Link>
          <Link
            href="/admin/logs"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Activity className="h-4 w-4 text-rose-500" />
            <span>Error Logs</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      {!stats ? (
        <div className="flex items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white p-12 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-sm font-semibold text-slate-500 dark:text-slate-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span>Loading platform metrics...</span>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Partner Academies",
              val: stats.organizations,
              desc: "Registered coaching institutes",
              icon: Building2,
              color: "text-blue-600 dark:text-blue-400",
              bg: "bg-blue-50 dark:bg-blue-950/40",
              href: "/admin/organizations",
            },
            {
              label: "Total Platform Users",
              val: stats.users,
              desc: "Admins, teachers, students",
              icon: Users,
              color: "text-purple-600 dark:text-purple-400",
              bg: "bg-purple-50 dark:bg-purple-950/40",
              href: "/admin/users",
            },
            {
              label: "Active Students",
              val: stats.students,
              desc: "Registered test candidates",
              icon: FileCheck2,
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-50 dark:bg-emerald-950/40",
              href: "/admin/users",
            },
            {
              label: "Published Live Exams",
              val: stats.exams,
              desc: "Full 100-Q syllabus tests",
              icon: BookOpen,
              color: "text-amber-600 dark:text-amber-400",
              bg: "bg-amber-50 dark:bg-amber-950/40",
              href: "/admin/global-exams",
            },
            {
              label: "Completed Exam Attempts",
              val: stats.results,
              desc: "Evaluated student submissions",
              icon: Layers,
              color: "text-indigo-600 dark:text-indigo-400",
              bg: "bg-indigo-50 dark:bg-indigo-950/40",
              href: "/admin/analytics",
            },
            {
              label: "Paid Subscriptions",
              val: stats.paidPurchases,
              desc: "Completed transactions",
              icon: CreditCard,
              color: "text-teal-600 dark:text-teal-400",
              bg: "bg-teal-50 dark:bg-teal-950/40",
              href: "/admin/payments",
            },
            {
              label: "Total Gross Earnings",
              val: `₹${Number(stats.revenue || 0).toLocaleString("en-IN")}`,
              desc: "Platform processed revenue",
              icon: CreditCard,
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-50 dark:bg-emerald-950/40",
              href: "/admin/finance",
            },
            {
              label: "System Health & Logs",
              val: "Active",
              desc: "Real-time error diagnostics",
              icon: Activity,
              color: "text-rose-600 dark:text-rose-400",
              bg: "bg-rose-50 dark:bg-rose-950/40",
              href: "/admin/logs",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {item.label}
                    </span>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${item.bg} ${item.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
                    {item.val}
                  </div>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  {item.desc}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Quick Navigation Panel */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-base font-black text-slate-900 dark:text-white">
          Quick Administrative Navigation
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Direct management links for platform modules
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Organizations & Academies",
              desc: "Onboard new coaching institutes with automated credentials email.",
              href: "/admin/organizations",
              icon: Building2,
            },
            {
              title: "User Management & Safe Deletion",
              desc: "Manage teachers, students, and admins. Safely remove users while preserving questions.",
              href: "/admin/users",
              icon: Users,
            },
            {
              title: "System & Error Diagnostics",
              desc: "Monitor live application errors, API issues, and stack traces.",
              href: "/admin/logs",
              icon: Activity,
            },
            {
              title: "Global 100-Question Mock Exams",
              desc: "Configure 27 Maharashtra Police Bharti, Talathi, and MPSC grand tests.",
              href: "/admin/global-exams",
              icon: BookOpen,
            },
            {
              title: "Subscription Plans & Pricing",
              desc: "Set pricing tiers and entitlements for partner academies.",
              href: "/admin/plans",
              icon: Layers,
            },
            {
              title: "Payments & Order Verification",
              desc: "Inspect transactions, student purchases, and Razorpay orders.",
              href: "/admin/payments",
              icon: CreditCard,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white sm:text-sm">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {item.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
