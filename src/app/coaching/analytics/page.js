"use client";

import { useEffect, useState } from "react";

export default function CoachingAnalytics() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetch("/api/coaching/analytics")
      .then((r) => r.json())
      .then((d) => setRows(d.rows || []));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Coaching Analytics</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Performance across your examinations.</p>
        <div className="mt-6 grid gap-4">
          {rows.map((x) => (
            <div key={x.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex justify-between items-center">
                <b className="text-lg font-bold text-slate-900 dark:text-white">{x.exam?.title}</b>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{(x.passPercentage || 0).toFixed(1)}% pass</span>
              </div>
              <div className="mt-3 grid gap-3 text-sm text-slate-600 dark:text-slate-400 sm:grid-cols-4">
                <div>
                  Attempts <b className="text-slate-900 dark:text-white">{x.attempts}</b>
                </div>
                <div>
                  Completed <b className="text-slate-900 dark:text-white">{x.completed}</b>
                </div>
                <div>
                  Avg Score <b className="text-slate-900 dark:text-white">{(x.averageScore || 0).toFixed(2)}</b>
                </div>
                <div>
                  Avg % <b className="text-slate-900 dark:text-white">{(x.averagePercent || 0).toFixed(1)}%</b>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
