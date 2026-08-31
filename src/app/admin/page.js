"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Users, CreditCard, Layers, Activity, LogOut, ShieldCheck } from "lucide-react";

const nav = [
  { name: "Overview", href: "/admin", icon: Layers },
  { name: "Organizations (Academies)", href: "/admin/organizations", icon: Building2 },
  { name: "User Directory", href: "/admin/users", icon: Users },
  { name: "Payments & Revenue", href: "/admin/payments", icon: CreditCard },
  { name: "Subscription Plans", href: "/admin/plans", icon: Layers },
  { name: "System & Error Logs", href: "/admin/logs", icon: Activity },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 font-sans text-white">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden w-72 flex-col justify-between border-r border-slate-800 bg-slate-900/80 p-6 lg:flex">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 font-black text-white shadow-lg shadow-blue-500/30">
                M
              </div>
              <div>
                <div className="text-base font-black tracking-tight text-white">MahaExam</div>
                <div className="text-[11px] font-bold text-blue-400">Super Admin Console</div>
              </div>
            </div>

            <nav className="mt-8 space-y-1.5">
              {nav.map((item) => {
                const Icon = item.icon;
                const active = item.href === "/admin";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition ${
                      active
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-400 transition hover:bg-rose-950/40 hover:text-rose-300"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 p-6 md:p-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Platform Administration
                </span>
              </div>
              <h1 className="mt-2 text-3xl font-black">Platform Overview</h1>
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                Central administration for academies, exams, students, revenue, and system
                diagnostics.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin/organizations"
                className="rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500 active:scale-95"
              >
                + Add Academy
              </Link>
              <Link
                href="/admin/logs"
                className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-slate-700 active:scale-95"
              >
                View System Logs
              </Link>
            </div>
          </div>

          {/* Quick Nav for Mobile (< 1024px) */}
          <div className="mt-6 flex flex-wrap gap-2 lg:hidden">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {!stats ? (
            <div className="mt-12 flex items-center justify-center gap-3 text-sm font-semibold text-slate-400">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <span>Loading platform metrics...</span>
            </div>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Partner Academies",
                  val: stats.organizations,
                  desc: "Active coaching institutes",
                },
                {
                  label: "Total Platform Users",
                  val: stats.users,
                  desc: "Admins, teachers, students",
                },
                { label: "Active Students", val: stats.students, desc: "Registered test takers" },
                { label: "Total Published Exams", val: stats.exams, desc: "Live mock tests" },
                {
                  label: "Completed Results",
                  val: stats.results,
                  desc: "Evaluated student attempts",
                },
                {
                  label: "Paid Subscriptions",
                  val: stats.paidPurchases,
                  desc: "Transactions processed",
                },
                {
                  label: "Total Gross Revenue",
                  val: `₹${Number(stats.revenue || 0).toLocaleString("en-IN")}`,
                  desc: "Platform earnings",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-sm transition hover:border-slate-700"
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {item.label}
                  </div>
                  <div className="mt-2 text-3xl font-black text-white">{item.val}</div>
                  <div className="mt-1 text-[11px] text-slate-500">{item.desc}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
