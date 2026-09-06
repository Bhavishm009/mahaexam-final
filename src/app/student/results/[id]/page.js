"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  CheckCircle2,
  Clock,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Download,
  FileText,
  Lock,
  Eye,
  AlertCircle,
  HelpCircle,
  XCircle,
  Printer,
} from "lucide-react";

export default function ResultPage({ params }) {
  const [d, setD] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL"); // ALL, CORRECT, WRONG, UNANSWERED
  const [activeTab, setActiveTab] = useState("SCORECARD"); // SCORECARD, REVIEW

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
  const questions = d.questions || [];
  const answersLocked = Boolean(d.answersLocked);
  const answersReleaseAt = d.answersReleaseAt;

  const score = r.obtainedMarks ?? r.score ?? 0;
  const total = r.totalMarks ?? r.exam?.totalMarks ?? 0;
  const percentage = r.percentage ?? (total > 0 ? Math.round((score / total) * 100) : 0);
  const isPassed = r.passed ?? percentage >= 40;

  // Filtered questions for review
  const filteredQuestions = questions.filter((q) => {
    if (filter === "CORRECT") return q.isCorrect === true;
    if (filter === "WRONG") return q.isAnswered && q.isCorrect === false;
    if (filter === "UNANSWERED") return !q.isAnswered;
    return true;
  });

  // Download 1: Student's Own Response Sheet
  function downloadResponseSheet() {
    const printWin = window.open("", "_blank");
    if (!printWin) {
      alert("Please allow popups to download response sheet.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${r.exam?.title || "Exam"} - My Response Sheet</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #1e293b; line-height: 1.5; }
          .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: bold; color: #1e3a8a; }
          .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; }
          .meta-table td { padding: 6px 12px; border: 1px solid #cbd5e1; }
          .meta-label { font-weight: bold; background-color: #f1f5f9; width: 25%; }
          .q-card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 18px; page-break-inside: avoid; }
          .q-header { display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 8px; font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
          .opt-list { margin-left: 20px; font-size: 13px; }
          .opt-item { margin: 4px 0; padding: 4px 8px; border-radius: 4px; }
          .chosen-opt { background-color: #dbeafe; font-weight: bold; color: #1d4ed8; border-left: 4px solid #2563eb; }
          .correct-opt { background-color: #dcfce7; font-weight: bold; color: #15803d; border-left: 4px solid #16a34a; }
          .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">MAHAEXAM CBT OFFICIAL CANDIDATE RESPONSE SHEET</div>
          <div style="font-size: 13px; color: #475569; margin-top: 4px;">उमेदवाराची अधिकृत उत्तरपत्रिका (Student Attempt Copy)</div>
        </div>

        <table class="meta-table">
          <tr>
            <td class="meta-label">Candidate Name:</td>
            <td>${r.student?.name || "Student"}</td>
            <td class="meta-label">Email ID:</td>
            <td>${r.student?.email || "N/A"}</td>
          </tr>
          <tr>
            <td class="meta-label">Examination:</td>
            <td><b>${r.exam?.title || "Exam"}</b></td>
            <td class="meta-label">Attempt ID:</td>
            <td style="font-family: monospace;">${r.attemptId || "N/A"}</td>
          </tr>
          <tr>
            <td class="meta-label">Total Score Obtained:</td>
            <td><b>${score} / ${total}</b> (${percentage}%)</td>
            <td class="meta-label">Result Status:</td>
            <td><b>${isPassed ? "QUALIFIED" : "NEEDS PRACTICE"}</b></td>
          </tr>
          <tr>
            <td class="meta-label">Correct / Incorrect:</td>
            <td>${r.correctCount || 0} Correct, ${r.wrongCount || 0} Wrong</td>
            <td class="meta-label">Submitted On:</td>
            <td>${new Date(r.evaluatedAt || Date.now()).toLocaleString("en-IN")}</td>
          </tr>
        </table>

        <div style="font-weight: bold; margin-bottom: 12px; font-size: 15px;">Question Details & Submitted Answers:</div>

        ${questions
          .map((q, idx) => {
            const chosenOpt = q.options.find((o) => o.id === q.selectedOptionId);
            return `
              <div class="q-card">
                <div class="q-header">
                  <span>Q${idx + 1}. [${q.subjectName || "General"}]</span>
                  <span>Marks: ${q.marks} | Neg: -${q.negativeMarks}</span>
                </div>
                <div style="margin-bottom: 10px; font-size: 13px;">${q.questionTextMr || q.questionText}</div>
                <div class="opt-list">
                  ${q.options
                    .map((opt) => {
                      const isChosen = opt.id === q.selectedOptionId;
                      return `<div class="opt-item ${isChosen ? "chosen-opt" : ""}">
                        ${isChosen ? "👉 " : ""}(${opt.order}) ${opt.optionTextMr || opt.optionText}
                        ${isChosen ? " <b>[उमेदवाराने निवडलेले उत्तर / Your Choice]</b>" : ""}
                      </div>`;
                    })
                    .join("")}
                </div>
                <div style="margin-top: 8px; font-size: 12px; color: #475569;">
                  Status: <b>${q.isAnswered ? "Answered (Attempted)" : "Not Answered (Skipped)"}</b>
                </div>
              </div>
            `;
          })
          .join("")}

        <div class="footer">
          MahaExam Computer Based Examination Portal • All Candidate Rights Reserved • Official Document
        </div>
      </body>
      </html>
    `;

    printWin.document.write(htmlContent);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 500);
  }

  // Download 2: Official Question Paper & Answer Key
  function downloadQuestionPaper() {
    if (answersLocked) {
      alert("अधिकृत उत्तरतालिका परीक्षेची वेळ संपल्यानंतर उपलब्ध होईल.");
      return;
    }

    const printWin = window.open("", "_blank");
    if (!printWin) {
      alert("Please allow popups to download question paper.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${r.exam?.title || "Exam"} - Official Question Paper & Answer Key</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #1e293b; line-height: 1.5; }
          .header { text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: bold; color: #166534; }
          .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; }
          .meta-table td { padding: 6px 12px; border: 1px solid #cbd5e1; }
          .meta-label { font-weight: bold; background-color: #f1f5f9; width: 25%; }
          .q-card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 18px; page-break-inside: avoid; }
          .q-header { display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 8px; font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
          .opt-list { margin-left: 20px; font-size: 13px; }
          .opt-item { margin: 4px 0; padding: 4px 8px; border-radius: 4px; }
          .correct-opt { background-color: #dcfce7; font-weight: bold; color: #15803d; border-left: 4px solid #16a34a; }
          .expl { margin-top: 10px; background-color: #f8fafc; border: 1px dashed #94a3b8; border-radius: 6px; padding: 8px 12px; font-size: 12px; }
          .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">MAHAEXAM OFFICIAL QUESTION PAPER & MASTER ANSWER KEY</div>
          <div style="font-size: 13px; color: #475569; margin-top: 4px;">अधिकृत प्रश्नपत्रिका, अचूक उत्तरतालिका व सविस्तर स्पष्टीकरण</div>
        </div>

        <table class="meta-table">
          <tr>
            <td class="meta-label">Examination Title:</td>
            <td><b>${r.exam?.title || "Exam"}</b></td>
            <td class="meta-label">Total Questions:</td>
            <td>${questions.length} Questions</td>
          </tr>
          <tr>
            <td class="meta-label">Total Marks:</td>
            <td>${total} Marks</td>
            <td class="meta-label">Duration:</td>
            <td>${r.exam?.durationMinutes || 90} Minutes</td>
          </tr>
        </table>

        ${questions
          .map((q, idx) => {
            return `
              <div class="q-card">
                <div class="q-header">
                  <span>प्रश्न क्र. ${idx + 1} [${q.subjectName || "सामान्य"}]</span>
                  <span>गुण: ${q.marks} | उणे गुण: -${q.negativeMarks}</span>
                </div>
                <div style="margin-bottom: 10px; font-size: 13px; font-weight: 600;">${q.questionTextMr || q.questionText}</div>
                <div class="opt-list">
                  ${q.options
                    .map((opt) => {
                      const isCorrect = opt.id === q.correctOptionId || opt.isCorrect;
                      return `<div class="opt-item ${isCorrect ? "correct-opt" : ""}">
                        ${isCorrect ? "✅ " : ""}(${opt.order}) ${opt.optionTextMr || opt.optionText}
                        ${isCorrect ? " <b>[अचूक उत्तर / Correct Option]</b>" : ""}
                      </div>`;
                    })
                    .join("")}
                </div>
                ${
                  q.explanationMr || q.explanation
                    ? `<div class="expl">
                        <b>स्पष्टीकरण (Solution / Explanation):</b><br/>
                        ${q.explanationMr || q.explanation}
                      </div>`
                    : ""
                }
              </div>
            `;
          })
          .join("")}

        <div class="footer">
          MahaExam Official Master Answer Key & Question Bank • Prepared for Competitive Exam Aspirants
        </div>
      </body>
      </html>
    `;

    printWin.document.write(htmlContent);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 500);
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/student/results"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to All Results
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Response Sheet Button */}
          <button
            type="button"
            onClick={downloadResponseSheet}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <Download className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>माझी उत्तरपत्रिका (My Response Sheet)</span>
          </button>

          {/* Download Question Paper with Answers Button */}
          <button
            type="button"
            onClick={downloadQuestionPaper}
            disabled={answersLocked}
            className={`inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold shadow-sm transition active:scale-95 ${
              answersLocked
                ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-500"
                : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
            }`}
          >
            {answersLocked ? (
              <Lock className="h-3.5 w-3.5 text-slate-400" />
            ) : (
              <Printer className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            )}
            <span>
              {answersLocked
                ? "उत्तरतालिका कुलूपबंद (Answers Locked)"
                : "अधिकृत प्रश्नपत्रिका व उत्तरे (Download Paper & Key)"}
            </span>
          </button>

          {r.exam?.id && (
            <Link
              href={`/exam/${r.exam.slug || r.exam.id}/attempt`}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500 active:scale-95"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Re-attempt
            </Link>
          )}
        </div>
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
              Candidate: <b>{r.student?.name}</b> • Evaluated on{" "}
              {new Date(r.evaluatedAt || Date.now()).toLocaleString("en-IN")}
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

      {/* Anti-Leak Answer Security Alert Banner */}
      {answersLocked && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-200">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="text-xs">
            <b className="font-bold">
              गोपनीयता व सुरक्षेसाठी अचूक उत्तरे तात्पुरती कुलूपबंद आहेत (Anti-Leak Answer
              Protection Active):
            </b>
            <p className="mt-1 text-amber-800 dark:text-amber-300">
              इतर सर्व विद्यार्थ्यांची परीक्षा पूर्ण होईपर्यंत अचूक उत्तरतालिका सुरक्षित ठेवण्यात
              आली आहे.
              {answersReleaseAt && (
                <span>
                  {" "}
                  ही परीक्षा समाप्त झाल्यानंतर (
                  <b>
                    {new Date(answersReleaseAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </b>
                  ) सर्व अचूक उत्तरे, स्पष्टीकरणे व डाउनलोड उपलब्ध होतील.
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Navigation Tabs: Scorecard Summary vs Question-by-Question Review */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab("SCORECARD")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition ${
            activeTab === "SCORECARD"
              ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Trophy className="h-4 w-4" />
          <span>गुणवत्ता विश्लेषण (Scorecard & Analytics)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("REVIEW")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition ${
            activeTab === "REVIEW"
              ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>प्रश्नोत्तरे व स्पष्टीकरणे (Question Review & Solutions)</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {questions.length}
          </span>
        </button>
      </div>

      {activeTab === "SCORECARD" && (
        <div className="space-y-6">
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
              [
                "Incorrect Answers",
                r.wrongCount ?? r.wrong ?? 0,
                "text-rose-600 dark:text-rose-400",
              ],
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
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {label}
                </div>
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
                          style={{
                            width: `${Math.max(0, Math.min(100, x.percentage))}%`,
                          }}
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
                    Comprehensive Subject Performance Data Available
                  </div>
                )}
              </div>
            </section>

            <section className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white sm:text-lg">
                  Key Insights & Next Actions
                </h2>
                <div className="mt-4 space-y-3 text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
                  <div className="flex items-start gap-3 rounded-2xl bg-blue-50/70 p-4 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                    <div>
                      <b className="text-slate-900 dark:text-white">Review Detailed Answers</b>
                      <p className="mt-0.5 text-xs text-blue-800 dark:text-blue-300">
                        Switch to the &ldquo;Question Review & Solutions&rdquo; tab to inspect your
                        selected options and learn from comprehensive explanations.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl bg-amber-50/70 p-4 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                      <b className="text-slate-900 dark:text-white">Download Response Sheet</b>
                      <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300">
                        Use the &ldquo;माझी उत्तरपत्रिका (My Response Sheet)&rdquo; button above to
                        save or print an official candidate record of your submission.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400 dark:border-slate-800">
                <span>MahaExam CBT Performance System</span>
                <button
                  type="button"
                  onClick={() => setActiveTab("REVIEW")}
                  className="font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  View Question Analysis &rarr;
                </button>
              </div>
            </section>
          </div>
        </div>
      )}

      {activeTab === "REVIEW" && (
        <div className="space-y-6">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "ALL", label: `सर्व प्रश्न (${questions.length})` },
                {
                  id: "CORRECT",
                  label: `अचूक (${r.correctCount || 0})`,
                  color:
                    "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
                },
                {
                  id: "WRONG",
                  label: `चुकलेले (${r.wrongCount || 0})`,
                  color:
                    "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
                },
                {
                  id: "UNANSWERED",
                  label: `अनुत्तरीत (${r.unansweredCount || 0})`,
                  color:
                    "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold transition ${
                    filter === tab.id
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-xs font-semibold text-slate-400">
              Showing {filteredQuestions.length} of {questions.length} questions
            </span>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => {
              return (
                <div
                  key={q.id || idx}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900"
                >
                  {/* Question Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-lg bg-blue-50 text-xs font-black text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                        {q.order || idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {q.subjectName || "General Section"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {q.isAnswered ? (
                        q.isCorrect === true ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" />
                            बरोबर (+{q.marks})
                          </span>
                        ) : q.isCorrect === false ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                            <XCircle className="h-3 w-3" />
                            चुकले (-{q.negativeMarks})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
                            Attempted
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                          अनुत्तरीत (Skipped)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="mt-4 text-sm font-bold leading-relaxed text-slate-900 dark:text-white">
                    {q.questionTextMr || q.questionText}
                  </div>
                  {q.questionText && q.questionTextMr && q.questionText !== q.questionTextMr && (
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {q.questionText}
                    </div>
                  )}

                  {/* Options List */}
                  <div className="mt-4 space-y-2">
                    {q.options.map((opt) => {
                      const isChosen = opt.id === q.selectedOptionId;
                      const isCorrect = opt.id === q.correctOptionId || opt.isCorrect;

                      let style =
                        "border-slate-100 bg-slate-50/60 text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300";

                      if (isCorrect) {
                        style =
                          "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800/80 dark:bg-emerald-950/60 dark:text-emerald-200 font-bold";
                      } else if (isChosen && !isCorrect && !answersLocked) {
                        style =
                          "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800/80 dark:bg-rose-950/60 dark:text-rose-200 font-bold";
                      } else if (isChosen) {
                        style =
                          "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800/80 dark:bg-blue-950/60 dark:text-blue-200 font-bold";
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center justify-between rounded-2xl border p-3 text-xs transition ${style}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="shadow-xs grid h-5 w-5 shrink-0 place-items-center rounded-md bg-white/80 font-mono text-[11px] font-bold text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                              {opt.order}
                            </span>
                            <span>{opt.optionTextMr || opt.optionText}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isChosen && (
                              <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-black text-white">
                                आपले उत्तर (Your Choice)
                              </span>
                            )}
                            {isCorrect && (
                              <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white">
                                अचूक उत्तर (Correct)
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Block (if unlocked) */}
                  {!answersLocked && (q.explanationMr || q.explanation) && (
                    <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs dark:border-blue-900/40 dark:bg-blue-950/30">
                      <div className="font-bold text-blue-950 dark:text-blue-300">
                        💡 सविस्तर स्पष्टीकरण (Detailed Explanation):
                      </div>
                      <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-300">
                        {q.explanationMr || q.explanation}
                      </p>
                    </div>
                  )}

                  {answersLocked && (
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                      <Lock className="h-3.5 w-3.5" />
                      <span>अचूक उत्तर व स्पष्टीकरण परीक्षेचा वेळ संपल्यानंतर प्रसिद्ध होईल.</span>
                    </div>
                  )}
                </div>
              );
            })}

            {!filteredQuestions.length && (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900">
                या फिल्टर अंतर्गत कोणतेही प्रश्न आढळले नाहीत.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
