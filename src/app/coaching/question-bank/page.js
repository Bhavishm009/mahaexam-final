"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { HelpCircle, Search, Plus, X, CheckCircle2 } from "lucide-react";

export default function CoachingQuestionBankPage() {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    questionText: "",
    questionTextMr: "",
    subjectId: "",
    difficulty: "MEDIUM",
    explanation: "",
    options: [
      { optionText: "", isCorrect: true },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
    ],
  });

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const d = await fetch(`/api/question-bank?search=${encodeURIComponent(search)}`).then((r) =>
        r.json(),
      );
      setQuestions(d.questions || []);
    } catch (e) {
      console.error("Failed to load questions:", e);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  async function createQuestion(e) {
    e.preventDefault();
    try {
      const r = await fetch("/api/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (r.ok) {
        setShow(false);
        setForm({
          questionText: "",
          questionTextMr: "",
          subjectId: "",
          difficulty: "MEDIUM",
          explanation: "",
          options: [
            { optionText: "", isCorrect: true },
            { optionText: "", isCorrect: false },
            { optionText: "", isCorrect: false },
            { optionText: "", isCorrect: false },
          ],
        });
        toast.success("Question saved successfully!");
        loadQuestions();
      } else {
        toast.error(d.error || "Failed to save question");
      }
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <HelpCircle className="h-3.5 w-3.5" />
              Faculty Question Bank
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Academy Question Bank
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Create, search, and reuse MCQ questions for your mock tests and test series.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShow(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow transition hover:bg-blue-500 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Add New MCQ</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadQuestions()}
            placeholder="Search questions by keyword or topic..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>

        <div className="space-y-3 pt-2">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="mt-2 text-xs font-bold">Loading questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-12 text-center text-slate-400 dark:border-slate-800 dark:bg-slate-950">
              No questions found. Click &quot;Add New MCQ&quot; to build your question bank.
            </div>
          ) : (
            questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4 transition hover:border-blue-200 hover:bg-white dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-700 dark:hover:bg-slate-900"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-blue-600 text-[10px] font-black text-white">
                      {idx + 1}
                    </span>
                    <span
                      className={`rounded-lg px-2 py-0.5 text-[10px] font-black ${
                        q.difficulty === "EASY"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : q.difficulty === "HARD"
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {q.question?.subject?.name || "General"}
                    </span>
                  </div>

                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {q.source || "MANUAL"}
                  </span>
                </div>

                <div className="mt-3">
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white sm:text-sm">
                    {q.question?.questionTextMr || q.question?.questionText}
                  </h2>
                  {q.question?.questionTextMr && q.question?.questionText && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {q.question.questionText}
                    </p>
                  )}
                </div>

                {q.question?.options && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {q.question.options.map((o, oIdx) => (
                      <div
                        key={o.id || oIdx}
                        className={`flex items-center justify-between rounded-xl border p-2.5 text-xs ${
                          o.isCorrect
                            ? "border-emerald-500 bg-emerald-50/70 font-bold text-emerald-900 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-200"
                            : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                        }`}
                      >
                        <span>{o.optionTextMr || o.optionText}</span>
                        {o.isCorrect && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            <span>Correct</span>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add MCQ Modal */}
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={createQuestion}
            className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-black text-slate-900 dark:text-white">Add New MCQ</h2>
              <button
                type="button"
                onClick={() => setShow(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Question Text (English / Main) *
                </label>
                <textarea
                  required
                  value={form.questionText}
                  onChange={(e) => setForm({ ...form, questionText: e.target.value })}
                  placeholder="Enter the question text..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Question Text (Marathi / मराठी भाषांतर - Optional)
                </label>
                <input
                  value={form.questionTextMr}
                  onChange={(e) => setForm({ ...form, questionTextMr: e.target.value })}
                  placeholder="मराठीत प्रश्न प्रविष्ट करा..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Difficulty Level
                </label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="EASY">EASY (सोपे)</option>
                  <option value="MEDIUM">MEDIUM (मध्यम)</option>
                  <option value="HARD">HARD (कठीण)</option>
                </select>
              </div>

              {/* Options */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Options &amp; Correct Answer *
                </label>
                <div className="space-y-2">
                  {form.options.map((o, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        required
                        value={o.optionText}
                        onChange={(e) => {
                          const a = [...form.options];
                          a[i] = { ...a[i], optionText: e.target.value };
                          setForm({ ...form, options: a });
                        }}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                      <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        <input
                          type="radio"
                          name="correctOption"
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
                          className="h-3.5 w-3.5 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Correct</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Explanation / Rationale (Optional)
                </label>
                <textarea
                  value={form.explanation}
                  onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                  placeholder="Explain why this answer is correct..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShow(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-blue-500 active:scale-95"
              >
                Save MCQ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
