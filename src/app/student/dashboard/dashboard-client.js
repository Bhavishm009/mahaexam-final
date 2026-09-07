"use client";

import { useState, useEffect, useTransition, useOptimistic } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, BookOpen, User } from "lucide-react";
import { NotificationPermissionPrompt } from "@/components/notification-permission-prompt";

export function StudentDashboardClient({ initialData }) {
  const [d, setD] = useState(initialData || null);
  const [tab, setTab] = useState("overview");
  const [isPending, startTransition] = useTransition();

  // Optimistic tab switching
  const [optimisticTab, setOptimisticTab] = useOptimistic(tab, (current, nextTab) => nextTab);

  const handleTabChange = (nextTab) => {
    startTransition(async () => {
      setOptimisticTab(nextTab);
      setTab(nextTab);
    });
  };

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
    <div className="w-full min-w-0 max-w-full space-y-6 font-sans">
      <NotificationPermissionPrompt />
      {/* Welcome Banner */}
      <div className="w-full min-w-0 max-w-full overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 p-5 text-white shadow-xl sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-blue-100 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Maharashtra Exam Prep Portal
            </div>
            <h1 className="mt-3 break-words text-xl font-black sm:text-2xl md:text-3xl">
              Welcome, {d.user?.name || "Student"} 👋
            </h1>
            <p className="mt-1 text-xs text-blue-100 sm:text-sm">
              Prepare for Police Bharti, MPSC, Talathi, ZP & Saralseva exams with live mock tests.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              href="/student/profile"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white/15 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/25 sm:px-4 sm:py-2.5"
            >
              <User className="h-3.5 w-3.5" />
              Edit Profile
            </Link>
            <Link
              href="/student/exams"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white px-4 py-2 text-xs font-black text-blue-700 shadow-md transition hover:bg-blue-50 active:scale-95 sm:px-5 sm:py-2.5"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Browse All Exams
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full min-w-0 max-w-full overflow-hidden">
        <nav className="scrollbar-none flex w-full min-w-0 max-w-full items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {nav.map(([id, label]) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`shrink-0 whitespace-nowrap rounded-2xl px-3.5 py-2 text-xs font-bold transition active:scale-95 sm:px-4 sm:py-2.5 sm:text-sm ${
                optimisticTab === id
                  ? "bg-slate-900 text-white shadow-sm dark:bg-blue-600"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
          {isPending && (
            <span className="inline-flex shrink-0 animate-pulse items-center gap-1.5 px-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              Switching...
            </span>
          )}
        </nav>
      </div>

      {/* Tab Panels with transition */}
      <div
        className={`w-full min-w-0 max-w-full transition-opacity duration-150 ${isPending ? "opacity-75" : "opacity-100"}`}
      >
        {optimisticTab === "overview" && <Overview d={d} setTab={handleTabChange} />}
        {optimisticTab === "exams" && <Exams d={d} />}
        {optimisticTab === "results" && <Results d={d} />}
        {optimisticTab === "payments" && <Payments d={d} />}
        {optimisticTab === "notifications" && <Notifications d={d} />}
      </div>
    </div>
  );
}

function Overview({ d, setTab }) {
  return (
    <>
      {/* Metric Cards */}
      <div className="grid min-w-0 max-w-full grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
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
            className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5"
          >
            <div className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
              {label}
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-2">
              <div className="truncate text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
                {val}
              </div>
              <span className={`shrink-0 rounded-xl px-2.5 py-1 text-xs font-bold ${badgeStyle}`}>
                Active
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid min-w-0 max-w-full grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          title="Live Mock Tests (सध्या सुरू असलेल्या चाचण्या)"
          badge={
            d.live?.length > 0 ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-600 dark:bg-emerald-400" />
                {d.live.length} Live
              </span>
            ) : null
          }
        >
          <ExamList items={d.live || []} emptyText="No active live exams currently running." />
        </Card>
        <Card
          title="Upcoming Exams (आगामी नियोजित चाचण्या)"
          badge={
            d.upcoming?.length > 0 ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-extrabold text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
                {d.upcoming.length} Upcoming
              </span>
            ) : null
          }
        >
          <ExamList items={d.upcoming || []} emptyText="No upcoming exams scheduled right now." />
        </Card>
      </div>

      <div className="mt-6 min-w-0 max-w-full">
        <Card title="Recent Exam Performance (अलीकडील निकाल)">
          <ResultsList items={d.results || d.recentResults || []} />
        </Card>
      </div>
    </>
  );
}

function Exams({ d }) {
  return (
    <div className="min-w-0 max-w-full space-y-6">
      <Card title="All Available Mock Tests">
        <ExamList items={[...(d.live || []), ...(d.upcoming || [])]} emptyText="No exams found." />
      </Card>
    </div>
  );
}

function ExamList({ items, emptyText }) {
  return (
    <div className="w-full min-w-0 max-w-full divide-y divide-slate-100 dark:divide-slate-800">
      {items.map((e) => {
        const attemptUrl = `/exam/${e.slug || e.id}/attempt`;
        const isLive = e.status === "LIVE";
        return (
          <div key={e.id} className="w-full min-w-0 max-w-full py-4 first:pt-0 last:pb-0">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                  isLive
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300"
                }`}
              >
                {isLive && (
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                )}
                {e.status || (isLive ? "LIVE" : "SCHEDULED")}
              </span>
              <h3
                className="min-w-0 flex-1 truncate text-xs font-bold text-slate-900 dark:text-white sm:text-sm"
                title={e.title}
              >
                {e.title}
              </h3>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:text-xs">
              <span className="inline-flex items-center gap-1">
                <span>⏱</span>
                <span>{e.durationMinutes} मि.</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="inline-flex items-center gap-1">
                <span>📝</span>
                <span>{e.totalQuestions || e._count?.questions || 100} प्रश्न</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="inline-flex items-center gap-1">
                <span>🎯</span>
                <span>{e.totalMarks || 100} गुण</span>
              </span>
            </div>

            <div className="mt-3.5 w-full sm:flex sm:justify-end">
              <Link
                href={attemptUrl}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/15 transition hover:bg-blue-500 active:scale-95 sm:w-auto"
              >
                <span>परीक्षा द्या</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        );
      })}
      {!items.length && <Empty text={emptyText} />}
    </div>
  );
}

function Results({ d }) {
  return (
    <Card title="Your Exam Results & Analytics">
      <ResultsList items={d.results || d.recentResults || []} />
    </Card>
  );
}

function ResultsList({ items }) {
  return (
    <div className="min-w-0 divide-y divide-slate-100 dark:divide-slate-800">
      {items.map((r) => (
        <div
          key={r.id}
          className="flex flex-col justify-between gap-3 py-3.5 sm:flex-row sm:items-center sm:gap-4"
        >
          <div className="min-w-0 flex-1">
            <h3
              className="min-w-0 truncate text-xs font-bold text-slate-900 dark:text-white sm:text-sm"
              title={r.exam?.title || "Exam"}
            >
              {r.exam?.title || "Exam"}
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:text-xs">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                गुण: {r.score}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>टक्केवारी: {r.percentage}%</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>
                {new Date(r.evaluatedAt || r.createdAt || Date.now()).toLocaleDateString("mr-IN")}
              </span>
            </div>
          </div>
          <div className="w-full shrink-0 sm:w-auto">
            <Link
              href={`/student/results`}
              className="flex w-full items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:w-auto"
            >
              गुणपत्रिका पहा
            </Link>
          </div>
        </div>
      ))}
      {!items.length && <Empty text="No exam results available yet. Start practicing today!" />}
    </div>
  );
}

function Payments({ d }) {
  return (
    <Card title="Payment & Subscription History">
      <div className="min-w-0 divide-y divide-slate-100 dark:divide-slate-800">
        {(d.purchases || []).map((p) => {
          const isUnavailable = !p.exam || p.exam.status === "ARCHIVED";
          return (
            <div
              key={p.id}
              className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="min-w-0 truncate text-xs font-bold text-slate-900 dark:text-white sm:text-sm">
                    {p.exam?.title || "Exam Package"}
                  </span>
                  {isUnavailable ? (
                    <span className="shrink-0 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                      परीक्षा किंवा प्रिव्ह्यू उपलब्ध नाही
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                      नेहमी सुरू / अमर्याद प्रयत्न
                    </span>
                  )}
                </div>
                <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 sm:text-xs">
                  खरेदी तारीख: {new Date(p.purchasedAt).toLocaleString("mr-IN")}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <div className="font-mono text-xs font-bold text-slate-900 dark:text-white sm:text-sm">
                  ₹{(p.amount / 100).toLocaleString("en-IN")}
                </div>
                {!isUnavailable && (
                  <Link
                    href={`/exam/${p.exam?.slug || p.exam?.id || p.examId}/attempt`}
                    className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-500 active:scale-95"
                  >
                    परीक्षा द्या
                  </Link>
                )}
              </div>
            </div>
          );
        })}
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
    <div className="min-w-0 divide-y divide-slate-100 dark:divide-slate-800">
      {items.map((n) => (
        <div key={n.id} className={`py-3.5 ${n.readAt ? "opacity-60" : ""}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <b className="min-w-0 flex-1 break-words text-xs font-bold text-slate-900 dark:text-white sm:text-sm">
              {n.title}
            </b>
            <span className="shrink-0 text-[10px] text-slate-400 dark:text-slate-500 sm:text-[11px]">
              {new Date(n.createdAt).toLocaleDateString("mr-IN")}
            </span>
          </div>
          <p className="mt-1 break-words text-xs text-slate-600 dark:text-slate-300">{n.message}</p>
        </div>
      ))}
      {!items.length && <Empty text="No new notifications. You're all caught up." />}
    </div>
  );
}

function Card({ title, children, badge, action }) {
  return (
    <section className="w-full min-w-0 max-w-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="min-w-0 flex-1 break-words text-sm font-black leading-snug text-slate-900 dark:text-white sm:text-base md:text-lg">
          {title}
        </h2>
        {badge}
        {action}
      </div>
      <div className="mt-3.5 min-w-0 sm:mt-4">{children}</div>
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
