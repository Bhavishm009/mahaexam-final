"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  Tag,
  Calendar,
  Clock,
  X,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { MAHARASHTRA_EXAM_TYPES, EXAM_STATUSES } from "@/lib/exam-types";

export default function GlobalExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [hasNegativeMarking, setHasNegativeMarking] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Reschedule Modal State
  const [rescheduleModalExam, setRescheduleModalExam] = useState(null);
  const [newStartAt, setNewStartAt] = useState("");
  const [newEndAt, setNewEndAt] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  const [form, setForm] = useState({
    title: "",
    examType: "Police Bharti",
    durationMinutes: 90,
    totalQuestions: 25,
    totalMarks: 25,
    negativeMarks: 0.25,
    status: "LIVE",
    isFree: true,
    price: 0,
    startAt: "",
    endAt: "",
    sendNotification: true,
  });

  const load = () => {
    setLoading(true);
    fetch("/api/admin/global-exams")
      .then((r) => r.json())
      .then((d) => {
        setExams(d.exams || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filteredExams = useMemo(() => {
    return exams.filter((x) => {
      const matchSearch =
        !searchTerm ||
        x.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        x.slug?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory =
        categoryFilter === "ALL" || x.examType === categoryFilter;
      const matchStatus =
        statusFilter === "ALL" || x.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [exams, searchTerm, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredExams.length / pageSize));

  const paginatedExams = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredExams.slice(start, start + pageSize);
  }, [filteredExams, currentPage, pageSize]);

  async function create(e) {
    e.preventDefault();
    setStatusMessage({ type: "info", text: "Creating & Scheduling global examination..." });
    const payload = {
      ...form,
      negativeMarks: hasNegativeMarking ? Number(form.negativeMarks || 0.25) : 0,
    };
    const r = await fetch("/api/admin/global-exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const d = await r.json();
    if (!r.ok) {
      setStatusMessage({ type: "error", text: d.error || "Failed to create exam" });
      return;
    }
    setStatusMessage({
      type: "success",
      text: "Global examination published & notifications dispatched successfully!",
    });
    setForm({
      title: "",
      examType: "Police Bharti",
      durationMinutes: 90,
      totalQuestions: 25,
      totalMarks: 25,
      negativeMarks: 0.25,
      status: "LIVE",
      isFree: true,
      price: 0,
      startAt: "",
      endAt: "",
      sendNotification: true,
    });
    load();
    setTimeout(() => setStatusMessage(null), 4000);
  }

  async function updateStatus(id, newStatus) {
    setUpdatingId(id);
    const r = await fetch("/api/admin/global-exams", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    const d = await r.json();
    setUpdatingId(null);
    if (!r.ok) {
      alert(d.error || "Failed to update status");
      return;
    }
    setExams((prev) => prev.map((x) => (x.id === id ? { ...x, status: newStatus } : x)));
  }

  async function handleReschedule(e) {
    e.preventDefault();
    if (!rescheduleModalExam || !newStartAt) {
      alert("Please specify a valid start date & time.");
      return;
    }
    setRescheduling(true);
    try {
      const r = await fetch("/api/admin/global-exams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rescheduleModalExam.id,
          status: "SCHEDULED",
          startAt: newStartAt,
          endAt: newEndAt || null,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        alert(d.error || "Failed to reschedule exam");
        return;
      }
      setExams((prev) =>
        prev.map((x) =>
          x.id === rescheduleModalExam.id
            ? { ...x, status: "SCHEDULED", startAt: newStartAt, endAt: newEndAt || null }
            : x,
        ),
      );
      setRescheduleModalExam(null);
      alert("✅ Examination rescheduled successfully! Target students have been notified.");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setRescheduling(false);
    }
  }

  async function toggleFreePaid(exam) {
    const newIsFree = !exam.isFree;
    const newPrice = newIsFree ? 0 : Number(prompt("Enter Exam Price (INR ₹):", "49") || 49);
    if (!newIsFree && isNaN(newPrice)) {
      return;
    }

    setUpdatingId(exam.id);
    const r = await fetch("/api/admin/global-exams", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: exam.id,
        isFree: newIsFree,
        price: newPrice,
      }),
    });
    const d = await r.json();
    setUpdatingId(null);
    if (!r.ok) {
      alert(d.error || "Failed to update pricing");
      return;
    }
    setExams((prev) =>
      prev.map((x) => (x.id === exam.id ? { ...x, isFree: newIsFree, price: newPrice } : x)),
    );
  }

  async function deleteExam(id, title) {
    if (
      !confirm(
        `Are you sure you want to delete "${title}"?\n\n🛡️ NOTE: Created questions and question bank items will NOT be lost. They remain safely preserved in the global repository.`,
      )
    ) {
      return;
    }
    setUpdatingId(id);
    const r = await fetch(`/api/admin/global-exams?id=${id}`, {
      method: "DELETE",
    });
    setUpdatingId(null);
    if (!r.ok) {
      alert("Failed to delete exam");
      return;
    }
    setExams((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Globe className="h-3.5 w-3.5" />
              State Examination Hub
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Global Examination Hub
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Publish state-level examinations, schedule start/end dates, set automated reminder alerts, and manage pricing.
          </p>
        </div>

        <Link
          href="/exam-builder"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow transition hover:bg-blue-500 active:scale-95 sm:self-center"
        >
          <Plus className="h-4 w-4" />
          <span>Advanced Exam Builder 2.0</span>
        </Link>
      </div>

      {/* Alert Banner */}
      {statusMessage && (
        <div
          className={`flex items-center gap-2 rounded-2xl p-4 text-xs font-semibold sm:text-sm ${
            statusMessage.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
              : statusMessage.type === "error"
              ? "border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
              : "border border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Reschedule Exam Modal */}
      {rescheduleModalExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Reschedule Examination
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleModalExam(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleReschedule} className="mt-4 space-y-4">
              <div className="rounded-2xl bg-blue-50/70 p-3 text-xs text-blue-900 dark:bg-blue-950/50 dark:text-blue-300">
                <strong>Exam:</strong> {rescheduleModalExam.title}
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  New Start Date &amp; Time (नवीन सुरू होण्याची वेळ) *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newStartAt}
                  onChange={(e) => setNewStartAt(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  End Date &amp; Time (पर्यायी समाप्ती वेळ)
                </label>
                <input
                  type="datetime-local"
                  value={newEndAt}
                  onChange={(e) => setNewEndAt(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-[11px] text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                🔔 <strong>Automated Notifications:</strong> Saving will dispatch an immediate
                reschedule notice to all target students and set reminders at <strong>1 hour before</strong>,{" "}
                <strong>10 minutes before</strong>, and <strong>Go-Live</strong>.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleModalExam(null)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduling}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {rescheduling ? "Scheduling & Alerting..." : "Confirm & Reschedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid: Left Create Section + Right List */}
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        {/* Left Form: Fast Create Global Paper */}
        <section className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Create &amp; Schedule Global Exam
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Publish an open paper with automatic unique slug, schedule time, and reminder notifications.
          </p>

          <form onSubmit={create} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Exam Title *
              </label>
              <input
                placeholder="e.g. Maharashtra Police Bharti Mega Mock Test 01"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Exam Category (परीक्षेचा प्रकार) *
              </label>
              <select
                value={form.examType}
                onChange={(e) => setForm({ ...form, examType: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              >
                {MAHARASHTRA_EXAM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Scheduled Start & End Time */}
            <div className="grid gap-3 rounded-2xl border border-blue-100 bg-blue-50/40 p-3 sm:grid-cols-2 dark:border-blue-950 dark:bg-blue-950/20">
              <div>
                <label className="flex items-center gap-1 text-[11px] font-bold text-blue-950 dark:text-blue-300">
                  <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span>Start Date &amp; Time</span>
                </label>
                <input
                  type="datetime-local"
                  value={form.startAt}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      startAt: e.target.value,
                      status: e.target.value ? "SCHEDULED" : form.status,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="flex items-center gap-1 text-[11px] font-bold text-blue-950 dark:text-blue-300">
                  <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span>End Date &amp; Time</span>
                </label>
                <input
                  type="datetime-local"
                  value={form.endAt}
                  onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Free vs Paid Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Pricing / Access Model *
              </label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isFree: true, price: 0 })}
                  className={`rounded-2xl border px-3 py-2.5 text-xs font-bold transition ${
                    form.isFree
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm dark:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                  }`}
                >
                  🟢 100% Free Exam
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isFree: false, price: form.price || 49 })}
                  className={`rounded-2xl border px-3 py-2.5 text-xs font-bold transition ${
                    !form.isFree
                      ? "border-blue-500 bg-blue-50 text-blue-800 shadow-sm dark:border-blue-600 dark:bg-blue-950/60 dark:text-blue-300"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                  }`}
                >
                  💳 Paid Exam
                </button>
              </div>
            </div>

            {!form.isFree && (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Exam Price (INR ₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="mt-1 w-full rounded-2xl border border-blue-300 bg-blue-50/30 px-3.5 py-2.5 text-xs font-bold text-blue-900 outline-none focus:border-blue-600 focus:bg-white dark:border-blue-700 dark:bg-blue-950/30 dark:text-blue-200"
                  placeholder="e.g. 49"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Duration (Mins) *
                </label>
                <input
                  type="number"
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Total Questions *
                </label>
                <input
                  type="number"
                  value={form.totalQuestions}
                  onChange={(e) => setForm({ ...form, totalQuestions: Number(e.target.value) })}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Total Marks
                </label>
                <input
                  type="number"
                  value={form.totalMarks}
                  onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Initial Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                >
                  {EXAM_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Negative Marking */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950">
              <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Negative Marking (नकारात्मक गुण)</span>
                <input
                  type="checkbox"
                  checked={hasNegativeMarking}
                  onChange={(e) => setHasNegativeMarking(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </label>
              {hasNegativeMarking && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Deduct:</span>
                  <input
                    type="number"
                    step="0.05"
                    value={form.negativeMarks}
                    onChange={(e) => setForm({ ...form, negativeMarks: Number(e.target.value) })}
                    className="w-24 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400">marks per wrong MCQ</span>
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={form.sendNotification}
                onChange={(e) => setForm({ ...form, sendNotification: e.target.checked })}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Send notification alerts (Instant, 1hr, 10min, Go-Live)</span>
            </label>

            <button
              type="submit"
              className="mt-2 w-full rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white shadow-glow transition hover:bg-blue-500 active:scale-95"
            >
              Publish &amp; Schedule Examination
            </button>
          </form>
        </section>

        {/* Right List: Manage All Global Exams with Responsive Cards */}
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                All Published Global Papers
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage Live/Draft/Archived status, reschedule dates, and review question papers.
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300 sm:self-center">
              {filteredExams.length} / {exams.length} Exams
            </span>
          </div>

          {/* Search & Category Filter */}
          <div className="grid gap-2.5 sm:grid-cols-3">
            <div className="relative sm:col-span-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              <option value="ALL">All Categories</option>
              {MAHARASHTRA_EXAM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              <option value="ALL">All Statuses</option>
              {EXAM_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          ) : paginatedExams.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-12 text-center text-xs font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-950">
              No examinations match your filter criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedExams.map((x) => (
                <div
                  key={x.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition hover:border-blue-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-700 dark:hover:bg-slate-900 sm:p-5"
                >
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                        {x.examType || "CBT Exam"}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleFreePaid(x)}
                        title="Click to toggle Free/Paid pricing"
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black transition ${
                          x.isFree
                            ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-300"
                            : "bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/80 dark:text-amber-300"
                        }`}
                      >
                        <Tag className="h-3 w-3" />
                        <span>{x.isFree ? "100% Free" : `Paid (₹${x.price})`}</span>
                      </button>
                      {x.startAt && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(x.startAt).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </span>
                      )}
                    </div>

                    <span className="font-mono text-[11px] font-medium text-slate-400">
                      /{x.slug || x.id}
                    </span>
                  </div>

                  {/* Title & Metadata */}
                  <div className="mt-3">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white sm:text-base">
                      {x.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {x.totalQuestions} Questions
                      </span>
                      <span>•</span>
                      <span>{x.durationMinutes} Mins</span>
                      <span>•</span>
                      <span>{x.totalMarks} Marks</span>
                      <span>•</span>
                      <span>
                        {x.negativeMarks > 0
                          ? `-${x.negativeMarks} Negative Marks`
                          : "No Negative Marking"}
                      </span>
                      {x._count && (
                        <>
                          <span>•</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {x._count.attempts || 0} attempts taken
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Responsive Action Bar */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Status:
                      </span>
                      <select
                        disabled={updatingId === x.id}
                        value={x.status}
                        onChange={(e) => updateStatus(x.id, e.target.value)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition outline-none ${
                          x.status === "LIVE"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : x.status === "SCHEDULED"
                            ? "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                            : x.status === "DRAFT"
                            ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            : "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {EXAM_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRescheduleModalExam(x);
                          setNewStartAt(
                            x.startAt ? new Date(x.startAt).toISOString().slice(0, 16) : "",
                          );
                          setNewEndAt(x.endAt ? new Date(x.endAt).toISOString().slice(0, 16) : "");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 active:scale-95 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Reschedule</span>
                      </button>

                      <Link
                        href={`/exam/${x.id}/review`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 active:scale-95 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Review Paper</span>
                      </Link>

                      <Link
                        href={`/exam/${x.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Student View</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => deleteExam(x.id, x.title)}
                        className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100 active:scale-95 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-400"
                        title="Delete exam"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Numbered Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (
                    {filteredExams.length} items)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 disabled:opacity-30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 w-8 rounded-xl text-xs font-bold transition ${
                          currentPage === page
                            ? "bg-blue-600 text-white shadow-sm"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 disabled:opacity-30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
