"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Medal } from "lucide-react";

export default function Leaderboard({ searchParams }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.resolve(searchParams).then((sp) => {
      const examId = sp?.examId || "police-01";
      fetch(`/api/exams/${examId}/leaderboard`)
        .then((r) => r.json())
        .then((d) => {
          setRows(d.leaderboard || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, [searchParams]);

  return (
    <main className="min-h-screen space-y-6 font-sans text-slate-900 transition-colors dark:text-slate-100">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-r from-amber-600 via-amber-500 to-indigo-700 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-amber-100 backdrop-blur-md">
                <Trophy className="h-3.5 w-3.5 text-amber-200" />
                State-Level Hall of Fame
              </span>
              <h1 className="mt-3 text-2xl font-black sm:text-3xl">Maharashtra Exam Leaderboard</h1>
              <p className="mt-1 text-xs text-amber-100 sm:text-sm">
                Top rankers across Maharashtra state mock exams and coaching tests.
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

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <h2 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white sm:text-lg">
            <Medal className="h-5 w-5 text-amber-500" />
            <span>Top Performers (सर्वोत्कृष्ट विद्यार्थी)</span>
          </h2>

          {loading ? (
            <div className="grid min-h-[30vh] place-items-center">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <span>Loading leaderboard...</span>
              </div>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="rounded-l-xl p-3.5 font-bold">Rank</th>
                    <th className="p-3.5 font-bold">Student Name</th>
                    <th className="p-3.5 font-bold">Score</th>
                    <th className="rounded-r-xl p-3.5 font-bold">Percentile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rows.map((x) => (
                    <tr
                      key={x.id}
                      className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      <td className="p-3.5 font-black text-slate-900 dark:text-white">
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-xl font-bold ${
                            x.rank === 1
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : x.rank === 2
                                ? "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                                : x.rank === 3
                                  ? "bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-400"
                                  : "text-slate-500"
                          }`}
                        >
                          #{x.rank}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {x.student?.name || "Student"}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {x.score}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">
                        {x.percentile ?? "—"}%
                      </td>
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-xs text-slate-400">
                        Leaderboard data will be published as soon as students complete attempts.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
