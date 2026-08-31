"use client";

import { useEffect, useState, useCallback } from "react";
import { MAHARASHTRA_EXAM_TYPES } from "@/lib/exam-types";

export default function ExamBuilder() {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    examType: "Police Bharti",
    language: "mr",
    durationMinutes: 60,
    negativeMarks: 0.25,
    passingScore: 40,
    isFree: false,
    price: 0,
    startAt: "",
    endAt: "",
    fullscreenRequired: true,
    publishImmediately: false,
  });

  const load = useCallback(async () => {
    const p = new URLSearchParams({ search, difficulty });
    const r = await fetch(`/api/exam-builder?${p}`);
    const d = await r.json();
    setQuestions(d.questions || []);
  }, [search, difficulty]);

  useEffect(() => {
    load();
  }, [difficulty, load]);

  function toggle(id) {
    setSelected((x) => (x.includes(id) ? x.filter((y) => y !== id) : [...x, id]));
  }

  async function create(e) {
    e.preventDefault();
    setMsg("");
    const r = await fetch("/api/exam-builder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, questionIds: selected }),
    });
    const d = await r.json();
    if (!r.ok) {
      setMsg(d.error || "Unable to create exam");
      return;
    }
    setMsg(`Exam created: ${d.exam.title || d.exam.id}`);
    setSelected([]);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-black">Exam Builder 2.0</h1>
        <p className="mt-1 text-slate-500">
          Build coaching or global papers using every question you are authorized to use.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
          <form
            onSubmit={create}
            className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-black">Exam Settings</h2>
            <div>
              <label className="block text-xs font-bold text-slate-700">Exam Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Unique Slug *</label>
              <input
                value={form.slug}
                onChange={(e) =>
                  setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })
                }
                className="mt-1 w-full rounded-2xl border border-slate-200 p-2.5 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">
                Exam Category (परीक्षेचा प्रकार) *
              </label>
              <select
                value={form.examType}
                onChange={(e) => setForm({ ...form, examType: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {MAHARASHTRA_EXAM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700">Duration (Mins)</label>
                <input
                  type="number"
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700">Negative Marks</label>
                <input
                  type="number"
                  step="0.25"
                  value={form.negativeMarks}
                  onChange={(e) => setForm({ ...form, negativeMarks: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700">Passing Score (%)</label>
                <input
                  type="number"
                  value={form.passingScore}
                  onChange={(e) => setForm({ ...form, passingScore: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700">Price (INR)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <label className="mt-2 flex gap-2 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.isFree}
                onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
              />{" "}
              Global free paper
            </label>

            <label className="flex gap-2 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.fullscreenRequired}
                onChange={(e) => setForm({ ...form, fullscreenRequired: e.target.checked })}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
              />{" "}
              Require fullscreen anti-cheat
            </label>

            <label className="flex gap-2 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.publishImmediately}
                onChange={(e) => setForm({ ...form, publishImmediately: e.target.checked })}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
              />{" "}
              Publish immediately (LIVE)
            </label>

            <button
              type="submit"
              className="mt-4 w-full rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white shadow-glow transition hover:bg-blue-500 active:scale-95"
            >
              Build &amp; Save Exam
            </button>
            {msg && <div className="mt-2 text-center text-xs font-bold text-blue-600">{msg}</div>}
          </form>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">Question Bank Selector</h2>
                <p className="text-xs text-slate-500">{selected.length} questions selected</p>
              </div>
              <div className="flex gap-2">
                <input
                  placeholder="Search questions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-2xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900"
                />
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="rounded-2xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900"
                >
                  <option value="">All Difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
                <button
                  type="button"
                  onClick={load}
                  className="rounded-2xl bg-slate-900 px-4 py-1.5 text-xs font-bold text-white"
                >
                  Filter
                </button>
              </div>
            </div>

            <div className="mt-6 max-h-[600px] divide-y divide-slate-100 overflow-auto pr-1">
              {questions.map((q) => (
                <div
                  key={q.id}
                  onClick={() => toggle(q.id)}
                  className={`flex cursor-pointer items-start justify-between gap-4 rounded-2xl px-3 py-4 transition ${
                    selected.includes(q.id)
                      ? "border border-blue-200 bg-blue-50/70"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-blue-600">
                      {q.subject?.name || "General"} · {q.difficulty}
                    </span>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {q.questionTextMr || q.questionText}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                      {q.options?.map((o) => (
                        <span
                          key={o.id}
                          className={`rounded-xl px-2 py-0.5 text-[11px] ${
                            o.isCorrect
                              ? "bg-emerald-100 font-bold text-emerald-800"
                              : "bg-slate-100"
                          }`}
                        >
                          {o.textMr || o.text}
                        </span>
                      ))}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selected.includes(q.id)}
                    onChange={() => {}}
                    className="mt-1 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </div>
              ))}
              {!questions.length && (
                <div className="py-12 text-center text-xs text-slate-400">
                  No questions matched your search query.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
