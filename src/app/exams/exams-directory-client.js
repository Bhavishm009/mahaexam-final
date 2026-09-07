"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Clock,
  Award,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Zap,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { EXAM_CATEGORIES, getCategorySlugFromExam } from "@/lib/exam-category-helper";

export function ExamsDirectoryClient({
  exams = [],
  hideCategoriesHub = false,
  hideCategoryPills = false,
}) {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const { language } = useLanguage();

  const categoriesWithCounts = useMemo(() => {
    return [
      {
        id: "ALL",
        slug: "all",
        labelMr: `सर्व परीक्षा (${exams.length})`,
        labelEn: `All Tests (${exams.length})`,
      },
      ...EXAM_CATEGORIES.map((c) => {
        const count = exams.filter((e) => getCategorySlugFromExam(e) === c.slug).length;
        return {
          id: c.id,
          slug: c.slug,
          labelMr: `${c.badgeMr} (${count})`,
          labelEn: `${c.badgeEn} (${count})`,
          count,
        };
      }),
    ];
  }, [exams]);

  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      let matchCat = true;
      const catSlug = getCategorySlugFromExam(e);

      if (!hideCategoryPills && activeCategory !== "ALL") {
        const selectedObj = categoriesWithCounts.find((c) => c.id === activeCategory);
        if (selectedObj) {
          matchCat = catSlug === selectedObj.slug;
        }
      }

      let matchQuery = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        matchQuery =
          e.title?.toLowerCase().includes(q) ||
          e.slug?.toLowerCase().includes(q) ||
          e.examType?.toLowerCase().includes(q);
      }

      return matchCat && matchQuery;
    });
  }, [exams, activeCategory, searchQuery, categoriesWithCounts, hideCategoryPills]);

  return (
    <div className="space-y-8">
      {/* Category Cards Hub (Only shown on main /exams overview page) */}
      {!hideCategoriesHub && (
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
              {language === "mr"
                ? "परीक्षा प्रवर्ग शोधा (Exam Categories)"
                : "Explore Exam Categories"}
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {EXAM_CATEGORIES.length} प्रमुख प्रवर्गांचे सराव पेपर्स
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {EXAM_CATEGORIES.map((cat) => {
              const count = exams.filter((e) => getCategorySlugFromExam(e) === cat.slug).length;

              return (
                <Link
                  key={cat.slug}
                  href={`/exams/${cat.slug}`}
                  prefetch={true}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500"
                >
                  <div>
                    <span
                      className={`inline-block rounded-lg px-2 py-0.5 text-[10px] font-bold ${cat.badgeColor}`}
                    >
                      {cat.badgeMr}
                    </span>
                    <div className="mt-2 line-clamp-1 text-xs font-bold text-slate-900 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                      {cat.badgeMr}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <span>{count} पेपर्स</span>
                    <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-blue-600" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Clean, Aligned Search & Filter Control Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={
                language === "mr"
                  ? "परीक्षेचे नाव, विषय किंवा कीवर्ड शोधा..."
                  : "Search tests by name, subject, or keywords..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-11 pr-10 text-xs font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:focus:border-blue-500 dark:focus:bg-slate-900 sm:text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-xs text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Counter */}
          <div className="flex shrink-0 items-center justify-between gap-3">
            <span className="rounded-xl bg-blue-50 px-3.5 py-2.5 text-xs font-bold text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
              {language === "mr"
                ? `${filteredExams.length} सराव परीक्षा उपलब्ध`
                : `${filteredExams.length} Tests Available`}
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs font-bold text-rose-600 hover:underline dark:text-rose-400"
              >
                {language === "mr" ? "रीसेट करा" : "Clear"}
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills (Only shown when not hidden) */}
        {!hideCategoryPills && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            {categoriesWithCounts.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategory(c.id)}
                className={`rounded-2xl px-3.5 py-1.5 text-xs font-bold transition active:scale-95 ${
                  activeCategory === c.id
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25 dark:bg-blue-600"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {language === "mr" ? c.labelMr : c.labelEn}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Exams Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredExams.map((e) => {
          const qCount = e.questions || e.totalQuestions || 100;
          const duration = e.duration || e.durationMinutes || 90;
          const marks = e.marks || e.totalMarks || 100;
          const categorySlug = getCategorySlugFromExam(e);
          const examSlug = e.slug || e.id;

          const detailHref = `/exams/${categorySlug}/${examSlug}`;
          const startHref = `/exams/${categorySlug}/${examSlug}/start`;

          return (
            <article
              key={e.id}
              className="glass-card group flex flex-col justify-between p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center justify-center rounded-lg border px-2.5 py-1 text-[11px] font-bold leading-none ${e.badgeColor}`}
                  >
                    {language === "mr" ? e.badgeMr : e.badgeEn}
                  </span>
                  <span className="rounded-lg border border-slate-200/60 bg-slate-100/80 px-2.5 py-1 text-[10px] font-bold text-slate-700 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-300">
                    {e.examType?.replace(/_/g, " ") || "CBT"}
                  </span>
                </div>

                <Link href={detailHref} prefetch={true}>
                  <h3 className="mt-4 line-clamp-2 text-base font-black leading-snug text-slate-900 transition group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400 sm:text-lg">
                    {e.title}
                  </h3>
                </Link>

                <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl border border-slate-200/60 bg-slate-100/70 p-3 text-center text-xs dark:border-slate-700/60 dark:bg-slate-900/70">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-slate-600 dark:text-slate-300">
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold">प्रश्न</span>
                    </div>
                    <div className="mt-1 font-black text-slate-900 dark:text-white">{qCount}</div>
                  </div>
                  <div className="border-x border-slate-200/70 dark:border-slate-700/70">
                    <div className="flex items-center justify-center gap-1 text-slate-600 dark:text-slate-300">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold">वेळ</span>
                    </div>
                    <div className="mt-1 font-black text-sky-600 dark:text-sky-400">
                      {duration} मि
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-slate-600 dark:text-slate-300">
                      <Award className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold">गुण</span>
                    </div>
                    <div className="mt-1 font-black text-emerald-600 dark:text-emerald-400">
                      {marks}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 border-t border-slate-200/70 pt-4 dark:border-slate-800/80">
                <Link
                  href={startHref}
                  prefetch={true}
                  className="glass-btn-primary inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-3 text-xs font-black text-white shadow-md transition active:scale-95"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-300" />
                  <span>{language === "mr" ? "सराव सुरू करा" : "Attempt Now"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <Link
                  href={detailHref}
                  prefetch={true}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300/80 bg-white/70 px-3.5 py-3 text-xs font-bold text-slate-800 transition hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
                  title="अभ्यासक्रम व सूचना पहा (Syllabus & Info)"
                >
                  <BookOpen className="h-4 w-4" />
                </Link>
              </div>
            </article>
          );
        })}

        {!filteredExams.length && (
          <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <p className="text-base font-bold">या प्रवर्गात परीक्षा सापडली नाही.</p>
            <p className="mt-1 text-xs text-slate-400">कृपया दुसरा सर्च शब्द वापरून पहा.</p>
          </div>
        )}
      </div>
    </div>
  );
}
