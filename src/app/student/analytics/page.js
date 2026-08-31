"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Trophy, BookOpen } from "lucide-react";

export default function Analytics() {
  const [d, setD] = useState(null);

  useEffect(() => {
    fetch("/api/student/analytics")
      .then((r) => r.json())
      .then(setD)
      .catch(() => {});
  }, []);

  if (!d) {
    return (
      <main className="grid min-h-[50vh] place-items-center font-sans text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span>Loading performance analytics...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen space-y-6 font-sans text-slate-900 transition-colors dark:text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-blue-100 backdrop-blur-md">
                <BarChart3 className="h-3.5 w-3.5 text-amber-300" />
                Performance & Accuracy Report
              </span>
              <h1 className="mt-3 text-2xl font-black sm:text-3xl">My Performance Analytics</h1>
              <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                Comprehensive subject breakdown, speed, percentile, and rank metrics.
              </p>
            </div>
            <Link
              href="/student/dashboard"
              className="inline-flex items-center gap-1.5 self-start rounded-2xl bg-white/20 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/30 sm:self-auto"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Subject Performance */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <h2 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white sm:text-lg">
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Subject-wise Mastery (विषयनिहाय प्रभुत्व)</span>
          </h2>
          <div className="mt-6 space-y-5">
            {d.subjects?.map((x) => (
              <div key={x.name}>
                <div className="flex items-center justify-between text-xs font-bold sm:text-sm">
                  <span className="text-slate-900 dark:text-white">{x.name}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {x.percentage}% Score · {x.accuracy}% Accuracy
                  </span>
                </div>
                <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500 dark:bg-blue-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, x.percentage))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {!d.subjects?.length && (
              <p className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                Complete your first exam attempt to generate subject mastery analytics.
              </p>
            )}
          </div>
        </section>

        {/* Exam History Progress Table */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <h2 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white sm:text-lg">
            <Trophy className="h-5 w-5 text-amber-500" />
            <span>Recent Examinations & Percentile</span>
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="rounded-l-xl p-3 font-bold">Exam Title</th>
                  <th className="p-3 font-bold">Type</th>
                  <th className="p-3 font-bold">Score</th>
                  <th className="p-3 font-bold">Rank</th>
                  <th className="p-3 font-bold">Percentile</th>
                  <th className="rounded-r-xl p-3 font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {d.results?.map((r) => (
                  <tr
                    key={r.id}
                    className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                  >
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      <Link
                        href={`/student/results/${r.id}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {r.title}
                      </Link>
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          r.free
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300"
                        }`}
                      >
                        {r.free ? "FREE" : "COACHING"}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {r.percentage}%
                    </td>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                      #{r.rank || "—"}
                    </td>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                      {r.percentile === null || r.percentile === undefined
                        ? "—"
                        : `${r.percentile}%`}
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400">
                      {new Date(r.evaluatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {!d.results?.length && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                      No examination results available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
