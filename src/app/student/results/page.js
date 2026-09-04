"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Award,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";

export default function StudentResultsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/results")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-blue-100 backdrop-blur-md">
              <Trophy className="h-3.5 w-3.5 text-amber-300" />
              Examination Results & Performance
            </div>
            <h1 className="mt-3 text-2xl font-black sm:text-3xl">My Exam Scorecards</h1>
            <p className="mt-1 text-xs text-blue-100 sm:text-sm">
              View your scores, subject breakdowns, accuracy, and detailed question reviews.
            </p>
          </div>
          <Link
            href="/student/exams"
            className="inline-flex items-center gap-1.5 self-start rounded-2xl bg-white px-5 py-2.5 text-xs font-black text-blue-700 shadow-md transition hover:bg-blue-50 active:scale-95 sm:self-auto"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Attempt More Exams
          </Link>
        </div>
      </div>

      {/* Results List */}
      {loading ? (
        <div className="grid min-h-[40vh] place-items-center">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <span>Loading examination scorecards...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((r) => (
            <article
              key={r.id}
              className="group flex flex-col justify-between gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-6 md:flex-row md:items-center"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-0.5 text-[11px] font-bold ${
                      r.passed
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300"
                    }`}
                  >
                    {r.passed ? "QUALIFIED / PASS" : "NEEDS PRACTICE"}
                  </span>
                  {r.exam?.examType && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {r.exam.examType}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                    <Calendar className="h-3 w-3" />
                    {new Date(r.evaluatedAt || Date.now()).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <h2 className="mt-2.5 text-base font-black text-slate-900 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 sm:text-lg">
                  {r.exam?.title || "Examination Attempt"}
                </h2>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {r.correct} Correct
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                    <XCircle className="h-3.5 w-3.5" />
                    {r.wrong} Incorrect
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400">
                    <HelpCircle className="h-3.5 w-3.5" />
                    {r.unanswered} Unanswered
                  </span>
                  {r.rank && (
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                      <Award className="h-3.5 w-3.5" />
                      Rank {r.rank}
                    </span>
                  )}
                </div>
              </div>

              {/* Score & Actions */}
              <div className="flex items-center justify-between gap-6 border-t border-slate-100 pt-3 dark:border-slate-800 md:justify-end md:border-t-0 md:pt-0">
                <div className="text-left md:text-right">
                  <div className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
                    {r.percentage}%
                  </div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Score: {r.score} / {r.totalMarks}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/student/results/${r.id}`}
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500 active:scale-95"
                  >
                    <span>View Scorecard</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  {r.examId && (
                    <Link
                      href={`/exam/${r.examId}/attempt`}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      title="Re-attempt Test"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}

          {!items.length && (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              <Trophy className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
              <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-white">
                No exam attempts submitted yet
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400 dark:text-slate-400">
                Once you attempt any of our free practice mock tests or coaching papers, your
                official scorecards and subject analysis will appear here.
              </p>
              <Link
                href="/student/exams"
                className="mt-6 inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow transition hover:bg-blue-500"
              >
                <span>Browse Available Mock Exams</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
