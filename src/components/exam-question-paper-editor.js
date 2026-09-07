"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Trash2,
  Plus,
  Search,
  RefreshCw,
  SlidersHorizontal,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function ExamQuestionPaperEditor({
  examId,
  backHref = "/admin/global-exams",
  backLabel = "Back to Exams",
  portalRole = "Admin",
}) {
  const [initialLoading, setInitialLoading] = useState(true);
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
  const [hideAssignedInBank, setHideAssignedInBank] = useState(false);
  const [optimisticAssignedIds, setOptimisticAssignedIds] = useState(new Set());

  // In-flight action trackers (NO FULL-PAGE FLASH)
  const [addingIds, setAddingIds] = useState(new Set());
  const [addingBatch, setAddingBatch] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [clearingAll, setClearingAll] = useState(false);

  // Left panel search/filter, sorting and scroll tracking
  const paperScrollRef = useRef(null);
  const [paperSearch, setPaperSearch] = useState("");
  const [paperSubjectFilter, setPaperSubjectFilter] = useState("ALL");
  const [paperSortOrder, setPaperSortOrder] = useState("newest"); // "newest" | "order"
  const [recentlyAddedIds, setRecentlyAddedIds] = useState(new Set());
  const [expandedQuestionIds, setExpandedQuestionIds] = useState(new Set());

  // Load Exam and Assigned Questions (Silent background refresh after initial)
  const loadExamDetails = useCallback(
    async (isInitial = false) => {
      try {
        if (isInitial) setInitialLoading(true);
        const res = await fetch(`/api/admin/global-exams/${examId}/questions`);
        const data = await res.json();
        if (res.ok && data.success) {
          setExam(data.exam);
          setSubjectBreakdown(data.subjectBreakdown || {});
          if (data.allSubjects && data.allSubjects.length > 0) {
            setAllSubjects(data.allSubjects);
          }
        } else if (isInitial) {
          toast.error(data.error || "Failed to load examination");
        }
      } catch (err) {
        console.error(err);
        if (isInitial) toast.error("Network error while loading examination");
      } finally {
        if (isInitial) setInitialLoading(false);
      }
    },
    [examId],
  );

  // Load Question Bank with Filters (Silent in-place update)
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBankLoading(false);
    }
  }, [selectedSubjectId, selectedDifficulty, bankSearch, allSubjects.length]);

  useEffect(() => {
    loadExamDetails(true);
  }, [loadExamDetails]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadQuestionBank();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadQuestionBank]);

  // Set of question IDs currently in paper (robust check on all possible ID fields)
  const assignedQuestionIdSet = useMemo(() => {
    const set = new Set(optimisticAssignedIds);
    if (exam && exam.questions) {
      for (const eq of exam.questions) {
        if (eq.questionId) set.add(eq.questionId);
        if (eq.question?.id) set.add(eq.question.id);
        if (eq.id && !eq.questionId && !eq.question) set.add(eq.id);
      }
    }
    return set;
  }, [exam, optimisticAssignedIds]);

  // Toggle single question checkbox in bank
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

  // Select all visible unassigned questions in bank
  const handleSelectAllVisible = () => {
    const unassignedInView = sortedBankQuestions
      .filter((q) => !assignedQuestionIdSet.has(q.id))
      .map((q) => q.id);

    const allSelected =
      unassignedInView.length > 0 && unassignedInView.every((id) => selectedQIds.has(id));

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

  // Add questions (batch or single) — NO PAGE RELOAD, IN-PLACE INSTANT UPDATE
  const handleAddQuestions = async (qidsToAdd) => {
    if (!qidsToAdd || qidsToAdd.length === 0) return;

    // Instantly mark as assigned optimistically so question drops to bottom immediately
    setOptimisticAssignedIds((prev) => {
      const next = new Set(prev);
      qidsToAdd.forEach((id) => next.add(id));
      return next;
    });

    // Track which IDs are being added so their buttons show spinners without touching page
    setAddingIds((prev) => {
      const next = new Set(prev);
      qidsToAdd.forEach((id) => next.add(id));
      return next;
    });
    if (qidsToAdd.length > 1) setAddingBatch(true);

    try {
      const res = await fetch(`/api/admin/global-exams/${examId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionIds: qidsToAdd }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || `Added ${qidsToAdd.length} question(s) to paper!`);

        // Record recently added questions so they are pinned on top and highlighted
        setRecentlyAddedIds((prev) => {
          const next = new Set(prev);
          qidsToAdd.forEach((id) => next.add(id));
          return next;
        });

        // Auto-scroll left exam paper pane to top smoothly
        setTimeout(() => {
          if (paperScrollRef.current) {
            paperScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
          }
        }, 60);

        // If API returned updated questions, update state directly in-place
        if (data.questions) {
          setExam((prev) => ({
            ...prev,
            questions: data.questions,
            totalQuestions: data.totalQuestions,
            totalMarks: data.totalQuestions,
          }));
          if (data.subjectBreakdown) {
            setSubjectBreakdown(data.subjectBreakdown);
          }
        } else {
          // Fallback silent re-fetch without loading spinner
          await loadExamDetails(false);
        }

        // Remove from selected set
        setSelectedQIds((prev) => {
          const next = new Set(prev);
          qidsToAdd.forEach((id) => next.delete(id));
          return next;
        });
      } else {
        // Revert optimistic addition if failed
        setOptimisticAssignedIds((prev) => {
          const next = new Set(prev);
          qidsToAdd.forEach((id) => next.delete(id));
          return next;
        });
        toast.error(data.error || "Failed to add questions");
      }
    } catch (err) {
      console.error(err);
      setOptimisticAssignedIds((prev) => {
        const next = new Set(prev);
        qidsToAdd.forEach((id) => next.delete(id));
        return next;
      });
      toast.error("Network error while adding questions");
    } finally {
      setAddingIds((prev) => {
        const next = new Set(prev);
        qidsToAdd.forEach((id) => next.delete(id));
        return next;
      });
      setAddingBatch(false);
    }
  };

  // Remove question — IN-PLACE INSTANT UPDATE
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
        toast.success("Question removed from paper");
        setRecentlyAddedIds((prev) => {
          const next = new Set(prev);
          next.delete(questionId);
          return next;
        });
        setOptimisticAssignedIds((prev) => {
          const next = new Set(prev);
          next.delete(questionId);
          return next;
        });

        if (data.questions) {
          setExam((prev) => ({
            ...prev,
            questions: data.questions,
            totalQuestions: data.totalQuestions,
            totalMarks: data.totalQuestions,
          }));
          if (data.subjectBreakdown) {
            setSubjectBreakdown(data.subjectBreakdown);
          }
        } else {
          await loadExamDetails(false);
        }
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

  // Clear all questions — IN-PLACE INSTANT UPDATE
  const handleClearAll = async () => {
    if (!window.confirm("Remove ALL questions from this paper?")) return;
    try {
      setClearingAll(true);
      const res = await fetch(`/api/admin/global-exams/${examId}/questions?clearAll=true`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("All questions removed from paper");
        setRecentlyAddedIds(new Set());
        setOptimisticAssignedIds(new Set());
        setExam((prev) => ({
          ...prev,
          questions: [],
          totalQuestions: 0,
          totalMarks: 0,
        }));
        setSubjectBreakdown({});
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

  // Filter and sort assigned questions on left panel (Newest on top or Natural 1..N order)
  const filteredPaperQuestions = useMemo(() => {
    if (!exam || !exam.questions) return [];
    const list = exam.questions.filter((eq) => {
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

    if (paperSortOrder === "newest") {
      // Put recently added questions on top first, then highest questionOrder down to lowest
      return [...list].sort((a, b) => {
        const aId = a.questionId || a.question?.id;
        const bId = b.questionId || b.question?.id;
        const aRecent = recentlyAddedIds.has(aId);
        const bRecent = recentlyAddedIds.has(bId);
        if (aRecent !== bRecent) return aRecent ? -1 : 1;
        return (b.questionOrder || 0) - (a.questionOrder || 0);
      });
    }

    // Natural paper order (#1 to #N)
    return [...list].sort((a, b) => (a.questionOrder || 0) - (b.questionOrder || 0));
  }, [exam, paperSearch, paperSubjectFilter, paperSortOrder, recentlyAddedIds]);

  // Partition Question Bank into unassigned (available) on top, and assigned (used) at bottom
  const sortedBankQuestions = useMemo(() => {
    const unassigned = [];
    const assigned = [];

    for (const q of bankQuestions) {
      if (assignedQuestionIdSet.has(q.id)) {
        assigned.push(q);
      } else {
        unassigned.push(q);
      }
    }

    if (hideAssignedInBank) {
      return unassigned;
    }

    // Available unassigned questions strictly on top, already-used questions strictly at the bottom
    return [...unassigned, ...assigned];
  }, [bankQuestions, assignedQuestionIdSet, hideAssignedInBank]);

  const availableBankCount = useMemo(() => {
    return bankQuestions.filter((q) => !assignedQuestionIdSet.has(q.id)).length;
  }, [bankQuestions, assignedQuestionIdSet]);

  const assignedInBankCount = bankQuestions.length - availableBankCount;

  // Toggle expand choices
  const toggleExpand = (id) => {
    setExpandedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Only show full-screen loader on initial mount
  if (initialLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center dark:bg-slate-950">
        <RefreshCw className="mb-3 h-8 w-8 animate-spin text-blue-600" />
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
          Loading Question Paper Editor...
        </h2>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
          <AlertCircle className="mx-auto mb-2 h-10 w-10 text-rose-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Exam Not Found</h2>
          <Link
            href={backHref}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {backLabel}
          </Link>
        </div>
      </div>
    );
  }

  const assignedCount = exam.questions?.length || 0;
  const targetCount = exam.totalQuestions || 25;
  const progressPercent = Math.min(Math.round((assignedCount / targetCount) * 100), 100);

  return (
    <div className="flex min-h-screen flex-col bg-slate-100/70 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* 1. Ultra-Compact Sleek Header Bar */}
      <header className="shadow-2xs sticky top-0 z-30 border-b border-slate-200 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900 sm:px-5">
        <div className="mx-auto flex max-w-[1750px] flex-wrap items-center justify-between gap-3">
          {/* Left: Back + Title + Meta */}
          <div className="flex min-w-0 items-center gap-2.5">
            <Link
              href={backHref}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{backLabel}</span>
            </Link>

            <div className="h-4 w-px shrink-0 bg-slate-200 dark:bg-slate-800" />

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {portalRole} Paper Editor
                </span>
                <span className="py-0.2 rounded bg-slate-100 px-1.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {exam.examType || "Exam"}
                </span>
                <span
                  className={`py-0.2 rounded px-1.5 text-[10px] font-black uppercase ${
                    exam.status === "LIVE"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {exam.status}
                </span>
              </div>
              <h1 className="max-w-xl truncate text-sm font-black leading-tight text-slate-900 dark:text-white sm:text-base">
                {exam.title}
              </h1>
            </div>
          </div>

          {/* Right: Metrics & Actions */}
          <div className="flex shrink-0 items-center gap-3">
            {/* Target Progress Chip */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800/80">
              <div className="text-right">
                <div className="text-[10px] font-semibold leading-none text-slate-500 dark:text-slate-400">
                  Questions
                </div>
                <div className="text-xs font-black text-slate-900 dark:text-white">
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

              <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 sm:w-24">
                <div
                  className={`h-full transition-all duration-300 ${
                    assignedCount >= targetCount ? "bg-emerald-500" : "bg-blue-600"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Duration / Marks */}
            <div className="hidden text-right text-xs md:block">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Duration & Marks</div>
              <div className="font-bold text-slate-800 dark:text-slate-200">
                {exam.durationMinutes}m • {exam.totalMarks || assignedCount} Marks
              </div>
            </div>

            <Link
              href={`/exam/${exam.id}/review`}
              target="_blank"
              className="shadow-2xs inline-flex shrink-0 items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            >
              <FileText className="h-3 w-3" />
              <span>Preview</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Link>
          </div>
        </div>

        {/* Compact Subject Balance Ribbon */}
        {Object.keys(subjectBreakdown).length > 0 && (
          <div className="scrollbar-none mx-auto mt-2 flex max-w-[1750px] items-center gap-1.5 overflow-x-auto border-t border-slate-100 pb-0.5 pt-2 text-xs dark:border-slate-800/80">
            <span className="mr-1 shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Paper Breakdown:
            </span>
            {Object.entries(subjectBreakdown).map(([name, data]) => (
              <span
                key={name}
                className="inline-flex shrink-0 items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <span>{name}</span>
                <span className="py-0.2 ml-0.5 rounded bg-blue-600 px-1 text-[10px] font-black text-white">
                  {data.count}
                </span>
              </span>
            ))}
          </div>
        )}
      </header>

      {/* 2. Full-Screen Workspace Grid (Maximized Usable Height) */}
      <main className="mx-auto grid min-h-0 w-full max-w-[1750px] flex-1 grid-cols-1 gap-3 px-2 py-3 sm:px-4 xl:grid-cols-12">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Current Exam Paper (5 Cols on xl, Full Height Scroll)       */}
        {/* ========================================================================= */}
        <section className="shadow-2xs flex h-[calc(100vh-128px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 xl:col-span-5">
          {/* Top Panel Bar */}
          <div className="shrink-0 space-y-2 border-b border-slate-200 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900 dark:text-white sm:text-sm">
                  Exam Paper
                </span>
                <span className="py-0.2 rounded-full bg-blue-100 px-2 text-xs font-black text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                  {assignedCount} Qs
                </span>
              </div>

              {/* Sort Order Selector: Newest on Top vs Order 1..N */}
              <div className="flex items-center gap-0.5 rounded-lg bg-slate-200/80 p-0.5 text-[10px] dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setPaperSortOrder("newest")}
                  className={`rounded-md px-2 py-0.5 font-bold transition ${
                    paperSortOrder === "newest"
                      ? "shadow-2xs bg-white text-blue-600 dark:bg-slate-900 dark:text-blue-400"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                  title="Newly added questions appear on top"
                >
                  Newest on Top
                </button>
                <button
                  type="button"
                  onClick={() => setPaperSortOrder("order")}
                  className={`rounded-md px-2 py-0.5 font-bold transition ${
                    paperSortOrder === "order"
                      ? "shadow-2xs bg-white text-blue-600 dark:bg-slate-900 dark:text-blue-400"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                  title="Questions ordered 1 to N"
                >
                  Order 1..N
                </button>
              </div>

              {assignedCount > 0 && (
                <button
                  onClick={handleClearAll}
                  disabled={clearingAll}
                  className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline dark:text-rose-400"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* Search & Subject Filter inside Paper */}
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2 h-3 w-3 text-slate-400" />
                <input
                  type="text"
                  value={paperSearch}
                  onChange={(e) => setPaperSearch(e.target.value)}
                  placeholder="Filter in paper..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-1 pl-7 pr-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              {Object.keys(subjectBreakdown).length > 1 && (
                <select
                  value={paperSubjectFilter}
                  onChange={(e) => setPaperSubjectFilter(e.target.value)}
                  className="max-w-[140px] rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
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

          {/* Paper Questions Scrollable Area */}
          <div ref={paperScrollRef} className="flex-1 space-y-2 divide-y-0 overflow-y-auto p-2.5">
            {filteredPaperQuestions.length === 0 ? (
              <div className="px-4 py-20 text-center">
                <FileText className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-700" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {assignedCount === 0
                    ? "No questions in this paper yet"
                    : "No questions match filter"}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  {assignedCount === 0
                    ? "Select questions from the right to add"
                    : "Clear search term"}
                </p>
              </div>
            ) : (
              filteredPaperQuestions.map((eq, index) => {
                const q = eq.question;
                if (!q) return null;
                const isExpanded = expandedQuestionIds.has(q.id);
                const isRemoving = removingId === q.id;
                const isRecentlyAdded = recentlyAddedIds.has(q.id);

                return (
                  <div
                    key={eq.id || q.id}
                    className={`rounded-xl border p-2.5 transition ${
                      isRecentlyAdded
                        ? "shadow-xs border-emerald-300 bg-emerald-50/20 dark:border-emerald-800/80 dark:bg-emerald-950/20"
                        : "shadow-2xs border-slate-200/80 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/90"
                    }`}
                  >
                    {/* Top line of card */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white dark:bg-white dark:text-slate-900">
                          {eq.questionOrder || index + 1}
                        </span>
                        {isRecentlyAdded && (
                          <span className="py-0.2 inline-flex items-center gap-0.5 rounded border border-emerald-300 bg-emerald-100 px-1.5 text-[9px] font-black uppercase text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                            <Sparkles className="h-2.5 w-2.5" /> Newly Added
                          </span>
                        )}
                        <span className="py-0.2 max-w-[150px] truncate rounded bg-slate-100 px-1.5 text-[10px] font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {q.subject?.name || "General"}
                        </span>
                        <span
                          className={`py-0.2 rounded px-1 text-[9px] font-black uppercase ${
                            q.difficulty === "EASY"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : q.difficulty === "HARD"
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {q.difficulty}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">1 Mark</span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex shrink-0 items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => toggleExpand(q.id)}
                          className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          title={isExpanded ? "Collapse choices" : "View choices"}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(q.id)}
                          disabled={isRemoving}
                          className="rounded p-1 text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-950/50"
                          title="Remove question"
                        >
                          {isRemoving ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Question Text */}
                    <p className="mt-1.5 line-clamp-2 text-xs font-semibold text-slate-900 dark:text-white">
                      {q.questionText}
                    </p>
                    {q.questionTextMr && q.questionTextMr !== q.questionText && (
                      <p className="mt-0.5 line-clamp-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                        {q.questionTextMr}
                      </p>
                    )}

                    {/* Expand Choices */}
                    {isExpanded && q.options && (
                      <div className="mt-2 space-y-1 rounded-lg border-t border-slate-100 bg-slate-50 p-2 pt-2 text-xs dark:border-slate-800/80 dark:bg-slate-800/40">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={opt.id || oIdx}
                            className={`flex items-start gap-1.5 rounded p-1 ${
                              opt.isCorrect
                                ? "border border-emerald-200 bg-emerald-50 font-bold text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
                                : "text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            <span className="w-3.5 text-[10px] font-black uppercase">
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            <span className="flex-1">
                              {opt.optionText}
                              {opt.optionTextMr && opt.optionTextMr !== opt.optionText && (
                                <span className="block text-[10px] opacity-75">
                                  {opt.optionTextMr}
                                </span>
                              )}
                            </span>
                            {opt.isCorrect && (
                              <span className="py-0.2 flex items-center gap-0.5 rounded bg-emerald-600 px-1 text-[9px] font-black text-white">
                                <Check className="h-2 w-2" /> Correct
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

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Question Bank Explorer (7 Cols on xl, Full Height Scroll)   */}
        {/* ========================================================================= */}
        <section className="shadow-2xs flex h-[calc(100vh-128px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 xl:col-span-7">
          {/* Header & Filter Controls Bar */}
          <div className="shrink-0 space-y-2 border-b border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
            {/* Subject Filter Pills (Horizontal Scroll) */}
            <div className="scrollbar-none flex items-center gap-1 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedSubjectId("ALL")}
                className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  selectedSubjectId === "ALL"
                    ? "shadow-xs bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                All Subjects
              </button>
              {allSubjects.map((sub) => {
                const isSelected = selectedSubjectId === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      isSelected
                        ? "shadow-xs bg-blue-600 text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <span>{sub.name}</span>
                    <span
                      className={`py-0.2 rounded px-1 text-[9px] font-black ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-700"
                      }`}
                    >
                      {sub.questionCount || 0}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search + Difficulty + Batch Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              {/* Search Bar */}
              <div className="relative min-w-[180px] flex-1">
                <Search className="absolute left-2.5 top-2 h-3 w-3 text-slate-400" />
                <input
                  type="text"
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  placeholder="Search questions in English & Marathi..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-1 pl-7 pr-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Difficulty Pills */}
              <div className="flex items-center gap-0.5 rounded-lg bg-slate-200/80 p-0.5 dark:bg-slate-800">
                {["ALL", "EASY", "MEDIUM", "HARD"].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition ${
                      selectedDifficulty === diff
                        ? diff === "EASY"
                          ? "bg-emerald-600 text-white"
                          : diff === "HARD"
                            ? "bg-rose-600 text-white"
                            : diff === "MEDIUM"
                              ? "bg-amber-600 text-white"
                              : "bg-blue-600 text-white"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              {/* Add Selected Button */}
              {selectedQIds.size > 0 && (
                <button
                  type="button"
                  onClick={() => handleAddQuestions(Array.from(selectedQIds))}
                  disabled={addingBatch}
                  className="shadow-xs inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white transition hover:bg-blue-500"
                >
                  {addingBatch ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <Plus className="h-3 w-3" />
                  )}
                  <span>Add {selectedQIds.size} Selected</span>
                </button>
              )}
            </div>

            {/* Select All Toggle Bar + Segmented Filter Pill */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-[11px] text-slate-500">
              <button
                type="button"
                onClick={handleSelectAllVisible}
                disabled={availableBankCount === 0}
                className="inline-flex items-center gap-1 font-semibold hover:text-blue-600 disabled:opacity-40"
              >
                <CheckSquare className="h-3 w-3 text-blue-600" />
                <span>Select Unadded ({availableBankCount})</span>
              </button>

              <div className="ml-auto flex items-center gap-0.5 rounded-lg bg-slate-200/80 p-0.5 text-[10px] dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setHideAssignedInBank(true)}
                  className={`rounded-md px-2 py-0.5 font-bold transition ${
                    hideAssignedInBank
                      ? "shadow-2xs bg-white text-blue-600 dark:bg-slate-900 dark:text-blue-400"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                  title="Show only unadded questions"
                >
                  Unadded Only ({availableBankCount})
                </button>
                <button
                  type="button"
                  onClick={() => setHideAssignedInBank(false)}
                  className={`rounded-md px-2 py-0.5 font-bold transition ${
                    !hideAssignedInBank
                      ? "shadow-2xs bg-white text-blue-600 dark:bg-slate-900 dark:text-blue-400"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                  title="Show all questions with added questions at the bottom"
                >
                  All (Used at Bottom)
                </button>
              </div>

              {selectedQIds.size > 0 && (
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {selectedQIds.size} selected
                </span>
              )}
            </div>
          </div>

          {/* Question Bank Scrollable List */}
          <div className="flex-1 space-y-2 overflow-y-auto p-2.5">
            {bankLoading ? (
              <div className="py-24 text-center">
                <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin text-blue-600" />
                <p className="text-xs text-slate-500">Loading questions from bank...</p>
              </div>
            ) : sortedBankQuestions.length === 0 ? (
              <div className="py-24 text-center">
                <AlertCircle className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-700" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {hideAssignedInBank && bankQuestions.length > 0
                    ? "All questions in this view are already added to paper"
                    : "No questions found"}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {hideAssignedInBank && bankQuestions.length > 0
                    ? "Uncheck 'Hide Added in Paper' to see all questions"
                    : 'Try selecting "All Subjects" or clearing your search term'}
                </p>
              </div>
            ) : (
              sortedBankQuestions.map((q, idx) => {
                const isAssigned = assignedQuestionIdSet.has(q.id);
                const isSelected = selectedQIds.has(q.id);
                const isAddingThis = addingIds.has(q.id);
                const isFirstAssigned =
                  !hideAssignedInBank &&
                  isAssigned &&
                  (idx === 0 || !assignedQuestionIdSet.has(sortedBankQuestions[idx - 1]?.id));

                return (
                  <div key={q.id}>
                    {/* Visual Section Divider: Separates available questions from already-added questions */}
                    {isFirstAssigned && (
                      <div className="my-1 flex items-center gap-2 py-2.5">
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                        <span className="rounded-full border border-slate-200/60 bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-700 dark:bg-slate-800">
                          Already Added to Paper ({assignedInBankCount}) ↓
                        </span>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                      </div>
                    )}
                    <div
                      className={`rounded-xl border p-2.5 transition ${
                        isAssigned
                          ? "border-slate-200/60 bg-slate-50/70 opacity-75 dark:border-slate-800 dark:bg-slate-800/30"
                          : isSelected
                            ? "border-blue-300 bg-blue-50/70 dark:border-blue-800 dark:bg-blue-950/40"
                            : "border-slate-200/80 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        {/* Left: Checkbox + Content */}
                        <div className="flex min-w-0 flex-1 items-start gap-2">
                          <button
                            type="button"
                            disabled={isAssigned}
                            onClick={() => toggleSelect(q.id)}
                            className="mt-0.5 shrink-0 text-slate-400 hover:text-blue-600 disabled:opacity-30"
                          >
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            {/* Badges */}
                            <div className="mb-1 flex flex-wrap items-center gap-1.5">
                              <span className="py-0.2 max-w-[140px] truncate rounded bg-slate-100 px-1.5 text-[10px] font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {q.subject?.name || "General"}
                              </span>
                              <span
                                className={`py-0.2 rounded px-1 text-[9px] font-black uppercase ${
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
                                <span className="py-0.2 inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 text-[9px] font-black uppercase text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                  <CheckCircle2 className="h-2.5 w-2.5" /> In Paper
                                </span>
                              )}
                            </div>

                            {/* Question Text */}
                            <p className="text-xs font-semibold leading-snug text-slate-900 dark:text-white">
                              {q.questionText}
                            </p>
                            {q.questionTextMr && q.questionTextMr !== q.questionText && (
                              <p className="mt-0.5 text-xs font-medium leading-snug text-slate-600 dark:text-slate-400">
                                {q.questionTextMr}
                              </p>
                            )}

                            {/* Options Inline 2x2 Preview */}
                            {q.options && q.options.length > 0 && (
                              <div className="mt-1.5 grid grid-cols-1 gap-1 sm:grid-cols-2">
                                {q.options.map((opt, oIdx) => (
                                  <div
                                    key={opt.id || oIdx}
                                    className={`flex items-center gap-1 rounded border p-1 text-[10px] ${
                                      opt.isCorrect
                                        ? "border-emerald-300 bg-emerald-50 font-bold text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                                        : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400"
                                    }`}
                                  >
                                    <span className="text-[9px] font-black">
                                      {String.fromCharCode(65 + oIdx)}.
                                    </span>
                                    <span className="flex-1 truncate">{opt.optionText}</span>
                                    {opt.isCorrect && (
                                      <Check className="h-2.5 w-2.5 shrink-0 text-emerald-600" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Instant Add Button */}
                        <div className="shrink-0">
                          {isAssigned ? (
                            <span className="flex items-center gap-0.5 rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-400 dark:bg-slate-800">
                              <Check className="h-3 w-3" /> Added
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAddQuestions([q.id])}
                              disabled={isAddingThis || addingBatch}
                              className="shadow-2xs inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600 transition hover:bg-blue-600 hover:text-white active:scale-95 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white"
                            >
                              {isAddingThis ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <Plus className="h-3 w-3" />
                              )}
                              <span>Add</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
