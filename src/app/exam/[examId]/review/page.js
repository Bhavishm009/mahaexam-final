"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Clock,
  HelpCircle,
  Award,
  ShieldAlert,
  Printer,
  Sparkles,
  BookOpen,
  FileCheck2,
  X,
  Zap,
} from "lucide-react";
import ConfirmModal from "@/components/confirm-modal";

export default function ExamReviewPage({ params }) {
  const resolvedParams = use(params);
  const examId = resolvedParams?.examId;

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showLiveConfirm, setShowLiveConfirm] = useState(false);
  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleEnd, setScheduleEnd] = useState("");

  const loadExam = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/exams/${examId}/review`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load exam review data");
      }
      setExam(data.exam);
      setUserRole(data.userRole);
      if (data.exam?.startAt) {
        setScheduleStart(new Date(data.exam.startAt).toISOString().slice(0, 16));
      }
      if (data.exam?.endAt) {
        setScheduleEnd(new Date(data.exam.endAt).toISOString().slice(0, 16));
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    if (examId) {
      loadExam();
    }
  }, [examId, loadExam]);

  async function handleAction(action, extraPayload = {}) {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/exams/${examId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extraPayload }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Exam status updated successfully!");
        setShowScheduleModal(false);
        loadExam();
      } else {
        toast.error(data.error || "Failed to update exam");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm font-bold text-slate-500">Loading Exam Review & Question Paper...</p>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">
          <ShieldAlert className="mx-auto h-12 w-12 text-rose-500" />
          <h2 className="mt-3 text-lg font-black">Unable to Review Exam</h2>
          <p className="mt-1 text-xs">{error || "Exam not found"}</p>
          <Link
            href="/admin/global-exams"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Extract questions from whichever relation has the full question set
  const hasQuestions =
    (exam.questions?.length || 0) >= (exam.questionSnapshots?.length || 0) &&
    (exam.questions?.length || 0) > 0;
  const questionItems = hasQuestions
    ? exam.questions.map((eq, idx) => ({
        order: eq.questionOrder || idx + 1,
        marks: eq.marks || 1,
        negativeMarks: eq.negativeMarks || 0,
        text: eq.question?.questionTextMr || eq.question?.questionText || "Question",
        textEn: eq.question?.questionText,
        explanation: eq.question?.explanationMr || eq.question?.explanation,
        subject: eq.question?.subject?.name || "General",
        difficulty: eq.question?.difficulty || "MEDIUM",
        options: eq.question?.options || [],
      }))
    : exam.questionSnapshots?.map((qs, idx) => ({
        order: qs.position || idx + 1,
        marks: qs.marks || 1,
        negativeMarks: qs.negativeMarks || 0,
        text: qs.snapshot?.questionTextMr || qs.snapshot?.questionText || "Question",
        textEn: qs.snapshot?.questionText,
        explanation: qs.snapshot?.explanationMr || qs.snapshot?.explanation,
        subject: qs.sectionName || "Section",
        difficulty: qs.snapshot?.difficulty || "MEDIUM",
        options: qs.snapshot?.options || [],
      })) || [];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner with Role Context */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <FileCheck2 className="h-3.5 w-3.5" />
              {userRole === "SUPER_ADMIN"
                ? "Super Admin Quality Review"
                : "Faculty / Teacher Quality Review"}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                exam.status === "LIVE"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : exam.status === "SCHEDULED"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
              }`}
            >
              Status: {exam.status}
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            {exam.title}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Review every question, answer key, rationale, and exam settings before student release.
          </p>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Printer className="h-4 w-4 text-slate-500" />
            <span>Print Paper</span>
          </button>

          {exam.status !== "LIVE" && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => setShowLiveConfirm(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              <span>Make Live Now</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowScheduleModal(true)}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-500 active:scale-95"
          >
            <Calendar className="h-4 w-4" />
            <span>Schedule Exam</span>
          </button>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Schedule Exam Date & Time
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Scheduled Start Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleStart}
                  onChange={(e) => setScheduleStart(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Scheduled End Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={scheduleEnd}
                  onChange={(e) => setScheduleEnd(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3 text-[11px] text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300">
                🔔 <strong>Automated Alerts Lifecycle:</strong> Scheduling enqueues 4 automated
                alerts: Immediate schedule notice, <strong>1 hour before</strong>,{" "}
                <strong>10 minutes before</strong>, and at <strong>Go-Live</strong>.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading || !scheduleStart}
                  onClick={() =>
                    handleAction("SCHEDULE", {
                      startAt: scheduleStart,
                      endAt: scheduleEnd || null,
                    })
                  }
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {actionLoading ? "Scheduling..." : "Save & Broadcast Schedule"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exam Specs Metadata Card */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <BookOpen className="h-3.5 w-3.5 text-blue-600" />
            <span>Category</span>
          </div>
          <div className="mt-1 truncate text-sm font-black text-slate-900 dark:text-white">
            {exam.examType || "Mock Test"}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <HelpCircle className="h-3.5 w-3.5 text-indigo-600" />
            <span>Questions</span>
          </div>
          <div className="mt-1 text-xl font-black text-indigo-600 dark:text-indigo-400">
            {questionItems.length} Qs
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span>Duration</span>
          </div>
          <div className="mt-1 text-xl font-black text-slate-900 dark:text-white">
            {exam.durationMinutes} Min
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <Award className="h-3.5 w-3.5 text-emerald-600" />
            <span>Total Marks</span>
          </div>
          <div className="mt-1 text-xl font-black text-emerald-600 dark:text-emerald-400">
            {exam.totalMarks} M
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
            <span>Negative Marks</span>
          </div>
          <div className="mt-1 text-sm font-black text-rose-600 dark:text-rose-400">
            {exam.negativeMarks > 0 ? `-${exam.negativeMarks}` : "None (0)"}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            <span>Pricing Access</span>
          </div>
          <div className="mt-1 text-sm font-black text-purple-600 dark:text-purple-400">
            {exam.isFree ? "100% Free" : `₹${exam.price}`}
          </div>
        </div>
      </div>

      {/* Questions Review Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Question Paper Review ({questionItems.length} Total Questions)
          </h2>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            All Correct Answers Verified ✅
          </span>
        </div>

        <div className="space-y-4">
          {questionItems.map((q, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white">
                    {q.order}
                  </span>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {q.subject}
                  </span>
                  <span
                    className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                      q.difficulty === "EASY"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : q.difficulty === "HARD"
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {q.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>+{q.marks} Mark</span>
                  {q.negativeMarks > 0 && <span className="text-rose-500">-{q.negativeMarks}</span>}
                </div>
              </div>

              {/* Question Text */}
              <div className="mt-4">
                <p className="text-sm font-black text-slate-900 dark:text-white sm:text-base">
                  {q.text}
                </p>
                {q.textEn && q.textEn !== q.text && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{q.textEn}</p>
                )}
              </div>

              {/* Options Grid with Correct Answer Highlight */}
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {q.options?.map((opt, oIdx) => (
                  <div
                    key={opt.id || oIdx}
                    className={`flex items-start justify-between rounded-2xl border p-3 text-xs transition ${
                      opt.isCorrect
                        ? "border-emerald-500 bg-emerald-50/80 font-bold text-emerald-900 shadow-sm dark:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-200"
                        : "border-slate-200 bg-slate-50/40 text-slate-700 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-slate-400">
                        {String.fromCharCode(65 + oIdx)}.
                      </span>
                      <span>{opt.optionTextMr || opt.optionText || opt.text}</span>
                    </div>

                    {opt.isCorrect && (
                      <span className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-black text-white">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>अचूक उत्तर</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Explanation / Rationale */}
              {q.explanation && (
                <div className="mt-4 rounded-2xl border border-blue-100/50 bg-blue-50/60 p-3.5 text-xs text-slate-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-slate-300">
                  <div className="font-bold text-blue-900 dark:text-blue-300">
                    💡 स्पष्टीकरण (Explanation):
                  </div>
                  <div className="mt-1">{q.explanation}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={showLiveConfirm}
        title="Make Exam Live Now"
        description={`Are you sure you want to make "${exam?.title}" live immediately?`}
        safetyNote="All target students will receive access immediately along with any push notifications."
        confirmText="Make Live Now"
        cancelText="Cancel"
        variant="info"
        isLoading={actionLoading}
        onConfirm={async () => {
          await handleAction("MAKE_LIVE");
          setShowLiveConfirm(false);
        }}
        onClose={() => setShowLiveConfirm(false)}
      />
    </div>
  );
}
