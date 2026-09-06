"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, BookOpen, Clock, FileText, CheckCircle2, AlertCircle } from "lucide-react";

export default function CoachingExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/coaching/exams")
      .then((r) => r.json())
      .then((d) => {
        setExams(d.exams || []);
      })
      .catch((err) => {
        console.error("Failed to load coaching exams:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              Coaching Examinations &amp; Papers
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Create, configure, and manage questions for your institution&apos;s exam papers.
            </p>
          </div>
          <Link
            href="/coaching/exams/create"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Exam</span>
          </Link>
        </div>

        {/* Exam Cards */}
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="text-sm font-medium">Loading coaching examinations...</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <FileText className="mx-auto mb-3 h-12 w-12 text-slate-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No exams created yet
            </h3>
            <p className="mb-4 mt-1 text-xs text-slate-500 dark:text-slate-400">
              Get started by creating your first coaching examination paper.
            </p>
            <Link
              href="/coaching/exams/create"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-500"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Examination</span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exams.map((ex) => (
              <div
                key={ex.id}
                className="shadow-xs flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {ex.examType || "Coaching"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                        ex.status === "LIVE"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {ex.status}
                    </span>
                  </div>

                  <h3 className="line-clamp-2 text-base font-black text-slate-900 dark:text-white">
                    {ex.title}
                  </h3>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                      {ex.totalQuestions} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {ex.durationMinutes}m
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <Link
                    href={`/coaching/exams/${ex.id}/questions`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800 transition hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-200 dark:hover:bg-teal-900"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-teal-600" />
                    <span>Manage Paper</span>
                  </Link>

                  <Link
                    href={`/coaching/results/${ex.id}`}
                    className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Results
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
