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
    return <main className="grid min-h-screen place-items-center">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-black">{data.exam?.title || "Exam"} — Results</h1>
        <div className="mt-8 overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4">Rank</th>
                <th>Student</th>
                <th>Score</th>
                <th>%</th>
                <th>Correct</th>
                <th>Wrong</th>
                <th>Unanswered</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.results?.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-4 font-black">{r.rank}</td>
                  <td>
                    {r.student?.name || "Student"}
                    <div className="text-xs text-slate-500">{r.student?.email}</div>
                  </td>
                  <td>
                    {r.obtainedMarks}/{r.totalMarks}
                  </td>
                  <td className="font-bold">{r.percentage}%</td>
                  <td>{r.correct}</td>
                  <td>{r.wrong}</td>
                  <td>{r.unanswered}</td>
                  <td className={r.passed ? "font-bold text-green-600" : "font-bold text-red-600"}>
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
