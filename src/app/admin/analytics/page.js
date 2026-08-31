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
    return <main className="grid min-h-screen place-items-center bg-slate-50">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-black">Platform Analytics</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Students", d.students],
            ["Coaching", d.coaching],
            ["Exams", d.exams],
            ["Results", d.completedResults],
            ["Avg %", `${(d.averagePercent || 0).toFixed(1)}%`],
          ].map(([label, val]) => (
            <div key={label} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">{label}</div>
              <div className="mt-2 text-3xl font-black">{val}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-black">Platform Pass Rate</h2>
          <div className="mt-3 text-4xl font-black">{(d.passPercentage || 0).toFixed(1)}%</div>
        </div>
      </div>
    </main>
  );
}
