"use client";

import { useEffect, useState, useMemo, useOptimistic, useTransition } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  BookOpen,
  Search,
  Star,
} from "lucide-react";
import { NotificationPermissionPrompt } from "@/components/notification-permission-prompt";

export function StudentExamsClient({ initialExams }) {
  const [exams, setExams] = useState(initialExams || []);
  const [loading, setLoading] = useState(!initialExams);
  const [category, setCategory] = useState("ALL");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const pageSize = 9;

  // Sync bookmarks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mahaexam_saved_exams");
      if (saved) {
        setBookmarkedIds(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // React 19 optimistic update for bookmarking
  const [optimisticBookmarks, setOptimisticBookmarks] = useOptimistic(
    bookmarkedIds,
    (state, toggledId) =>
      state.includes(toggledId) ? state.filter((id) => id !== toggledId) : [...state, toggledId],
  );

  const toggleBookmark = (examId, e) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      setOptimisticBookmarks(examId);
      const next = bookmarkedIds.includes(examId)
        ? bookmarkedIds.filter((id) => id !== examId)
        : [...bookmarkedIds, examId];
      setBookmarkedIds(next);
      try {
        localStorage.setItem("mahaexam_saved_exams", JSON.stringify(next));
      } catch {}
    });
  };

  useEffect(() => {
    if (!initialExams) {
      fetch("/api/student/exams")
        .then((r) => r.json())
        .then((d) => {
          setExams(d.exams || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [initialExams]);

  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      // Category match
      let matchCat = true;
      if (category === "SAVED") {
        matchCat = optimisticBookmarks.includes(e.id);
      } else if (category === "POLICE") {
        matchCat =
          e.slug?.includes("police") ||
          e.title?.toLowerCase().includes("police") ||
          e.title?.includes("पोलीस");
      } else if (category === "TALATHI") {
        matchCat =
          e.slug?.includes("talathi") ||
          e.title?.toLowerCase().includes("talathi") ||
          e.title?.includes("तलाठी");
      } else if (category === "MPSC") {
        matchCat =
          e.slug?.includes("mpsc") ||
          e.title?.toLowerCase().includes("mpsc") ||
          e.title?.includes("राज्यसेवा");
      } else if (category === "SARALSEVA") {
        matchCat =
          e.slug?.includes("zp") ||
          e.slug?.includes("vanrakshak") ||
          e.slug?.includes("saralseva") ||
          e.title?.includes("ग्रामसेवक") ||
          e.title?.includes("वनरक्षक") ||
          e.title?.includes("सरळसेवा");
      } else if (category === "TCS_IBPS") {
        matchCat =
          e.slug?.includes("tcs") ||
          e.slug?.includes("ibps") ||
          e.title?.includes("TCS") ||
          e.title?.includes("IBPS") ||
          e.title?.includes("अंकगणित");
      } else if (category === "PYQ") {
        matchCat =
          e.slug?.includes("pyq") ||
          e.title?.toLowerCase().includes("pyq") ||
          e.title?.includes("मूळ") ||
          e.title?.includes("PYQ");
      }

      // Query match
      let matchQuery = true;
      if (query.trim()) {
        const q = query.toLowerCase();
        matchQuery =
          e.title?.toLowerCase().includes(q) ||
          e.slug?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q);
      }

      return matchCat && matchQuery;
    });
  }, [exams, category, query, optimisticBookmarks]);

  const categories = [
    { id: "ALL", label: `सर्व परीक्षा (All ${exams.length})` },
    ...(optimisticBookmarks.length > 0
      ? [{ id: "SAVED", label: `⭐ सेव्ह केलेले (Saved ${optimisticBookmarks.length})` }]
      : []),
    {
      id: "PYQ",
      label: `📜 मागील वर्षांच्या मूळ प्रश्नपत्रिका (PYQ ${exams.filter((e) => e.slug?.includes("pyq") || e.title?.includes("PYQ") || e.title?.includes("मूळ")).length})`,
    },
    {
      id: "POLICE",
      label: `पोलीस भरती (Police ${exams.filter((e) => e.slug?.includes("police") || e.title?.includes("पोलीस")).length})`,
    },
    {
      id: "TALATHI",
      label: `तलाठी भरती (Talathi ${exams.filter((e) => e.slug?.includes("talathi") || e.title?.includes("तलाठी")).length})`,
    },
    {
      id: "MPSC",
      label: `एमपीएससी (MPSC ${exams.filter((e) => e.slug?.includes("mpsc")).length})`,
    },
    {
      id: "SARALSEVA",
      label: `ZP / वनरक्षक / सरळसेवा (${exams.filter((e) => e.slug?.includes("zp") || e.slug?.includes("vanrakshak") || e.slug?.includes("saralseva")).length})`,
    },
    {
      id: "TCS_IBPS",
      label: `TCS / IBPS Special (${exams.filter((e) => e.slug?.includes("tcs") || e.slug?.includes("ibps")).length})`,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-4 font-sans text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 sm:p-6 lg:p-8">
      <NotificationPermissionPrompt />

      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-blue-100 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                १००% मोफत व लाइव्ह सराव परीक्षा ({exams.length} Live Exams)
              </span>
              <h1 className="mt-3 text-2xl font-black sm:text-3xl">
                Maharashtra Online Examinations
              </h1>
              <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                महाराष्ट्र पोलीस भरती, तलाठी, एमपीएससी, जिल्हा परिषद व सरळसेवा परीक्षेचे १०० गुणांचे
                परिपूर्ण सराव पेपर्स.
              </p>
            </div>
            <Link
              href="/student/dashboard"
              className="inline-flex items-center gap-1.5 self-start rounded-2xl bg-white/20 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/30 sm:self-auto"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  startTransition(() => {
                    setCategory(c.id);
                    setCurrentPage(1);
                  });
                }}
                className={`rounded-2xl px-3.5 py-2 text-xs font-bold transition active:scale-95 ${
                  category === c.id
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {isPending && (
              <span className="inline-flex animate-pulse items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                Updating...
              </span>
            )}
            <div className="relative shrink-0 md:w-72">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search exam title, slug..."
                value={query}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuery(val);
                  startTransition(() => {
                    setCurrentPage(1);
                  });
                }}
                className="h-10 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Exams Grid */}
        {loading ? (
          <div className="grid min-h-[40vh] place-items-center">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span>Loading {exams.length || "all"} available examinations...</span>
            </div>
          </div>
        ) : (
          <div
            className={`grid gap-5 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-3 ${
              isPending ? "opacity-75" : "opacity-100"
            }`}
          >
            {filteredExams.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((e) => (
              <article
                key={e.id}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                          e.source === "FREE_GLOBAL" || e.isFree
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300"
                        }`}
                      >
                        {e.source === "FREE_GLOBAL" || e.isFree ? "100% FREE" : "COACHING"}
                      </span>
                      {(e.slug?.includes("pyq") ||
                        e.title?.includes("PYQ") ||
                        e.title?.includes("मूळ")) && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-800 dark:bg-amber-950/90 dark:text-amber-300">
                          📜 मूळ PYQ पेपर
                        </span>
                      )}
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {e.examType || "CBT"}
                    </span>
                  </div>

                  <h2 className="mt-4 text-base font-black leading-snug text-slate-900 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 sm:text-lg">
                    {e.title}
                  </h2>
                  {e.description && (
                    <p className="mt-1.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                      {e.description}
                    </p>
                  )}

                  <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 text-center text-xs dark:bg-slate-800/60">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-slate-400">
                        <HelpCircle className="h-3.5 w-3.5" />
                        <span className="text-[10px]">Questions</span>
                      </div>
                      <div className="mt-1 font-black text-slate-900 dark:text-slate-100">
                        {e.totalQuestions}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-[10px]">Duration</span>
                      </div>
                      <div className="mt-1 font-black text-slate-900 dark:text-slate-100">
                        {e.durationMinutes} m
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-slate-400">
                        <Award className="h-3.5 w-3.5" />
                        <span className="text-[10px]">Marks</span>
                      </div>
                      <div className="mt-1 font-black text-blue-600 dark:text-blue-400">
                        {e.totalMarks}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <Link
                    href={`/exam/${e.slug || e.id}/attempt`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white shadow-glow transition hover:bg-blue-500 active:scale-[0.98]"
                  >
                    <span>Attempt Now</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={(ev) => toggleBookmark(e.id, ev)}
                    className={`inline-flex items-center justify-center rounded-2xl border px-3 py-3 text-xs font-bold transition active:scale-90 ${
                      optimisticBookmarks.includes(e.id)
                        ? "border-amber-300 bg-amber-50 text-amber-500 shadow-sm dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-400"
                        : "border-slate-200 bg-slate-50 text-slate-400 hover:text-amber-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-amber-400"
                    }`}
                    title={
                      optimisticBookmarks.includes(e.id)
                        ? "सेव्ह केलेल्यातून काढा (Remove bookmark)"
                        : "परीक्षा सेव्ह करा (Bookmark)"
                    }
                  >
                    <Star
                      className={`h-4 w-4 transition-transform ${
                        optimisticBookmarks.includes(e.id)
                          ? "scale-110 fill-amber-400 text-amber-500"
                          : ""
                      }`}
                    />
                  </button>

                  <Link
                    href={`/exam/${e.slug || e.id}`}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    title="View Instructions & Syllabus"
                  >
                    <BookOpen className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}

            {!filteredExams.length && (
              <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                <p className="text-base font-bold">No examinations found in this category.</p>
                <p className="mt-1 text-xs text-slate-400">
                  Try selecting another tab or clear your search term.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {filteredExams.length > pageSize && (
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing page <strong>{currentPage}</strong> of{" "}
              <strong>{Math.ceil(filteredExams.length / pageSize)}</strong> ({filteredExams.length}{" "}
              tests)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:text-slate-200"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage >= Math.ceil(filteredExams.length / pageSize)}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:text-slate-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
