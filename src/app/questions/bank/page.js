"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

export default function QuestionBank() {
  const [q, setQ] = useState([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const load = useCallback(async () => {
    const p = new URLSearchParams({ search, difficulty });
    const r = await fetch(`/api/questions/bank?${p}`);
    const d = await r.json();
    setQ(d.questions || []);
  }, [search, difficulty]);

  useEffect(() => {
    load();
  }, [difficulty, load]);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">Question Bank</h1>
            <p className="mt-1 text-slate-500">
              Super Admin can use every coaching question bank. Coaching users see their permitted
              questions.
            </p>
          </div>
          <Link
            href="/questions/import"
            className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
          >
            Import Questions
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search questions..."
            className="min-w-[280px] flex-1 rounded-xl border p-3"
          />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="rounded-xl border p-3"
          >
            <option value="">All difficulty</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
          <button
            type="button"
            onClick={load}
            className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"
          >
            Search
          </button>
        </div>
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4">Question</th>
                <th>Source</th>
                <th>Difficulty</th>
                <th>Marks</th>
              </tr>
            </thead>
            <tbody>
              {q.map((x) => (
                <tr key={x.id} className="border-t">
                  <td className="max-w-xl p-4 font-semibold">{x.questionText}</td>
                  <td>{x.organizationId ? "Coaching" : "Global"}</td>
                  <td>{x.difficulty}</td>
                  <td>{x.marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!q.length && <div className="p-8 text-center text-slate-500">No questions found.</div>}
        </div>
      </div>
    </main>
  );
}
