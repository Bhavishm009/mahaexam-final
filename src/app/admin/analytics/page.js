"use client";

import { useEffect, useState } from "react";

export default function AdminAnalytics() {
  const [d, setD] = useState(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setD);
  }, []);

  if (!d) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Platform Analytics</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Students", d.students],
            ["Coaching", d.coaching],
            ["Exams", d.exams],
            ["Results", d.completedResults],
            ["Avg %", `${(d.averagePercent || 0).toFixed(1)}%`],
          ].map(([label, val]) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
              <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{val}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-black text-slate-900 dark:text-white">Platform Pass Rate</h2>
          <div className="mt-3 text-4xl font-black text-emerald-600 dark:text-emerald-400">
            {(d.passPercentage || 0).toFixed(1)}%
          </div>
        </div>
      </div>
    </main>
  );
}
