"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Trash2,
  Plus,
  Search,
  Filter,
  Sparkles,
  AlertCircle,
  Layers,
  FileText,
  RefreshCw,
  SlidersHorizontal,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

export default function ExamQuestionPaperEditor({
  examId,
  backHref = "/admin/global-exams",
  backLabel = "Back to Examinations",
  portalRole = "Admin",
}) {
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [subjectBreakdown, setSubjectBreakdown] = useState({});
  const [allSubjects, setAllSubjects] = useState([]);

  // Question Bank Explorer state
  const [bankLoading, setBankLoading] = useState(false);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState("ALL");
  const [bankSearch, setBankSearch] = useState("");
  const [selectedQIds, setSelectedQIds] = useState(new Set());
  const [addingBatch, setAddingBatch] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [clearingAll, setClearingAll] = useState(false);

  // Left panel search/filter
  const [paperSearch, setPaperSearch] = useState("");
  const [paperSubjectFilter, setPaperSubjectFilter] = useState("ALL");
  const [expandedQuestionIds, setExpandedQuestionIds] = useState(new Set());

  // Load Exam and Assigned Questions
  const loadExamDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/global-exams/${examId}/questions`);
      const data = await res.json();
      if (res.ok && data.success) {
        setExam(data.exam);
        setSubjectBreakdown(data.subjectBreakdown || {});
        if (data.allSubjects && data.allSubjects.length > 0) {
          setAllSubjects(data.allSubjects);
        }
      } else {
        toast.error(data.error || "Failed to load examination details");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while loading examination");
    } finally {
      setLoading(false);
    }
  }, [examId]);

  // Load Question Bank with Filters
  const loadQuestionBank = useCallback(async () => {
    try {
      setBankLoading(true);
      const params = new URLSearchParams();
      if (selectedSubjectId && selectedSubjectId !== "ALL") {
        params.set("subjectId", selectedSubjectId);
      }
      if (selectedDifficulty && selectedDifficulty !== "ALL") {
        params.set("difficulty", selectedDifficulty);
      }
      if (bankSearch.trim()) {
        params.set("search", bankSearch.trim());
      }
      params.set("limit", "150");

      const res = await fetch(`/api/questions/bank?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setBankQuestions(data.questions || []);
        if (data.subjects && data.subjects.length > 0 && allSubjects.length === 0) {
          setAllSubjects(data.subjects);
        }
      } else {
        toast.error(data.error || "Failed to fetch question bank");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load question bank");
    } finally {
      setBankLoading(false);
    }
  }, [selectedSubjectId, selectedDifficulty, bankSearch, allSubjects.length]);

  useEffect(() => {
    loadExamDetails();
  }, [loadExamDetails]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadQuestionBank();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadQuestionBank]);

  // Set of question IDs currently in paper
  const assignedQuestionIdSet = useMemo(() => {
    if (!exam || !exam.questions) return new Set();
    return new Set(exam.questions.map((eq) => eq.questionId));
  }, [exam]);

  // Toggle question selection
  const toggleSelect = (qid) => {
    setSelectedQIds((prev) => {
      const next = new Set(prev);
      if (next.has(qid)) {
        next.delete(qid);
      } else {
        next.add(qid);
      }
      return next;
    });
  };

  // Select all visible and unassigned questions in bank
  const handleSelectAllVisible = () => {
    const unassignedInView = bankQuestions
      .filter((q) => !assignedQuestionIdSet.has(q.id))
      .map((q) => q.id);

    const allSelected = unassignedInView.every((id) => selectedQIds.has(id));

    setSelectedQIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        unassignedInView.forEach((id) => next.delete(id));
      } else {
        unassignedInView.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  // Add questions (single or batch) to exam paper
  const handleAddQuestions = async (qidsToAdd) => {
    if (!qidsToAdd || qidsToAdd.length === 0) return;
    try {
      setAddingBatch(true);
      const res = await fetch(`/api/admin/global-exams/${examId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionIds: qidsToAdd }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || `Added ${qidsToAdd.length} question(s) successfully!`);
        // Remove added questions from selected set
        setSelectedQIds((prev) => {
          const next = new Set(prev);
          qidsToAdd.forEach((id) => next.delete(id));
          return next;
        });
        await loadExamDetails();
      } else {
        toast.error(data.error || "Failed to add questions");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while adding questions");
    } finally {
      setAddingBatch(false);
    }
  };

  // Remove question from exam paper
  const handleRemoveQuestion = async (questionId) => {
    try {
      setRemovingId(questionId);
      const res = await fetch(
        `/api/admin/global-exams/${examId}/questions?questionId=${questionId}`,
        {
          method: "DELETE",
        },
      );
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Question removed from examination paper");
        await loadExamDetails();
      } else {
        toast.error(data.error || "Failed to remove question");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while removing question");
    } finally {
      setRemovingId(null);
    }
  };

  // Clear all questions from exam paper
  const handleClearAll = async () => {
    if (
      !window.confirm(
        "Are you sure you want to remove ALL questions from this examination paper? This cannot be undone.",
      )
    ) {
      return;
    }
    try {
      setClearingAll(true);
      const res = await fetch(`/api/admin/global-exams/${examId}/questions?clearAll=true`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("All questions removed from paper");
        await loadExamDetails();
      } else {
        toast.error(data.error || "Failed to clear questions");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while clearing questions");
    } finally {
      setClearingAll(false);
    }
  };

  // Filter assigned questions on left panel
  const filteredPaperQuestions = useMemo(() => {
    if (!exam || !exam.questions) return [];
    return exam.questions.filter((eq) => {
      const q = eq.question;
      if (!q) return false;
      const matchesSearch =
        !paperSearch.trim() ||
        q.questionText?.toLowerCase().includes(paperSearch.toLowerCase()) ||
        q.questionTextMr?.toLowerCase().includes(paperSearch.toLowerCase());

      const matchesSub =
        paperSubjectFilter === "ALL" ||
        q.subject?.id === paperSubjectFilter ||
        q.subject?.name === paperSubjectFilter;

      return matchesSearch && matchesSub;
    });
  }, [exam, paperSearch, paperSubjectFilter]);

  // Toggle expand options
  const toggleExpand = (id) => {
    setExpandedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center dark:bg-slate-950">
        <RefreshCw className="mb-4 h-10 w-10 animate-spin text-blue-600" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Loading Examination Paper Editor...
        </h2>
        <p className="mt-1 text-sm text-slate-500">Connecting to Question Bank & Subjects...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-950">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <AlertCircle className="mx-auto mb-3 h-12 w-12 text-rose-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Examination Not Found
          </h2>
          <p className="mb-6 mt-2 text-sm text-slate-500">
            The requested examination could not be loaded or you do not have permission to view it.
          </p>
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          >
            <ArrowLeft className="h-4 w-4" /> {backLabel}
          </Link>
        </div>
      </div>
    );
  }

  const assignedCount = exam.questions?.length || 0;
  const targetCount = exam.totalQuestions || 25;
  const progressPercent = Math.min(Math.round((assignedCount / targetCount) * 100), 100);

  return (
    <div className="min-h-screen bg-slate-50 pb-16 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3.5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={backHref}
              className="shadow-xs inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{backLabel}</span>
            </Link>
            <div className="hidden h-4 w-px bg-slate-300 dark:bg-slate-700 sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {portalRole} Question Paper Editor
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {exam.examType || "General"}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                    exam.status === "LIVE"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {exam.status}
                </span>
              </div>
              <h1 className="max-w-xl truncate text-lg font-black text-slate-900 dark:text-white sm:text-xl">
                {exam.title}
              </h1>
            </div>
          </div>

          {/* Quick Metrics Header Stats */}
          <div className="ml-auto flex items-center gap-3 sm:ml-0">
            <div className="hidden text-right md:block">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Total Paper Questions
              </div>
              <div className="text-base font-black text-slate-900 dark:text-white">
                <span
                  className={
                    assignedCount >= targetCount
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-blue-600 dark:text-blue-400"
                  }
                >
                  {assignedCount}
                </span>
                <span className="text-slate-400"> / {targetCount}</span>
              </div>
            </div>
            <div className="hidden h-8 w-px bg-slate-200 dark:bg-slate-800 md:block" />
            <div className="hidden text-right md:block">
              <div className="text-xs text-slate-500 dark:text-slate-400">Duration & Marks</div>
              <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {exam.durationMinutes}m | {exam.totalMarks || assignedCount} Marks
              </div>
            </div>
            <Link
              href={`/exam/${exam.id}/review`}
              target="_blank"
              className="shadow-xs inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Preview Paper</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6">
        {/* Readiness and Subject Breakdown Banner */}
        <div className="shadow-xs mb-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Examination Paper Balance & Readiness
                </h3>
              </div>
              <p className="max-w-2xl text-xs text-slate-500 dark:text-slate-400">
                Select and add questions subject-by-subject from the centralized Question Bank to
                ensure a well-balanced paper. Only your selected questions will appear in student
                exams.
              </p>
            </div>

            {/* Progress Counter Pill */}
            <div className="flex items-center gap-3">
              <div className="h-3 w-48 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    assignedCount === targetCount
                      ? "bg-emerald-500"
                      : assignedCount > targetCount
                        ? "bg-purple-500"
                        : "bg-blue-600"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                {assignedCount} / {targetCount} Qs ({progressPercent}%)
              </span>
            </div>
          </div>

          {/* Subject Pills Distribution in Paper */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            <span className="mr-1 flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Layers className="h-3 w-3" /> Subjects in Paper:
            </span>
            {Object.keys(subjectBreakdown).length === 0 ? (
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                No subjects added yet. Pick questions from the Question Bank below.
              </span>
            ) : (
              Object.entries(subjectBreakdown).map(([name, data]) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300"
                >
                  <span>{name}</span>
                  {data.nameMr && data.nameMr !== name && (
                    <span className="text-[10px] font-normal opacity-75">({data.nameMr})</span>
                  )}
                  <span className="py-0.2 ml-1 rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                    {data.count}
                  </span>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Dual-Pane Workstation Layout */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* ========================================================= */}
          {/* LEFT PANEL: Assigned Questions in Paper (5 cols on lg)     */}
          {/* ========================================================= */}
          <section className="shadow-xs flex flex-col rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
            <div className="border-b border-slate-200 p-4 dark:border-slate-800">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-sm font-black text-slate-900 dark:text-white">
                    Paper Questions
                  </h2>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                    {assignedCount}
                  </span>
                </div>
                {assignedCount > 0 && (
                  <button
                    onClick={handleClearAll}
                    disabled={clearingAll}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline dark:text-rose-400"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              {/* Filter / Search within paper */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={paperSearch}
                    onChange={(e) => setPaperSearch(e.target.value)}
                    placeholder="Search in assigned questions..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                  />
                </div>
                {Object.keys(subjectBreakdown).length > 1 && (
                  <select
                    value={paperSubjectFilter}
                    onChange={(e) => setPaperSubjectFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="ALL">All Subjects</option>
                    {Object.keys(subjectBreakdown).map((subName) => (
                      <option key={subName} value={subName}>
                        {subName} ({subjectBreakdown[subName].count})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* List of Paper Questions */}
            <div className="max-h-[calc(100vh-280px)] space-y-3 divide-y divide-slate-100 overflow-y-auto p-3 dark:divide-slate-800/60">
              {filteredPaperQuestions.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <FileText className="mx-auto mb-2 h-10 w-10 text-slate-300 dark:text-slate-700" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {assignedCount === 0
                      ? "This examination paper has no questions yet."
                      : "No questions match your filter."}
                  </p>
                  <p className="mx-auto mt-1 max-w-xs text-[11px] text-slate-400">
                    {assignedCount === 0
                      ? "Use the Question Bank on the right to browse by subject, preview, and add questions."
                      : "Try clearing your search keyword or subject filter."}
                  </p>
                </div>
              ) : (
                filteredPaperQuestions.map((eq, index) => {
                  const q = eq.question;
                  if (!q) return null;
                  const isExpanded = expandedQuestionIds.has(q.id);
                  const isRemoving = removingId === q.id;

                  return (
                    <div key={eq.id || q.id} className="group pb-1 pt-3 first:pt-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white dark:bg-white dark:text-slate-900">
                            {eq.questionOrder || index + 1}
                          </span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {q.subject?.name || "General"}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                              q.difficulty === "EASY"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : q.difficulty === "HARD"
                                  ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {q.difficulty}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleExpand(q.id)}
                            className="rounded-md p-1 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                            title={isExpanded ? "Collapse options" : "Expand options"}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleRemoveQuestion(q.id)}
                            disabled={isRemoving}
                            className="rounded-md p-1 text-rose-500 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/50"
                            title="Remove from paper"
                          >
                            {isRemoving ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Question Text Preview */}
                      <p className="mt-1.5 line-clamp-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {q.questionText}
                      </p>
                      {q.questionTextMr && q.questionTextMr !== q.questionText && (
                        <p className="mt-0.5 line-clamp-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                          {q.questionTextMr}
                        </p>
                      )}

                      {/* Expanded Options */}
                      {isExpanded && q.options && (
                        <div className="mt-2.5 space-y-1.5 rounded-xl border-t border-slate-100 bg-slate-50 p-2.5 pt-2 dark:border-slate-800 dark:bg-slate-800/40">
                          <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Answer Choices:
                          </span>
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={opt.id || oIdx}
                              className={`flex items-start gap-2 rounded-lg p-1.5 text-xs ${
                                opt.isCorrect
                                  ? "border border-emerald-300 bg-emerald-50 font-semibold text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                                  : "text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              <span className="w-4 text-[11px] font-bold uppercase">
                                {String.fromCharCode(65 + oIdx)}.
                              </span>
                              <span className="flex-1">
                                {opt.optionText}
                                {opt.optionTextMr && opt.optionTextMr !== opt.optionText && (
                                  <span className="block text-[11px] opacity-80">
                                    {opt.optionTextMr}
                                  </span>
                                )}
                              </span>
                              {opt.isCorrect && (
                                <span className="py-0.2 inline-flex items-center gap-1 rounded bg-emerald-600 px-1.5 text-[10px] font-bold text-white">
                                  <Check className="h-2.5 w-2.5" /> Correct
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* ========================================================= */}
          {/* RIGHT PANEL: Question Bank Explorer with Filters (7 cols)  */}
          {/* ========================================================= */}
          <section className="shadow-xs flex flex-col rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
            {/* Header & Filter Controls */}
            <div className="space-y-3.5 border-b border-slate-200 p-4 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-sm font-black text-slate-900 dark:text-white">
                    Question Bank Explorer
                  </h2>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({bankQuestions.length} found)
                  </span>
                </div>

                {/* Bulk Actions Button */}
                {selectedQIds.size > 0 && (
                  <button
                    onClick={() => handleAddQuestions(Array.from(selectedQIds))}
                    disabled={addingBatch}
                    className="shadow-xs inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-500"
                  >
                    {addingBatch ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    <span>Add {selectedQIds.size} Selected to Paper</span>
                  </button>
                )}
              </div>

              {/* 1. Subject-Wise Filter Tabs / Pills */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                    <Filter className="h-3 w-3 text-blue-500" /> Filter by Subject:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {allSubjects.length} subjects available
                  </span>
                </div>
                <div className="scrollbar-thin flex items-center gap-1.5 overflow-x-auto pb-2">
                  <button
                    onClick={() => setSelectedSubjectId("ALL")}
                    className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                      selectedSubjectId === "ALL"
                        ? "shadow-xs bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    All Subjects
                  </button>
                  {allSubjects.map((sub) => {
                    const isSelected = selectedSubjectId === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setSelectedSubjectId(sub.id)}
                        className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                          isSelected
                            ? "shadow-xs bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        }`}
                      >
                        <span>{sub.name}</span>
                        {sub.nameMr && sub.nameMr !== sub.name && (
                          <span className="text-[10px] font-normal opacity-75">({sub.nameMr})</span>
                        )}
                        <span
                          className={`py-0.2 rounded-full px-1.5 text-[10px] font-bold ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {sub.questionCount || 0}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Difficulty Filter & Search Bar */}
              <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-12">
                {/* Search Bar */}
                <div className="relative sm:col-span-7">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    placeholder="Search keywords in English & Marathi..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* Difficulty Pills */}
                <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 sm:col-span-5">
                  {["ALL", "EASY", "MEDIUM", "HARD"].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`flex-1 rounded-lg py-1 text-[11px] font-bold transition-colors ${
                        selectedDifficulty === diff
                          ? diff === "EASY"
                            ? "shadow-xs bg-emerald-600 text-white"
                            : diff === "HARD"
                              ? "shadow-xs bg-rose-600 text-white"
                              : diff === "MEDIUM"
                                ? "shadow-xs bg-amber-600 text-white"
                                : "shadow-xs bg-blue-600 text-white"
                          : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Multi-Select Toolbar */}
              <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                <button
                  onClick={handleSelectAllVisible}
                  className="inline-flex items-center gap-1.5 font-semibold hover:text-blue-600"
                >
                  <CheckSquare className="h-3.5 w-3.5 text-blue-600" />
                  <span>Select / Deselect All Filtered</span>
                </button>
                {selectedQIds.size > 0 && (
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {selectedQIds.size} questions selected
                  </span>
                )}
              </div>
            </div>

            {/* Questions Bank List */}
            <div className="max-h-[calc(100vh-280px)] space-y-3 divide-y divide-slate-100 overflow-y-auto p-3 dark:divide-slate-800/60">
              {bankLoading ? (
                <div className="py-16 text-center">
                  <RefreshCw className="mx-auto mb-2 h-8 w-8 animate-spin text-blue-600" />
                  <p className="text-xs text-slate-500">Filtering questions from Bank...</p>
                </div>
              ) : bankQuestions.length === 0 ? (
                <div className="py-16 text-center">
                  <AlertCircle className="mx-auto mb-2 h-10 w-10 text-slate-300 dark:text-slate-700" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    No questions found matching the selected subject or difficulty.
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Try selecting &quot;All Subjects&quot; or clearing your search term.
                  </p>
                </div>
              ) : (
                bankQuestions.map((q) => {
                  const isAssigned = assignedQuestionIdSet.has(q.id);
                  const isSelected = selectedQIds.has(q.id);

                  return (
                    <div
                      key={q.id}
                      className={`rounded-xl p-2.5 pb-1 pt-3 transition-all first:pt-0 ${
                        isAssigned
                          ? "bg-slate-50/70 opacity-70 dark:bg-slate-800/30"
                          : isSelected
                            ? "border border-blue-200 bg-blue-50/60 dark:border-blue-900 dark:bg-blue-950/40"
                            : "hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-1 items-start gap-2.5">
                          {/* Checkbox */}
                          <button
                            type="button"
                            disabled={isAssigned}
                            onClick={() => toggleSelect(q.id)}
                            className="mt-0.5 text-slate-400 hover:text-blue-600 disabled:opacity-40"
                          >
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </button>

                          <div className="flex-1">
                            {/* Badges */}
                            <div className="mb-1 flex items-center gap-2">
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {q.subject?.name || "General"}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                                  q.difficulty === "EASY"
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                    : q.difficulty === "HARD"
                                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                }`}
                              >
                                {q.difficulty}
                              </span>
                              {isAssigned && (
                                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                                  <CheckCircle2 className="h-3 w-3" /> In Paper
                                </span>
                              )}
                            </div>

                            {/* Question Text */}
                            <p className="text-xs font-semibold leading-relaxed text-slate-900 dark:text-white">
                              {q.questionText}
                            </p>
                            {q.questionTextMr && q.questionTextMr !== q.questionText && (
                              <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-400">
                                {q.questionTextMr}
                              </p>
                            )}

                            {/* Options Preview */}
                            {q.options && q.options.length > 0 && (
                              <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                                {q.options.map((opt, oIdx) => (
                                  <div
                                    key={opt.id || oIdx}
                                    className={`flex items-center gap-1.5 rounded-md border p-1.5 text-[11px] ${
                                      opt.isCorrect
                                        ? "border-emerald-300 bg-emerald-50 font-semibold text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                                        : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400"
                                    }`}
                                  >
                                    <span className="text-[10px] font-bold">
                                      {String.fromCharCode(65 + oIdx)}.
                                    </span>
                                    <span className="flex-1 truncate">
                                      {opt.optionText}
                                      {opt.optionTextMr && opt.optionTextMr !== opt.optionText && (
                                        <span className="ml-1 opacity-75">
                                          ({opt.optionTextMr})
                                        </span>
                                      )}
                                    </span>
                                    {opt.isCorrect && (
                                      <Check className="h-2.5 w-2.5 flex-shrink-0 text-emerald-600" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Single Instant Add Button */}
                        <div className="flex-shrink-0">
                          {isAssigned ? (
                            <span className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-400 dark:bg-slate-800">
                              <Check className="h-3 w-3" /> Added
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAddQuestions([q.id])}
                              disabled={addingBatch}
                              className="shadow-2xs inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-600 transition-all hover:bg-blue-600 hover:text-white dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Add</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
