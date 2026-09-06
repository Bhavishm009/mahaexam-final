"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  Calendar,
  Clock,
  X,
  CheckCircle2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Edit3,
  HelpCircle,
  CheckSquare,
  Square,
  ListPlus,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { MAHARASHTRA_EXAM_TYPES, EXAM_STATUSES } from "@/lib/exam-types";
import ConfirmModal from "@/components/confirm-modal";

export default function GlobalExamsManagementPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

  // Edit Exam Modal State
  const [editModalExam, setEditModalExam] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    examType: "Police Bharti",
    durationMinutes: 90,
    totalQuestions: 25,
    totalMarks: 25,
    negativeMarks: 0.25,
    hasNegativeMarking: true,
    passingScore: 35,
    status: "LIVE",
    isFree: true,
    price: 0,
    startAt: "",
    endAt: "",
    sendNotification: false,
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Questions Selector & Manager Modal State
  const [questionsModalExam, setQuestionsModalExam] = useState(null);
  const [activeQuestionTab, setActiveQuestionTab] = useState("assigned"); // "assigned" | "bank"
  const [examQuestions, setExamQuestions] = useState([]);
  const [loadingExamQuestions, setLoadingExamQuestions] = useState(false);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [loadingBank, setLoadingBank] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [bankDifficulty, setBankDifficulty] = useState("");
  const [selectedBankQuestionIds, setSelectedBankQuestionIds] = useState(new Set());
  const [addingQuestions, setAddingQuestions] = useState(false);
  const [removingQuestionId, setRemovingQuestionId] = useState(null);

  // Create Form State (Notice: sendNotification defaults to false)
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
    sendNotification: false,
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
      const matchCategory = categoryFilter === "ALL" || x.examType === categoryFilter;
      const matchStatus = statusFilter === "ALL" || x.status === statusFilter;
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

    if (!form.title?.trim()) {
      toast.error("Please enter an Exam Title.");
      return;
    }
    if (!form.durationMinutes || Number(form.durationMinutes) <= 0) {
      toast.error("Exam duration must be greater than 0 minutes.");
      return;
    }
    if (!form.totalQuestions || Number(form.totalQuestions) <= 0) {
      toast.error("Total questions count must be at least 1.");
      return;
    }
    if (form.startAt && form.endAt && new Date(form.endAt) <= new Date(form.startAt)) {
      toast.error("End time must be after the Start time.");
      return;
    }

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
      toast.error(d.error || "Failed to create exam");
      return;
    }
    toast.success(
      "Examination created! Click 'Select Questions' to assign questions from the Question Bank.",
    );
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
      sendNotification: false,
    });
    load();
  }

  // Quick status toggle
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
      toast.error(d.error || "Failed to update status");
      return;
    }
    toast.success(`Exam status updated to ${newStatus}`);
    setExams((prev) => prev.map((x) => (x.id === id ? { ...x, status: newStatus } : x)));
  }

  // --- EDIT EXAM FUNCTIONS ---
  function openEditModal(exam) {
    setEditModalExam(exam);
    setEditForm({
      title: exam.title || "",
      description: exam.description || "",
      examType: exam.examType || "Police Bharti",
      durationMinutes: exam.durationMinutes || 90,
      totalQuestions: exam.totalQuestions || 25,
      totalMarks: exam.totalMarks || 25,
      negativeMarks: exam.negativeMarks || 0,
      hasNegativeMarking: Number(exam.negativeMarks || 0) > 0,
      passingScore: exam.passingScore ?? "",
      status: exam.status || "LIVE",
      isFree: exam.isFree !== false,
      price: exam.price || 0,
      startAt: exam.startAt ? new Date(exam.startAt).toISOString().slice(0, 16) : "",
      endAt: exam.endAt ? new Date(exam.endAt).toISOString().slice(0, 16) : "",
      sendNotification: false,
    });
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editModalExam) return;

    if (!editForm.title?.trim()) {
      toast.error("Please enter an Exam Title.");
      return;
    }
    if (
      editForm.startAt &&
      editForm.endAt &&
      new Date(editForm.endAt) <= new Date(editForm.startAt)
    ) {
      toast.error("End time must be after the Start time.");
      return;
    }

    setSavingEdit(true);
    try {
      const payload = {
        id: editModalExam.id,
        title: editForm.title.trim(),
        description: editForm.description ? editForm.description.trim() : null,
        examType: editForm.examType,
        durationMinutes: Number(editForm.durationMinutes),
        totalQuestions: Number(editForm.totalQuestions),
        totalMarks: Number(editForm.totalMarks),
        passingScore: editForm.passingScore === "" ? null : Number(editForm.passingScore),
        negativeMarks: editForm.hasNegativeMarking ? Number(editForm.negativeMarks || 0.25) : 0,
        status: editForm.status,
        isFree: editForm.isFree,
        price: editForm.isFree ? 0 : Number(editForm.price || 0),
        startAt: editForm.startAt || null,
        endAt: editForm.endAt || null,
        sendNotification: editForm.sendNotification,
      };

      const res = await fetch("/api/admin/global-exams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to update exam");
      }

      toast.success("Examination updated successfully!");
      setExams((prev) => prev.map((x) => (x.id === editModalExam.id ? { ...x, ...json.exam } : x)));
      setEditModalExam(null);
    } catch (err) {
      toast.error(err.message || "Failed to save changes");
    } finally {
      setSavingEdit(false);
    }
  }

  // --- QUESTIONS MANAGEMENT FUNCTIONS ---
  const loadExamQuestions = useCallback(async (examId) => {
    setLoadingExamQuestions(true);
    try {
      const res = await fetch(`/api/admin/global-exams/${examId}/questions`);
      const json = await res.json();
      if (res.ok && json.exam?.questions) {
        setExamQuestions(json.exam.questions);
      } else {
        setExamQuestions([]);
      }
    } catch (err) {
      console.error("Failed to load exam questions:", err);
      toast.error("Could not load assigned questions");
    } finally {
      setLoadingExamQuestions(false);
    }
  }, []);

  const loadBankQuestions = useCallback(
    async (searchQuery = bankSearch, diff = bankDifficulty) => {
      setLoadingBank(true);
      try {
        const p = new URLSearchParams();
        if (searchQuery) p.set("search", searchQuery);
        if (diff) p.set("difficulty", diff);
        p.set("limit", "150");

        const res = await fetch(`/api/questions/bank?${p}`);
        const json = await res.json();
        setBankQuestions(json.questions || []);
      } catch (err) {
        console.error("Failed to load bank questions:", err);
      } finally {
        setLoadingBank(false);
      }
    },
    [bankSearch, bankDifficulty],
  );

  function openQuestionsModal(exam) {
    setQuestionsModalExam(exam);
    setActiveQuestionTab("assigned");
    setSelectedBankQuestionIds(new Set());
    setBankSearch("");
    setBankDifficulty("");
    loadExamQuestions(exam.id);
    loadBankQuestions("", "");
  }

  async function handleAddQuestionsToExam() {
    if (!questionsModalExam || selectedBankQuestionIds.size === 0) return;
    setAddingQuestions(true);
    try {
      const questionIds = Array.from(selectedBankQuestionIds);
      const res = await fetch(`/api/admin/global-exams/${questionsModalExam.id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionIds }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to add questions");
      }

      toast.success(json.message || `Added ${questionIds.length} questions!`);
      setSelectedBankQuestionIds(new Set());
      await loadExamQuestions(questionsModalExam.id);
      setActiveQuestionTab("assigned");

      // Update exam list state
      setExams((prev) =>
        prev.map((x) =>
          x.id === questionsModalExam.id
            ? {
                ...x,
                totalQuestions: json.totalQuestions,
                _count: { ...x._count, questions: json.totalQuestions },
              }
            : x,
        ),
      );
    } catch (err) {
      toast.error(err.message || "Failed to add questions");
    } finally {
      setAddingQuestions(false);
    }
  }

  async function handleRemoveQuestionFromExam(questionId) {
    if (!questionsModalExam || !questionId) return;
    setRemovingQuestionId(questionId);
    try {
      const res = await fetch(
        `/api/admin/global-exams/${questionsModalExam.id}/questions?questionId=${questionId}`,
        { method: "DELETE" },
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to remove question");
      }

      toast.success("Question removed from examination.");
      setExamQuestions((prev) => prev.filter((eq) => eq.questionId !== questionId));

      // Update exam list state
      setExams((prev) =>
        prev.map((x) =>
          x.id === questionsModalExam.id
            ? {
                ...x,
                totalQuestions: json.totalQuestions,
                _count: { ...x._count, questions: json.totalQuestions },
              }
            : x,
        ),
      );
    } catch (err) {
      toast.error(err.message || "Failed to remove question");
    } finally {
      setRemovingQuestionId(null);
    }
  }

  // Toggle selection of bank question
  function toggleBankQuestion(qid) {
    setSelectedBankQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(qid)) {
        next.delete(qid);
      } else {
        next.add(qid);
      }
      return next;
    });
  }

  // Existing assigned IDs set for quick lookup
  const assignedQuestionIdsSet = useMemo(() => {
    return new Set(examQuestions.map((eq) => eq.questionId));
  }, [examQuestions]);

  async function handleReschedule(e) {
    e.preventDefault();
    if (!rescheduleModalExam || !newStartAt) {
      toast.error("Please specify a valid start date & time.");
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
          sendNotification: true,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        toast.error(d.error || "Failed to reschedule exam");
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
      toast.success("✅ Examination rescheduled successfully! Target students notified.");
    } catch (err) {
      toast.error("Error: " + err.message);
    } finally {
      setRescheduling(false);
    }
  }

  function deleteExam(id, title) {
    setDeleteTarget({ id, title });
  }

  async function confirmDeleteExam() {
    if (!deleteTarget) return;
    const { id, title } = deleteTarget;
    setIsDeleting(true);
    setUpdatingId(id);
    try {
      const r = await fetch(`/api/admin/global-exams?id=${id}`, {
        method: "DELETE",
      });
      if (!r.ok) {
        toast.error("Failed to delete exam");
        return;
      }
      toast.success(`Exam "${title}" deleted successfully.`);
      setExams((prev) => prev.filter((x) => x.id !== id));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(`Error deleting exam: ${err.message}`);
    } finally {
      setUpdatingId(null);
      setIsDeleting(false);
    }
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
            Publish state-level examinations, pick custom questions from Question Bank, edit papers,
            and manage pricing.
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

      {/* Reschedule Exam Modal */}
      {rescheduleModalExam && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setRescheduleModalExam(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
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
                  New Start Date &amp; Time *
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
                  End Date &amp; Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={newEndAt}
                  onChange={(e) => setNewEndAt(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-[11px] text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                🔔 <strong>Automated Notifications:</strong> Saving will dispatch a notification to
                target students.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleModalExam(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduling}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
                >
                  {rescheduling ? "Updating..." : "Save Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EXAM MODAL */}
      {editModalExam && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditModalExam(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Edit Examination Details
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-400">
                    Update title, duration, marks, pricing, and scheduling
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModalExam(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Exam Title *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Description / Instructions
                </label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Exam guidelines or syllabus notes..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Category / Exam Type *
                  </label>
                  <select
                    value={editForm.examType}
                    onChange={(e) => setEditForm({ ...editForm, examType: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {MAHARASHTRA_EXAM_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Publication Status *
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {EXAM_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Duration (Mins) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editForm.durationMinutes}
                    onChange={(e) =>
                      setEditForm({ ...editForm, durationMinutes: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Total Questions
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.totalQuestions}
                    onChange={(e) =>
                      setEditForm({ ...editForm, totalQuestions: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.totalMarks}
                    onChange={(e) =>
                      setEditForm({ ...editForm, totalMarks: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Passing Score
                  </label>
                  <input
                    type="number"
                    value={editForm.passingScore}
                    onChange={(e) => setEditForm({ ...editForm, passingScore: e.target.value })}
                    placeholder="e.g. 35"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Negative Marking */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/40">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={editForm.hasNegativeMarking}
                    onChange={(e) =>
                      setEditForm({ ...editForm, hasNegativeMarking: e.target.checked })
                    }
                    className="h-4 w-4 rounded text-blue-600"
                  />
                  <span>Enable Negative Marking</span>
                </label>
                {editForm.hasNegativeMarking && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-slate-500">Deduct</span>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      value={editForm.negativeMarks}
                      onChange={(e) =>
                        setEditForm({ ...editForm, negativeMarks: Number(e.target.value) })
                      }
                      className="w-24 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                    <span className="text-xs text-slate-500">marks per wrong answer</span>
                  </div>
                )}
              </div>

              {/* Pricing Model */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Pricing Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, isFree: true, price: 0 })}
                      className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                        editForm.isFree
                          ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                      }`}
                    >
                      Free
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditForm({ ...editForm, isFree: false, price: editForm.price || 49 })
                      }
                      className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                        !editForm.isFree
                          ? "border-blue-500 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                          : "border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                      }`}
                    >
                      Paid
                    </button>
                  </div>
                </div>

                {!editForm.isFree && (
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Price (INR ₹)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                      className="w-full rounded-xl border border-blue-200 bg-blue-50/50 px-3 py-2 text-xs font-bold text-blue-900 outline-none focus:border-blue-600 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200"
                    />
                  </div>
                )}
              </div>

              {/* Schedule Dates */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Start Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editForm.startAt}
                    onChange={(e) => setEditForm({ ...editForm, startAt: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    End Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editForm.endAt}
                    onChange={(e) => setEditForm({ ...editForm, endAt: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Optional Notification Checkbox */}
              <label className="flex items-center gap-2 pt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={editForm.sendNotification}
                  onChange={(e) => setEditForm({ ...editForm, sendNotification: e.target.checked })}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <span>Dispatch notification alert to students on this update (Optional)</span>
              </label>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalExam(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE & SELECT QUESTIONS MODAL */}
      {questionsModalExam && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setQuestionsModalExam(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6"
        >
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-teal-100 text-teal-600 dark:bg-teal-950/80 dark:text-teal-400">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Exam Questions Manager
                    </h3>
                    <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                      {examQuestions.length} Assigned
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {questionsModalExam.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuestionsModalExam(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-100 px-6 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveQuestionTab("assigned")}
                className={`border-b-2 py-3 text-xs font-bold transition ${
                  activeQuestionTab === "assigned"
                    ? "border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                Assigned Questions ({examQuestions.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveQuestionTab("bank")}
                className={`ml-6 border-b-2 py-3 text-xs font-bold transition ${
                  activeQuestionTab === "bank"
                    ? "border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                + Add Questions from Bank{" "}
                {selectedBankQuestionIds.size > 0 && `(${selectedBankQuestionIds.size} Selected)`}
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {activeQuestionTab === "assigned" ? (
                <div>
                  {loadingExamQuestions ? (
                    <div className="py-12 text-center text-xs font-semibold text-slate-400">
                      Loading assigned questions...
                    </div>
                  ) : examQuestions.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center dark:border-slate-800">
                      <HelpCircle className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                      <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                        No Questions Assigned Yet
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        This examination currently has 0 questions. Click below to browse and select
                        questions from the Question Bank.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveQuestionTab("bank")}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-500"
                      >
                        <ListPlus className="h-4 w-4" />
                        <span>Select Questions from Bank</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {examQuestions.map((eq, idx) => {
                        const q = eq.question;
                        if (!q) return null;
                        const isRemoving = removingQuestionId === eq.questionId;

                        return (
                          <div
                            key={eq.id || eq.questionId}
                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/40"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2.5">
                                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-teal-100 font-mono text-xs font-extrabold text-teal-800 dark:bg-teal-950/80 dark:text-teal-300">
                                  #{idx + 1}
                                </span>
                                <div>
                                  <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                                    {q.questionTextMr || q.questionText}
                                  </p>
                                  {q.questionTextMr &&
                                    q.questionText &&
                                    q.questionTextMr !== q.questionText && (
                                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                        {q.questionText}
                                      </p>
                                    )}
                                  <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                      {q.difficulty || "MEDIUM"}
                                    </span>
                                    {q.subject && (
                                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                        {q.subject.nameMr || q.subject.name}
                                      </span>
                                    )}
                                    <span className="text-[10px] font-semibold text-slate-400">
                                      {eq.marks} Mark • {eq.negativeMarks} Neg
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                disabled={isRemoving}
                                onClick={() => handleRemoveQuestionFromExam(eq.questionId)}
                                className="rounded-xl p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50 dark:hover:bg-rose-950/40"
                                title="Remove question from exam"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Options Preview */}
                            {q.options && q.options.length > 0 && (
                              <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                                {q.options.map((opt) => (
                                  <div
                                    key={opt.id}
                                    className={`rounded-xl border px-3 py-1.5 text-[11px] font-medium transition ${
                                      opt.isCorrect
                                        ? "border-emerald-300 bg-emerald-50/70 font-bold text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                        : "border-slate-100 bg-slate-50/60 text-slate-700 dark:border-slate-800/60 dark:bg-slate-900/40 dark:text-slate-300"
                                    }`}
                                  >
                                    <span className="mr-1.5 font-bold">
                                      {String.fromCharCode(65 + (opt.optionOrder - 1))}.
                                    </span>
                                    <span>{opt.optionTextMr || opt.optionText}</span>
                                    {opt.isCorrect && (
                                      <span className="ml-1 text-emerald-600">✓ Correct</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* TAB 2: ADD FROM QUESTION BANK */
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search question bank by keyword..."
                        value={bankSearch}
                        onChange={(e) => setBankSearch(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && loadBankQuestions(bankSearch, bankDifficulty)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-teal-600 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                    <select
                      value={bankDifficulty}
                      onChange={(e) => {
                        setBankDifficulty(e.target.value);
                        loadBankQuestions(bankSearch, e.target.value);
                      }}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-teal-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    >
                      <option value="">All Difficulties</option>
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => loadBankQuestions(bankSearch, bankDifficulty)}
                      className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    >
                      Search
                    </button>
                  </div>

                  {/* Selection Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-teal-50/70 p-3 text-xs dark:bg-teal-950/40">
                    <span className="font-bold text-teal-900 dark:text-teal-200">
                      {selectedBankQuestionIds.size} Question(s) Selected
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const available = bankQuestions
                            .filter((q) => !assignedQuestionIdsSet.has(q.id))
                            .map((q) => q.id);
                          setSelectedBankQuestionIds(new Set(available));
                        }}
                        className="font-bold text-teal-700 hover:underline dark:text-teal-300"
                      >
                        Select All Available (
                        {bankQuestions.filter((q) => !assignedQuestionIdsSet.has(q.id)).length})
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => setSelectedBankQuestionIds(new Set())}
                        className="font-bold text-slate-500 hover:underline dark:text-slate-400"
                      >
                        Clear Selection
                      </button>
                    </div>
                  </div>

                  {/* Questions List */}
                  {loadingBank ? (
                    <div className="py-12 text-center text-xs font-semibold text-slate-400">
                      Searching question repository...
                    </div>
                  ) : bankQuestions.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No questions found matching your criteria.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bankQuestions.map((q) => {
                        const isAlreadyAssigned = assignedQuestionIdsSet.has(q.id);
                        const isSelected = selectedBankQuestionIds.has(q.id);

                        return (
                          <div
                            key={q.id}
                            onClick={() => {
                              if (!isAlreadyAssigned) toggleBankQuestion(q.id);
                            }}
                            className={`rounded-2xl border p-4 transition ${
                              isAlreadyAssigned
                                ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60 dark:border-slate-800 dark:bg-slate-900/40"
                                : isSelected
                                  ? "cursor-pointer border-teal-500 bg-teal-50/40 shadow-sm dark:border-teal-600 dark:bg-teal-950/30"
                                  : "cursor-pointer border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/40"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 shrink-0">
                                {isAlreadyAssigned ? (
                                  <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                    Added
                                  </span>
                                ) : isSelected ? (
                                  <CheckSquare className="h-4 w-4 text-teal-600" />
                                ) : (
                                  <Square className="h-4 w-4 text-slate-300" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-bold text-slate-900 dark:text-white">
                                  {q.questionTextMr || q.questionText}
                                </p>
                                {q.questionTextMr &&
                                  q.questionText &&
                                  q.questionTextMr !== q.questionText && (
                                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                      {q.questionText}
                                    </p>
                                  )}
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    {q.difficulty || "MEDIUM"}
                                  </span>
                                  {q.subject && (
                                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                      {q.subject.nameMr || q.subject.name}
                                    </span>
                                  )}
                                  {isAlreadyAssigned && (
                                    <span className="text-[10px] font-bold text-emerald-600">
                                      ✓ Already in Exam
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 p-4 dark:border-slate-800 sm:p-5">
              <button
                type="button"
                onClick={() => setQuestionsModalExam(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Close
              </button>

              {activeQuestionTab === "bank" && (
                <button
                  type="button"
                  disabled={addingQuestions || selectedBankQuestionIds.size === 0}
                  onClick={handleAddQuestionsToExam}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ListPlus className="h-4 w-4" />
                  <span>
                    {addingQuestions
                      ? "Adding Questions..."
                      : `Add ${selectedBankQuestionIds.size} Question(s) to Exam`}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Create Paper Form & Exam List */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Form: Create Global Paper */}
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:col-span-4">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Create New Global Paper
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Publish a new official examination for Maharashtra students.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-3 text-[11px] text-blue-900 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300">
            💡 <strong>Pick Exact Questions:</strong> Questions are NOT auto-added. Create the
            paper, then click <strong>&ldquo;Select Questions&rdquo;</strong> to pick specific
            questions from the Question Bank.
          </div>

          <form onSubmit={create} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Examination Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Police Bharti 2026 Grand Mock Test"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Exam Category *
              </label>
              <select
                value={form.examType}
                onChange={(e) => setForm({ ...form, examType: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              >
                {MAHARASHTRA_EXAM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
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
                  Target Questions *
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
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="LIVE">Live Immediately</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            </div>

            {/* Schedule Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Start Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={form.startAt}
                  onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  End Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={form.endAt}
                  onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Negative Marking Toggle */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/40">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={hasNegativeMarking}
                  onChange={(e) => setHasNegativeMarking(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <span>Enable Negative Marking</span>
              </label>
              {hasNegativeMarking && (
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Deduct</span>
                  <input
                    type="number"
                    step="0.05"
                    value={form.negativeMarks}
                    onChange={(e) => setForm({ ...form, negativeMarks: Number(e.target.value) })}
                    className="w-24 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    marks per wrong MCQ
                  </span>
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
              <span>Send push notifications to students immediately</span>
            </label>

            <button
              type="submit"
              className="mt-2 w-full rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white shadow-glow transition hover:bg-blue-500 active:scale-95"
            >
              Create Examination
            </button>
          </form>
        </section>

        {/* Right List: Manage All Global Exams with Responsive Cards */}
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:col-span-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                All Published Global Papers
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage questions, edit details, reschedule dates, and review question papers.
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

          {/* List of Global Exams */}
          {loading ? (
            <div className="py-12 text-center text-xs font-semibold text-slate-400">
              Loading examinations...
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="py-12 text-center text-xs font-semibold text-slate-400">
              No examinations found matching the criteria.
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedExams.map((x) => (
                <div
                  key={x.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60"
                >
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        {x.examType}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                          x.isFree
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                        }`}
                      >
                        {x.isFree ? "Free" : `₹${x.price || 49}`}
                      </span>
                      {x.startAt && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          <Clock className="h-3 w-3 text-blue-500" />
                          {new Date(x.startAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">/{x.slug || x.id}</span>
                  </div>

                  {/* Title & Metadata */}
                  <div className="mt-3">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white sm:text-base">
                      {x.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-teal-700 dark:text-teal-300">
                        {x._count?.questions ?? x.totalQuestions} Questions Linked
                      </span>
                      <span>•</span>
                      <span>{x.durationMinutes} Mins</span>
                      <span>•</span>
                      <span>{x.totalMarks} Marks</span>
                      <span>•</span>
                      <span>
                        {x.negativeMarks > 0
                          ? `-${x.negativeMarks} Neg Marks`
                          : "No Negative Marking"}
                      </span>
                      {x._count && (
                        <>
                          <span>•</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {x._count.attempts || 0} attempts
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
                        className={`rounded-xl border px-3 py-1.5 text-xs font-bold outline-none transition ${
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
                      {/* Manage Questions - Dedicated Full-Page Question Editor */}
                      <Link
                        href={`/admin/global-exams/${x.id}/questions`}
                        className="shadow-2xs inline-flex items-center gap-1.5 rounded-xl border border-teal-300 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800 transition hover:bg-teal-100 active:scale-95 dark:border-teal-700 dark:bg-teal-950/60 dark:text-teal-200"
                        title="Open Dedicated Question Paper Editor"
                      >
                        <HelpCircle className="h-3.5 w-3.5 text-teal-600" />
                        <span>Manage Questions ({x._count?.questions ?? x.totalQuestions})</span>
                      </Link>

                      {/* Edit Exam Details Button */}
                      <button
                        type="button"
                        onClick={() => openEditModal(x)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 active:scale-95 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        title="Edit exam details"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Reschedule */}
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

                      {/* Review Paper */}
                      <Link
                        href={`/exam/${x.id}/review`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 active:scale-95 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Review Paper</span>
                      </Link>

                      {/* Student View */}
                      <Link
                        href={`/exam/${x.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Student View</span>
                      </Link>

                      {/* Delete */}
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

      {/* Delete Exam Custom Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Examination"
        description={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        safetyNote="Created questions and question bank items will NOT be lost. They remain safely preserved in the global repository."
        confirmText="Delete Exam"
        isLoading={isDeleting}
        onConfirm={confirmDeleteExam}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
