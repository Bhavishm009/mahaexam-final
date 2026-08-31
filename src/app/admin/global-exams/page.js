"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  Tag,
  Calendar,
  Clock,
  X,
  AlertCircle,
  CheckCircle2,
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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Reschedule Modal State
  const [rescheduleModalExam, setRescheduleModalExam] = useState(null);
  const [newStartAt, setNewStartAt] = useState("");
  const [newEndAt, setNewEndAt] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
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
      return matchSearch && matchCategory;
    });
  }, [exams, searchTerm, categoryFilter]);

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
      ...form,
      title: "",
      slug: "",
      startAt: "",
      endAt: "",
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
      const res = await fetch("/api/admin/global-exams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rescheduleModalExam.id,
          startAt: newStartAt,
          endAt: newEndAt || null,
          status: "SCHEDULED",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(
          `✅ Exam Rescheduled Successfully!\n\n📢 Immediate reschedule notification dispatched to all students, and automatic reminders set for 1hr before, 10min before, and Go-Live!`,
        );
        setRescheduleModalExam(null);
        load();
      } else {
        alert("❌ Error: " + (data.error || "Failed to reschedule"));
      }
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setRescheduling(false);
    }
  }

  async function toggleFreePaid(exam) {
    const nextIsFree = !exam.isFree;
    let newPrice = 0;
    if (!nextIsFree) {
      const p = prompt("Enter price in INR for this paid examination:", exam.price || 49);
      if (p === null) {
        return;
      }
      newPrice = Number(p) || 49;
    }
    setUpdatingId(exam.id);
    const r = await fetch("/api/admin/global-exams", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: exam.id, isFree: nextIsFree, price: newPrice }),
    });
    const d = await r.json();
    setUpdatingId(null);
    if (!r.ok) {
      alert(d.error || "Failed to update pricing");
      return;
    }
    setExams((prev) =>
      prev.map((x) => (x.id === exam.id ? { ...x, isFree: nextIsFree, price: newPrice } : x)),
    );
  }

  async function deleteExam(id, title) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
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
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-600 text-white shadow-glow">
              <Globe className="h-4 w-4" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Global Examination Hub
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Publish state-level examinations, schedule start/end dates, set 1hr & 10min alerts, and
            manage pricing.
          </p>
        </div>

        <Link
          href="/exam-builder"
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Advanced Exam Builder 2.0
        </Link>
      </div>

      {statusMessage && (
        <div
          className={`flex items-center gap-2 rounded-2xl p-4 text-xs font-semibold ${
            statusMessage.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
              : statusMessage.type === "error"
              ? "border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
              : "border border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Reschedule Exam Modal */}
      {rescheduleModalExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
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
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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
                  New Start Date & Time (नवीन सुरू होण्याची वेळ) *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newStartAt}
                  onChange={(e) => setNewStartAt(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  End Date & Time (पर्यायी समाप्ती वेळ)
                </label>
                <input
                  type="datetime-local"
                  value={newEndAt}
                  onChange={(e) => setNewEndAt(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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

      {/* Grid: Create Form + Manage List */}
      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        {/* Left Form: Fast Create Global Paper */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Create & Schedule Global Exam
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Publish an open paper with scheduled start time and automated reminder alerts.
          </p>

          <form onSubmit={create} className="mt-5 space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Exam Title *
              </label>
              <input
                placeholder="e.g. Maharashtra Police Bharti Mega Mock Test 01"
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  const slug = title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)+/g, "");
                  setForm({ ...form, title, slug: form.slug ? form.slug : slug });
                }}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Unique Slug URL *
              </label>
              <input
                placeholder="e.g. police-bharti-mock-01"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 font-mono text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
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
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              >
                {MAHARASHTRA_EXAM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Scheduled Start & End Time */}
            <div className="grid grid-cols-2 gap-2.5 rounded-2xl border border-blue-100 bg-blue-50/40 p-3 dark:border-blue-950 dark:bg-blue-950/20">
              <div>
                <label className="flex items-center gap-1 text-[11px] font-bold text-blue-950 dark:text-blue-300">
                  <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span>Start Date & Time</span>
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
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="flex items-center gap-1 text-[11px] font-bold text-blue-950 dark:text-blue-300">
                  <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span>End Date & Time</span>
                </label>
                <input
                  type="datetime-local"
                  value={form.endAt}
                  onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
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
                  className="mt-1 w-full rounded-2xl border border-blue-300 bg-blue-50/30 px-3.5 py-2.5 text-xs font-bold text-blue-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-blue-700 dark:bg-blue-950/30 dark:text-blue-200"
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
                  onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
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
                  onChange={(e) => setForm({ ...form, totalQuestions: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Total Marks
              </label>
              <input
                type="number"
                value={form.totalMarks}
                onChange={(e) => setForm({ ...form, totalMarks: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            {/* Explicit Negative Marking Toggle */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Negative Marking (नकारात्मक गुणदान)
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {hasNegativeMarking
                      ? "चुकीच्या उत्तरासाठी गुण वजा केले जातील"
                      : "नकारात्मक गुणदान नाही (कोणतीही वजावट नाही)"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHasNegativeMarking(!hasNegativeMarking)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
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

              {hasNegativeMarking && (
                <div className="mt-3">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    Deduction per incorrect answer:
                  </label>
                  <select
                    value={form.negativeMarks}
                    onChange={(e) => setForm({ ...form, negativeMarks: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value={0.25}>0.25 Marks (1/4th - TCS/MPSC Pattern)</option>
                    <option value={0.33}>0.33 Marks (1/3rd Pattern)</option>
                    <option value={0.5}>0.50 Marks (1/2 Mark Pattern)</option>
                    <option value={1.0}>1.00 Mark (Full Mark Deduction)</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Initial Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              >
                {EXAM_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 pt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
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
              Publish & Schedule Examination
            </button>
          </form>
        </section>

        {/* Right List: Manage All Global Exams with Status Controls */}
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                All Published Global Papers
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage Live/Draft/Archived status, reschedule times, and Free/Paid pricing.
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {filteredExams.length} / {exams.length} Exams
            </span>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Search exams by title or slug..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white sm:flex-1"
            />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              <option value="ALL">All Categories</option>
              {MAHARASHTRA_EXAM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-shimmer h-20 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedExams.map((x) => (
                <div
                  key={x.id}
                  className="flex flex-col justify-between gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {x.examType || "CBT Exam"}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleFreePaid(x)}
                        title="Click to toggle Free/Paid pricing"
                        className={`flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition ${
                          x.isFree
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300"
                            : "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-950/80 dark:text-blue-300"
                        }`}
                      >
                        <Tag className="h-3 w-3" />
                        {x.isFree ? "100% Free" : `Paid (₹${x.price})`}
                      </button>
                      {x.startAt && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(x.startAt).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                        </span>
                      )}
                      <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
                        /{x.slug || x.id}
                      </span>
                    </div>

                    <h3 className="mt-2 text-sm font-black text-slate-900 dark:text-white sm:text-base">
                      {x.title}
                    </h3>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>{x.totalQuestions} Questions</span>
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
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {x._count.attempts || 0} attempts taken
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Dropdown & Action Controls */}
                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    <div className="flex items-center gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        Status:
                      </label>
                      <select
                        disabled={updatingId === x.id}
                        value={x.status}
                        onChange={(e) => updateStatus(x.id, e.target.value)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-600 ${
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

                    <button
                      type="button"
                      onClick={() => {
                        setRescheduleModalExam(x);
                        setNewStartAt(
                          x.startAt ? new Date(x.startAt).toISOString().slice(0, 16) : "",
                        );
                        setNewEndAt(x.endAt ? new Date(x.endAt).toISOString().slice(0, 16) : "");
                      }}
                      className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 active:scale-95 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300"
                      title="Reschedule Exam Date & Time"
                    >
                      <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Reschedule</span>
                    </button>

                    <Link
                      href={`/exam/${x.slug || x.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      title="Preview Preflight Page"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Preview</span>
                    </Link>

                    <button
                      onClick={() => deleteExam(x.id, x.title)}
                      disabled={updatingId === x.id}
                      className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-400 dark:hover:bg-rose-900"
                      title="Delete Exam"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {!paginatedExams.length && (
                <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  No global examinations match your criteria.
                </div>
              )}
            </div>
          )}

          {/* Pagination Footer */}
          {filteredExams.length > pageSize && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">
                Page {currentPage} of {Math.ceil(filteredExams.length / pageSize)}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={currentPage >= Math.ceil(filteredExams.length / pageSize)}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
