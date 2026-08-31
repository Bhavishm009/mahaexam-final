"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileCheck2,
} from "lucide-react";
import { MAHARASHTRA_EXAM_TYPES, EXAM_STATUSES } from "@/lib/exam-types";

export default function ExamBuilder() {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasNegativeMarking, setHasNegativeMarking] = useState(true);
  const [createdExam, setCreatedExam] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    examType: "Police Bharti",
    language: "mr",
    durationMinutes: 90,
    negativeMarks: 0.25,
    passingScore: 40,
    isFree: true,
    price: 0,
    status: "SCHEDULED",
    startAt: "",
    endAt: "",
    fullscreenRequired: true,
    sendNotification: true,
  });

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const p = new URLSearchParams();
      if (search) {
        p.set("search", search);
      }
      if (difficulty) {
        p.set("difficulty", difficulty);
      }

      const r = await fetch(`/api/exam-builder?${p}`);
      const d = await r.json();
      setQuestions(d.questions || []);
    } catch (e) {
      console.error("Failed to load questions:", e);
    } finally {
      setLoading(false);
    }
  }, [search, difficulty]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  function toggleQuestion(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((y) => y !== id) : [...prev, id],
    );
  }

  function selectAll() {
    if (selected.length === questions.length) {
      setSelected([]);
    } else {
      setSelected(questions.map((q) => q.id));
    }
  }

  async function createExam(e) {
    e.preventDefault();
    if (selected.length === 0) {
      setMsg({ type: "error", text: "Please select at least 1 question for the examination." });
      return;
    }
    setSaving(true);
    setMsg({ type: "", text: "" });

    try {
      const payload = {
        ...form,
        negativeMarks: hasNegativeMarking ? Number(form.negativeMarks || 0.25) : 0,
        questionIds: selected,
        publishImmediately: form.status === "LIVE",
      };

      const r = await fetch("/api/exam-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (!r.ok) {
        setMsg({ type: "error", text: d.error || "Unable to create exam" });
        return;
      }
      setCreatedExam(d.exam);
      setMsg({
        type: "success",
        text: `Exam "${d.exam.title}" created successfully! Click below to review all questions and answers.`,
      });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <FileCheck2 className="h-3.5 w-3.5" />
              Advanced Question Composer
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Exam Builder 2.0
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Assemble exams, set dates/schedules, configure negative marking, and review before student launch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/global-exams"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Manage Existing Exams
          </Link>
        </div>
      </div>

      {/* Success Alert with Review Link */}
      {msg.text && (
        <div
          className={`flex items-start gap-3 rounded-2xl p-4 text-xs font-bold sm:text-sm ${
            msg.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200"
              : "border border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/80 dark:text-rose-200"
          }`}
        >
          {msg.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <div className="flex-1">
            <div>{msg.text}</div>
            {createdExam && (
              <div className="mt-3">
                <Link
                  href={`/exam/${createdExam.slug || createdExam.id}/review`}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-blue-500 active:scale-95"
                >
                  <Eye className="h-4 w-4" />
                  <span>🔍 Review Exam Paper &amp; Answer Keys (परीक्षेचे पुनरावलोकन करा)</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Grid: Exam Settings + Question Bank */}
      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        {/* Left Form: Exam Configuration */}
        <form
          onSubmit={createExam}
          className="h-fit space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-black text-slate-900 dark:text-white">Exam Parameters</h2>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
              Exam Title *
            </label>
            <input
              required
              value={form.title}
              placeholder="उदा. महाराष्ट्र पोलीस भरती सराव पेपर"
              onChange={(e) => {
                const title = e.target.value;
                const slug = title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)+/g, "");
                setForm({ ...form, title, slug: form.slug ? form.slug : slug });
              }}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
              Exam Category (परीक्षेचा प्रकार) *
            </label>
            <select
              value={form.examType}
              onChange={(e) => setForm({ ...form, examType: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {MAHARASHTRA_EXAM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Schedule Start & End Time */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900/40 dark:bg-blue-950/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300">
              <Calendar className="h-4 w-4" />
              <span>Exam Schedule (वेळापत्रक)</span>
            </div>
            <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Start Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={form.startAt}
                  onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  End Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={form.endAt}
                  onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Duration & Negative Marks */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Duration (Mins) *
              </label>
              <input
                type="number"
                min="10"
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Initial Status *
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {EXAM_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing Model */}
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
              Pricing Model *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, isFree: true, price: 0 })}
                className={`rounded-2xl border px-3 py-2 text-xs font-bold transition ${
                  form.isFree
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-300"
                    : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                100% Free
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, isFree: false, price: form.price || 49 })}
                className={`rounded-2xl border px-3 py-2 text-xs font-bold transition ${
                  !form.isFree
                    ? "border-blue-500 bg-blue-50 text-blue-800 dark:border-blue-600 dark:bg-blue-950 dark:text-blue-300"
                    : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                Paid (₹{form.price || 49})
              </button>
            </div>
          </div>

          {!form.isFree && (
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Price in INR (₹)
              </label>
              <input
                type="number"
                min="1"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full rounded-2xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-900 outline-none focus:border-blue-600 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200"
              />
            </div>
          )}

          {/* Negative Marking Toggle */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Negative Marking
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {hasNegativeMarking ? "0.25 marks deducted per wrong answer" : "No deduction"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHasNegativeMarking(!hasNegativeMarking)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  hasNegativeMarking ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                    hasNegativeMarking ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || selected.length === 0}
            className="w-full rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md transition hover:bg-blue-500 active:scale-95 disabled:opacity-50"
          >
            {saving ? "Saving Examination..." : `Save Exam (${selected.length} Questions)`}
          </button>
        </form>

        {/* Right Section: Question Bank Selector */}
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Question Bank Selector
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <strong>{selected.length}</strong> of <strong>{questions.length}</strong> questions selected
              </p>
            </div>

            <button
              type="button"
              onClick={selectAll}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {selected.length === questions.length ? "Deselect All" : "Select All Questions"}
            </button>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                placeholder="Search questions by text or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          {/* Question List */}
          <div className="max-h-[600px] space-y-2.5 overflow-y-auto pr-1">
            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
                  />
                ))}
              </div>
            ) : (
              questions.map((q, idx) => {
                const isSelected = selected.includes(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => toggleQuestion(q.id)}
                    className={`flex cursor-pointer items-start justify-between gap-3 rounded-2xl border p-4 transition ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/70 shadow-sm dark:border-blue-600 dark:bg-blue-950/40"
                        : "border-slate-200 bg-white hover:bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-black text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {idx + 1}
                        </span>
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                          {q.subject?.name || "General"} · {q.difficulty}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white sm:text-sm">
                        {q.questionTextMr || q.questionText}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {q.options?.map((o) => (
                          <span
                            key={o.id}
                            className={`rounded-lg px-2 py-0.5 text-[10px] ${
                              o.isCorrect
                                ? "bg-emerald-100 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {o.textMr || o.text || o.optionTextMr || o.optionText}
                          </span>
                        ))}
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-1 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                );
              })
            )}

            {!loading && questions.length === 0 && (
              <div className="p-12 text-center text-xs text-slate-400">
                No questions found matching your filter criteria.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
