"use client";

import { useEffect, useState } from "react";

export default function ExamResults({ params }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.resolve(params)
      .then((p) => fetch(`/api/coaching/results/exam/${p.id}`))
      .then((r) => r.json())
      .then(setData);
  }, [params]);

  if (!data) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          {data.exam?.title || "Exam"} — Results
        </h1>
        <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
              <tr>
                <th className="p-4 font-semibold">Rank</th>
                <th className="font-semibold">Student</th>
                <th className="font-semibold">Score</th>
                <th className="font-semibold">%</th>
                <th className="font-semibold">Correct</th>
                <th className="font-semibold">Wrong</th>
                <th className="font-semibold">Unanswered</th>
                <th className="font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 dark:divide-slate-800 dark:text-slate-200">
              {data.results?.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-slate-100 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <td className="p-4 font-black text-slate-900 dark:text-white">{r.rank}</td>
                  <td>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {r.student?.name || "Student"}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {r.student?.email}
                    </div>
                  </td>
                  <td className="font-medium">
                    {r.obtainedMarks}/{r.totalMarks}
                  </td>
                  <td className="font-bold text-slate-900 dark:text-white">{r.percentage}%</td>
                  <td className="font-medium text-emerald-600 dark:text-emerald-400">
                    {r.correct}
                  </td>
                  <td className="font-medium text-rose-600 dark:text-rose-400">{r.wrong}</td>
                  <td className="text-slate-500 dark:text-slate-400">{r.unanswered}</td>
                  <td
                    className={
                      r.passed
                        ? "font-bold text-emerald-600 dark:text-emerald-400"
                        : "font-bold text-rose-600 dark:text-rose-400"
                    }
                  >
                    {r.passed ? "PASS" : "FAIL"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
