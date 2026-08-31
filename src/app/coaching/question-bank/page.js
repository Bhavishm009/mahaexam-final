"use client";

import { useEffect, useState, useCallback } from "react";

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    questionText: "",
    questionTextMr: "",
    subjectId: "",
    difficulty: "MEDIUM",
    explanation: "",
    options: [
      { optionText: "", isCorrect: true },
      { optionText: "", isCorrect: false },
    ],
  });

  const load = useCallback(async () => {
    const d = await fetch(`/api/question-bank?search=${encodeURIComponent(search)}`).then((r) =>
      r.json(),
    );
    setQuestions(d.questions || []);
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  async function create(e) {
    e.preventDefault();
    const r = await fetch("/api/question-bank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    if (r.ok) {
      setShow(false);
      setForm({
        ...form,
        questionText: "",
        questionTextMr: "",
        explanation: "",
      });
      load();
    } else {
      alert(d.error);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black">Question Bank</h1>
            <p className="mt-2 text-slate-500">Create, search and reuse MCQ questions.</p>
          </div>
          <button
            onClick={() => setShow(true)}
            className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
          >
            + Add Question
          </button>
        </div>
        <div className="mt-6 flex gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search questions..."
            className="w-full max-w-xl rounded-xl border bg-white px-4 py-3"
          />
        </div>
        <div className="mt-6 space-y-3">
          {questions.map((q) => (
            <div key={q.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-blue-600">{q.difficulty}</span>
                  <h2 className="mt-2 font-semibold">{q.question?.questionText}</h2>
                  <div className="mt-2 text-xs text-slate-500">
                    {q.question?.subject?.name || "No subject"} ·{" "}
                    {q.question?.chapter?.name || "No chapter"} ·{" "}
                    {q.question?.topic?.name || "No topic"}
                  </div>
                </div>
                <span className="text-xs text-slate-400">{q.source}</span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {q.question?.options?.map((o) => (
                  <div
                    key={o.id}
                    className={`rounded-lg border p-2 text-sm ${
                      o.isCorrect ? "border-green-500 bg-green-50" : ""
                    }`}
                  >
                    {o.optionText}
                    {o.isCorrect && " ✓"}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {show && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
            <form onSubmit={create} className="w-full max-w-2xl rounded-3xl bg-white p-6">
              <div className="flex justify-between">
                <h2 className="text-xl font-black">Add MCQ</h2>
                <button type="button" onClick={() => setShow(false)}>
                  ✕
                </button>
              </div>
              <textarea
                required
                value={form.questionText}
                onChange={(e) => setForm({ ...form, questionText: e.target.value })}
                placeholder="Question text"
                className="mt-5 min-h-28 w-full rounded-xl border p-3"
              />
              <input
                value={form.questionTextMr}
                onChange={(e) => setForm({ ...form, questionTextMr: e.target.value })}
                placeholder="Marathi question (optional)"
                className="mt-3 w-full rounded-xl border p-3"
              />
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="mt-3 rounded-xl border p-3"
              >
                <option>EASY</option>
                <option>MEDIUM</option>
                <option>HARD</option>
              </select>
              <div className="mt-4 space-y-2">
                {form.options.map((o, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={o.optionText}
                      onChange={(e) => {
                        const a = [...form.options];
                        a[i] = { ...a[i], optionText: e.target.value };
                        setForm({ ...form, options: a });
                      }}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 rounded-xl border p-3"
                    />
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="radio"
                        checked={o.isCorrect}
                        onChange={() =>
                          setForm({
                            ...form,
                            options: form.options.map((x, j) => ({
                              ...x,
                              isCorrect: i === j,
                            })),
                          })
                        }
                      />
                      Correct
                    </label>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    options: [...form.options, { optionText: "", isCorrect: false }],
                  })
                }
                className="mt-3 text-sm font-semibold text-blue-600"
              >
                + Option
              </button>
              <textarea
                value={form.explanation}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                placeholder="Explanation (optional)"
                className="mt-4 min-h-20 w-full rounded-xl border p-3"
              />
              <button className="mt-5 w-full rounded-xl bg-blue-600 py-3 font-bold text-white">
                Save Question
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
