"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, BookOpen, User } from "lucide-react";
import { NotificationPermissionPrompt } from "@/components/notification-permission-prompt";

export default function StudentDashboard() {
  const [d, setD] = useState(null);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    fetch("/api/student/dashboard")
      .then((r) => r.json())
      .then(setD)
      .catch(() => {});
  }, []);

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
        <Card title={`Live Mock Tests & Official PYQs (एकूण ${d.live?.length || 0} परीक्षा)`}>
          {d.live?.length ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {d.live.slice(0, 15).map((e) => (
                <ExamRow key={e.id} e={e} live />
              ))}
            </div>
          ) : (
            <Empty text="No live exams right now." />
          )}
          {d.live?.length > 15 && (
            <Link
              href="/student/exams"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
            >
              <span>पहा सर्व {d.live.length} परीक्षा आणि मूळ प्रश्नपत्रिका (View All {d.live.length} Live Exams) →</span>
            </Link>
          )}
        </Card>

        <Card title="Recent Exam Results (निकाल)">
          <ResultsList results={d.results?.slice(0, 5) || []} />
          {d.results?.length > 0 && (
            <button
              onClick={() => setTab("results")}
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
            >
              View all results →
            </button>
          )}
        </Card>
      </div>
    </>
  );
}

function Exams({ d }) {
  return (
    <div className="space-y-6">
      <Card title="All Available Examinations">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {d.live?.map((e) => (
            <ExamRow key={e.id} e={e} />
          ))}
          {!d.live?.length && <Empty text="No live exams available." />}
        </div>
      </Card>
    </div>
  );
}

function ExamRow({ e }) {
  return (
    <div className="flex flex-col justify-between gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {e.examType || "CBT Exam"}
          </span>
          <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
            /{e.slug || e.id}
          </span>
        </div>
        <h3 className="mt-1 text-sm font-black text-slate-900 dark:text-white sm:text-base">
          {e.title}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>{e.totalQuestions} questions</span>
          <span>•</span>
          <span>{e.durationMinutes} mins</span>
          <span>•</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {e.source === "FREE_GLOBAL" || e.isFree ? "Free Paper" : "Assigned"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 self-start sm:self-auto">
        <Link
          href={`/exam/${e.slug || e.id}/attempt`}
          className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500 active:scale-95"
        >
          <span>Take Test</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href={`/exam/${e.slug || e.id}`}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Details
        </Link>
      </div>
    </div>
  );
}

function Results({ d }) {
  return (
    <Card title="My Examination Results & Scorecards">
      <ResultsList results={d.results || []} />
    </Card>
  );
}

function ResultsList({ results }) {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {results.map((r) => (
        <Link
          key={r.id}
          href={`/student/results/${r.id}`}
          className="-mx-2 flex items-center justify-between rounded-xl px-2 py-3.5 transition hover:bg-slate-50/80 dark:hover:bg-slate-800/60"
        >
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {r.exam?.title || "Exam Attempt"}
            </div>
            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {r.correct} correct · {r.wrong} wrong · {r.unanswered} unanswered
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">
              {r.percentage}%
            </div>
            <div
              className={`text-[11px] font-bold ${r.passed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
            >
              {r.passed ? "PASSED" : "NEEDS PRACTICE"}
            </div>
          </div>
        </Link>
      ))}
      {!results.length && <Empty text="No exam attempts submitted yet." />}
    </div>
  );
}

function Payments({ d }) {
  return (
    <Card title="Payment & Subscription History">
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {d.purchases?.map((p) => (
          <div key={p.id} className="flex justify-between py-4">
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
