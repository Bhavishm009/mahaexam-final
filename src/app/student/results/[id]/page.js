"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, CheckCircle2, Clock, ArrowLeft, RotateCcw, BookOpen } from "lucide-react";

export default function ResultPage({ params }) {
  const [d, setD] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.resolve(params).then((p) => {
      fetch(`/api/student/results/${p.id}`)
        .then((r) => {
          if (!r.ok) {
            throw new Error("Result not found");
          }
          return r.json();
        })
        .then(setD)
        .catch((err) => setError(err.message));
    });
  }, [params]);

  if (error) {
    return (
      <div className="mx-auto my-12 max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-xl font-black text-slate-900 dark:text-white">
          Scorecard Not Available
        </h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          We could not load this result. The attempt may still be processing.
        </p>
        <Link
          href="/student/dashboard"
          className="mt-6 inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!d) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span>Generating and loading scorecard...</span>
        </div>
      </div>
    );
  }

  const r = d.result;
  const score = r.obtainedMarks ?? r.score ?? 0;
  const total = r.totalMarks ?? r.exam?.totalMarks ?? 0;
  const percentage = r.percentage ?? (total > 0 ? Math.round((score / total) * 100) : 0);
  const isPassed = r.passed ?? percentage >= 40;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/student/results"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to All Results
        </Link>
        {r.exam?.id && (
          <Link
            href={`/exam/${r.exam.slug || r.exam.id}/attempt`}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500 active:scale-95"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Re-attempt Exam
          </Link>
        )}
      </div>

      {/* Hero Score Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-blue-100 backdrop-blur-md">
              <Trophy className="h-3.5 w-3.5 text-amber-300" />
              Maharashtra Exam Official Scorecard
            </span>
            <h1 className="mt-3 text-2xl font-black sm:text-3xl">
              {r.exam?.title || "Examination Result"}
            </h1>
            <p className="mt-1 text-xs text-blue-100 sm:text-sm">
              Evaluated on {new Date(r.evaluatedAt || Date.now()).toLocaleString("en-IN")}
            </p>
          </div>
          <div
            className={`self-start rounded-2xl px-6 py-4 text-center font-black backdrop-blur-md sm:self-auto ${
              isPassed
                ? "border border-emerald-400/30 bg-emerald-500/25 text-emerald-100"
                : "border border-rose-400/30 bg-rose-500/25 text-rose-100"
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/75">
              Result Status
            </div>
            <div className="mt-0.5 text-xl sm:text-2xl">
              {isPassed ? "QUALIFIED / PASS" : "NEEDS PRACTICE"}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metric Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Score Obtained", `${score} / ${total}`, "text-blue-600 dark:text-blue-400"],
          ["Percentage", `${percentage}%`, "text-indigo-600 dark:text-indigo-400"],
          [
            "Correct Answers",
            r.correctCount ?? r.correct ?? 0,
            "text-emerald-600 dark:text-emerald-400",
          ],
          ["Incorrect Answers", r.wrongCount ?? r.wrong ?? 0, "text-rose-600 dark:text-rose-400"],
          [
            "Unanswered",
            r.unansweredCount ?? r.unanswered ?? 0,
            "text-amber-600 dark:text-amber-400",
          ],
        ].map(([label, val, color]) => (
          <div
            key={label}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</div>
            <div className={`mt-2 text-2xl font-black ${color}`}>{val}</div>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white sm:text-lg">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Subject-wise Performance (विषयनिहाय गुण)
            </h2>
            <span className="text-xs font-semibold text-slate-400">
              {r.subjectResults?.length || 0} Subjects
            </span>
          </div>

          <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
            {r.subjectResults && r.subjectResults.length > 0 ? (
              r.subjectResults.map((x) => (
                <div key={x.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {x.subjectName}
                    </span>
                    <span
                      className={`rounded-lg px-2.5 py-1 font-mono text-xs font-bold ${
                        x.percentage >= 60
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : x.percentage >= 40
                            ? "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {x.percentage}% Score
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        x.percentage >= 60
                          ? "bg-emerald-500"
                          : x.percentage >= 40
                            ? "bg-blue-600"
                            : "bg-slate-400"
                      }`}
                      style={{ width: `${Math.max(0, Math.min(100, x.percentage))}%` }}
                    />
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {x.correct} Correct
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {x.wrong} Wrong
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">{x.unanswered || 0} Skipped</span>
                    <span>•</span>
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      {x.accuracy}% Accuracy
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                General Knowledge, Marathi Grammar, Mathematics &amp; Reasoning Comprehensive
                Analysis
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white sm:text-lg">
              Key Takeaways &amp; Next Steps
            </h2>
            <div className="mt-4 space-y-3 text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
              <div className="flex items-start gap-3 rounded-2xl bg-blue-50/70 p-4 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                <div>
                  <b className="text-slate-900 dark:text-white">Accuracy Focus (अचूकता)</b>
                  <p className="mt-0.5 text-xs text-blue-800 dark:text-blue-300">
                    Review negative marks on incorrect questions to optimize your percentile in
                    Maharashtra State CBT exams (MPSC, Police Bharti, Talathi).
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-amber-50/70 p-4 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <b className="text-slate-900 dark:text-white">Time Management (वेळ नियोजन)</b>
                  <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300">
                    Aim to spend under 45 seconds per Marathi Grammar &amp; GK question to save time
                    for Mathematics and Reasoning sections.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400 dark:border-slate-800">
            <span>MahaExam Official Scorecard System</span>
            <Link
              href="/student/exams"
              className="font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Practice More Tests &rarr;
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
