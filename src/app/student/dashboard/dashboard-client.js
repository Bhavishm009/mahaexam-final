"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, BookOpen, User } from "lucide-react";
import { NotificationPermissionPrompt } from "@/components/notification-permission-prompt";

export function StudentDashboardClient({ initialData }) {
  const [d, setD] = useState(initialData || null);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (!initialData) {
      fetch("/api/student/dashboard")
        .then((r) => r.json())
        .then(setD)
        .catch(() => {});
    }
  }, [initialData]);

  if (!d) {
    return (
      <div className="space-y-6">
        <div className="animate-shimmer h-32 w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-shimmer h-24 rounded-3xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="animate-shimmer h-80 rounded-3xl" />
          <div className="animate-shimmer h-80 rounded-3xl" />
        </div>
      </div>
    );
  }

  const nav = [
    ["overview", "Overview"],
    ["exams", "Available & Live Exams"],
    ["results", "Results & Scorecards"],
    ["payments", "Payments"],
    ["notifications", "Notifications"],
  ];

  return (
    <div className="space-y-6 font-sans">
      <NotificationPermissionPrompt />
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-blue-100 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Maharashtra Exam Prep Portal
            </div>
            <h1 className="mt-3 text-2xl font-black sm:text-3xl">
              Welcome, {d.user?.name || "Student"} 👋
            </h1>
            <p className="mt-1 text-xs text-blue-100 sm:text-sm">
              Prepare for Police Bharti, MPSC, Talathi, ZP & Saralseva exams with live mock tests.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/student/profile"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white/15 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/25"
            >
              <User className="h-3.5 w-3.5" />
              Edit Profile
            </Link>
            <Link
              href="/student/exams"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white px-5 py-2.5 text-xs font-black text-blue-700 shadow-md transition hover:bg-blue-50 active:scale-95"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Browse All Exams
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <nav className="flex gap-2 overflow-x-auto pb-1">
        {nav.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`whitespace-nowrap rounded-2xl px-4 py-2.5 text-xs font-bold transition sm:text-sm ${
              tab === id
                ? "bg-slate-900 text-white shadow-sm dark:bg-blue-600"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Tab Panels */}
      {tab === "overview" && <Overview d={d} setTab={setTab} />}
      {tab === "exams" && <Exams d={d} />}
      {tab === "results" && <Results d={d} />}
      {tab === "payments" && <Payments d={d} />}
      {tab === "notifications" && <Notifications d={d} />}
    </div>
  );
}

function Overview({ d, setTab }) {
  return (
    <>
      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [
            "Live Exams Available",
            d.live?.length || 0,
            "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300",
          ],
          [
            "Upcoming Tests",
            d.upcoming?.length || 0,
            "text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300",
          ],
          [
            "Exams Attempted",
            d.attempts || 0,
            "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-300",
          ],
          [
            "Average Score",
            `${d.averagePercentage || 0}%`,
            "text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300",
          ],
        ].map(([label, val, badgeStyle]) => (
          <div
            key={label}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
                {val}
              </div>
              <span className={`rounded-xl px-2.5 py-1 text-xs font-bold ${badgeStyle}`}>
                Active
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Live Mock Tests (सध्या सुरू असलेल्या चाचण्या)">
          <ExamList items={d.live || []} emptyText="No active live exams currently running." />
        </Card>
        <Card title="Upcoming Exams (आगामी नियोजित चाचण्या)">
          <ExamList items={d.upcoming || []} emptyText="No upcoming exams scheduled right now." />
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Recent Exam Performance (अलीकडील निकाल)">
          <ResultsList items={d.recentResults || []} />
        </Card>
      </div>
    </>
  );
}

function Exams({ d }) {
  return (
    <div className="space-y-6">
      <Card title="All Available Mock Tests">
        <ExamList items={[...(d.live || []), ...(d.upcoming || [])]} emptyText="No exams found." />
      </Card>
    </div>
  );
}

function ExamList({ items, emptyText }) {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {items.map((e) => (
        <div
          key={e.id}
          className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                  e.status === "LIVE"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300"
                }`}
              >
                {e.status}
              </span>
              <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                {e.title}
              </h3>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>⏱ {e.durationMinutes} मिनिटे</span>
              <span>•</span>
              <span>📝 {e._count?.questions || 0} प्रश्न</span>
              <span>•</span>
              <span>🎯 {e.totalMarks || 100} गुण</span>
            </div>
          </div>
          <Link
            href={`/student/exams`}
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-500 active:scale-95"
          >
            <span>परीक्षा द्या</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ))}
      {!items.length && <Empty text={emptyText} />}
    </div>
  );
}

function Results({ d }) {
  return (
    <Card title="Your Exam Results & Analytics">
      <ResultsList items={d.recentResults || []} />
    </Card>
  );
}

function ResultsList({ items }) {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {items.map((r) => (
        <div
          key={r.id}
          className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
        >
          <div>
            <b className="text-sm text-slate-900 dark:text-white">{r.exam?.title || "Exam"}</b>
            <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>गुण: {r.score}</span>
              <span>•</span>
              <span>टक्केवारी: {r.percentage}%</span>
              <span>•</span>
              <span>{new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <Link
            href={`/student/results`}
            className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            गुणपत्रिका पहा
          </Link>
        </div>
      ))}
      {!items.length && <Empty text="No exam results available yet. Start practicing today!" />}
    </div>
  );
}

function Payments({ d }) {
  return (
    <Card title="Payment & Subscription History">
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {(d.purchases || []).map((p) => (
          <div key={p.id} className="flex justify-between py-3.5">
            <div>
              <b className="text-sm text-slate-900 dark:text-white">
                {p.exam?.title || "Exam Package"}
              </b>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(p.purchasedAt).toLocaleString()}
              </div>
            </div>
            <div className="font-bold text-slate-900 dark:text-white">
              ₹{(p.amount / 100).toLocaleString("en-IN")}
            </div>
          </div>
        ))}
        {!d.purchases?.length && (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
            All currently available mock tests are 100% free. No payments required.
          </div>
        )}
      </div>
    </Card>
  );
}

function Notifications({ d }) {
  return (
    <Card title="Notifications">
      <NotificationsList items={d.notifications || []} />
    </Card>
  );
}

function NotificationsList({ items }) {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {items.map((n) => (
        <div key={n.id} className={`py-3.5 ${n.readAt ? "opacity-60" : ""}`}>
          <div className="flex justify-between gap-4">
            <b className="text-sm text-slate-900 dark:text-white">{n.title}</b>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {new Date(n.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{n.message}</p>
        </div>
      ))}
      {!items.length && <Empty text="No new notifications. You're all caught up." />}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <h2 className="text-base font-black text-slate-900 dark:text-white sm:text-lg">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Empty({ text }) {
  return (
    <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
      {text}
    </div>
  );
}
