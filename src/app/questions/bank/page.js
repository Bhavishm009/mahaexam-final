"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Upload,
} from "lucide-react";

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
      p.set("limit", "200");

      const r = await fetch(`/api/questions/bank?${p}`);
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

  const totalPages = Math.max(1, Math.ceil(questions.length / pageSize));

  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return questions.slice(start, start + pageSize);
  }, [questions, currentPage, pageSize]);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <HelpCircle className="h-3.5 w-3.5" />
              Centralized Question Repository
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Question Bank (प्रश्न संच)
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Super Admin and verified faculty repository for all competitive Maharashtra examinations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/questions/import"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow transition hover:bg-blue-500 active:scale-95"
          >
            <Upload className="h-4 w-4" />
            <span>Import Questions</span>
          </Link>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Search & Difficulty Filter Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions by text or keyword..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              onKeyDown={(e) => e.key === "Enter" && loadQuestions()}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              <option value="">All Difficulties (सर्व काठिण्यपातळी)</option>
              <option value="EASY">Easy (सोपे)</option>
              <option value="MEDIUM">Medium (मध्यम)</option>
              <option value="HARD">Hard (कठीण)</option>
            </select>

            <button
              type="button"
              onClick={loadQuestions}
              className="rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              Search
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-3 pt-2">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="mt-2 text-xs font-bold">Loading questions repository...</p>
            </div>
          ) : paginatedQuestions.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-12 text-center text-slate-400 dark:border-slate-800 dark:bg-slate-950">
              No questions found matching your search.
            </div>
          ) : (
            paginatedQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4 transition hover:border-blue-200 hover:bg-white dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-700 dark:hover:bg-slate-900"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-blue-600 text-[10px] font-black text-white">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </span>
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                      {q.subject?.name || "General"}
                    </span>
                    {q.topic?.name && (
                      <span className="text-[11px] text-slate-400">· {q.topic.name}</span>
                    )}
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
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <span>+{q.marks || 1} Mark</span>
                    {q.organization?.name && (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {q.organization.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-xs font-bold text-slate-900 dark:text-white sm:text-sm">
                    {q.questionTextMr || q.questionText}
                  </p>
                  {q.questionTextMr && q.questionText && q.questionText !== q.questionTextMr && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {q.questionText}
                    </p>
                  )}
                </div>

                {q.options && q.options.length > 0 && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={opt.id || oIdx}
                        className={`flex items-center justify-between rounded-xl border p-2.5 text-xs ${
                          opt.isCorrect
                            ? "border-emerald-500 bg-emerald-50/70 font-bold text-emerald-900 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-200"
                            : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-400">
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          <span>{opt.optionTextMr || opt.optionText || opt.text}</span>
                        </div>
                        {opt.isCorrect && (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white shrink-0">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            <span>अचूक उत्तर</span>
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

        {/* Numbered Pagination */}
        {!loading && questions.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, questions.length)} of {questions.length} questions
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((pageNum, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && pageNum - prev > 1;
                  return (
                    <span key={pageNum} className="flex items-center">
                      {showEllipsis && <span className="px-1 text-xs text-slate-400">...</span>}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 w-8 rounded-xl text-xs font-bold transition ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white shadow-sm"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {pageNum}
                      </button>
                    </span>
                  );
                })}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
