"use client";
import { useState } from "react";
export default function PaperBuilder() {
  const [rules, setRules] = useState([
    { subjectId: "", chapterId: "", difficulty: "MEDIUM", count: 10 },
  ]);
  const [result, setResult] = useState(null);
  async function generate() {
    const r = await fetch("/api/coaching/paper-builder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rules }),
    });
    const d = await r.json();
    if (r.ok) {
      setResult(d);
    } else {
      alert(d.error);
    }
  }
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Paper Builder</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Build an exam paper from your question bank.</p>
        <div className="mt-8 space-y-4">
          {rules.map((r, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="grid gap-3 md:grid-cols-4">
                <input
                  value={r.subjectId}
                  onChange={(e) => {
                    const x = [...rules];
                    x[i].subjectId = e.target.value;
                    setRules(x);
                  }}
                  placeholder="Subject ID"
                  className="rounded-xl border border-slate-300 bg-white p-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white placeholder:text-slate-400"
                />
                <input
                  value={r.chapterId}
                  onChange={(e) => {
                    const x = [...rules];
                    x[i].chapterId = e.target.value;
                    setRules(x);
                  }}
                  placeholder="Chapter ID (optional)"
                  className="rounded-xl border border-slate-300 bg-white p-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white placeholder:text-slate-400"
                />
                <select
                  value={r.difficulty}
                  onChange={(e) => {
                    const x = [...rules];
                    x[i].difficulty = e.target.value;
                    setRules(x);
                  }}
                  className="rounded-xl border border-slate-300 bg-white p-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="EASY">EASY</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HARD">HARD</option>
                </select>
                <input
                  type="number"
                  min="1"
                  value={r.count}
                  onChange={(e) => {
                    const x = [...rules];
                    x[i].count = Number(e.target.value);
                    setRules(x);
                  }}
                  className="rounded-xl border border-slate-300 bg-white p-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            setRules([...rules, { subjectId: "", chapterId: "", difficulty: "MEDIUM", count: 10 }])
          }
          className="mt-4 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          + Add Rule
        </button>
        <button
          onClick={generate}
          className="mt-6 block rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-500 transition-colors shadow-sm"
        >
          Generate Paper
        </button>
        {result && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Generated Paper · {result.totalQuestions} Questions
            </h2>
            <ol className="mt-4 list-decimal space-y-3 pl-6 text-slate-800 dark:text-slate-200">
              {result.questions.map((q) => (
                <li key={q.id}>{q.questionText}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </main>
  );
}
