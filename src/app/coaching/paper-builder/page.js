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
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-black">Paper Builder</h1>
        <p className="mt-2 text-slate-500">Build an exam paper from your question bank.</p>
        <div className="mt-8 space-y-4">
          {rules.map((r, i) => (
            <div key={i} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="grid gap-3 md:grid-cols-4">
                <input
                  value={r.subjectId}
                  onChange={(e) => {
                    const x = [...rules];
                    x[i].subjectId = e.target.value;
                    setRules(x);
                  }}
                  placeholder="Subject ID"
                  className="rounded-xl border p-3"
                />
                <input
                  value={r.chapterId}
                  onChange={(e) => {
                    const x = [...rules];
                    x[i].chapterId = e.target.value;
                    setRules(x);
                  }}
                  placeholder="Chapter ID (optional)"
                  className="rounded-xl border p-3"
                />
                <select
                  value={r.difficulty}
                  onChange={(e) => {
                    const x = [...rules];
                    x[i].difficulty = e.target.value;
                    setRules(x);
                  }}
                  className="rounded-xl border p-3"
                >
                  <option>EASY</option>
                  <option>MEDIUM</option>
                  <option>HARD</option>
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
                  className="rounded-xl border p-3"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            setRules([...rules, { subjectId: "", chapterId: "", difficulty: "MEDIUM", count: 10 }])
          }
          className="mt-4 font-semibold text-blue-600"
        >
          + Add Rule
        </button>
        <button
          onClick={generate}
          className="mt-6 block rounded-xl bg-blue-600 px-6 py-3 font-bold text-white"
        >
          Generate Paper
        </button>
        {result && (
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">
              Generated Paper · {result.totalQuestions} Questions
            </h2>
            <ol className="mt-4 list-decimal space-y-3 pl-6">
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
