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
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-black">Coaching Analytics</h1>
        <p className="mt-1 text-slate-500">Performance across your examinations.</p>
        <div className="mt-6 grid gap-4">
          {rows.map((x) => (
            <div key={x.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex justify-between">
                <b>{x.exam?.title}</b>
                <span>{(x.passPercentage || 0).toFixed(1)}% pass</span>
              </div>
              <div className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
                <div>
                  Attempts <b>{x.attempts}</b>
                </div>
                <div>
                  Completed <b>{x.completed}</b>
                </div>
                <div>
                  Avg Score <b>{(x.averageScore || 0).toFixed(2)}</b>
                </div>
                <div>
                  Avg % <b>{(x.averagePercent || 0).toFixed(1)}%</b>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
