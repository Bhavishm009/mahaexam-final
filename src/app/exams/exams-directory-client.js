"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Clock, Award, HelpCircle, ArrowRight, BookOpen, Sparkles, Zap, Filter } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export function ExamsDirectoryClient({ exams = [] }) {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const { language } = useLanguage();

  const getCategoryFromExam = (e) => {
    const slug = (e.slug || e.id || "").toLowerCase();
    const title = (e.title || "").toLowerCase();
    const type = (e.examType || "").toUpperCase();

    if (slug.includes("police") || title.includes("police") || title.includes("पोलीस") || type === "POLICE_BHARTI") {
      return "POLICE";
    }
    if (slug.includes("talathi") || title.includes("talathi") || title.includes("तलाठी") || type === "TALATHI") {
      return "TALATHI";
    }
    if (slug.includes("mpsc-rajyaseva") || title.includes("राज्यसेवा") || type === "MPSC_RAJYASEVA") {
      return "MPSC_RAJYASEVA";
    }
    if (slug.includes("combine") || slug.includes("group-b") || slug.includes("group-c") || title.includes("संयुक्त") || type === "MPSC_COMBINE") {
      return "MPSC_COMBINE";
    }
    if (slug.includes("zp") || slug.includes("gramsevak") || title.includes("जिल्हा परिषद") || title.includes("आरोग्य") || type === "ZILLA_PARISHAD") {
      return "ZP";
    }
    if (slug.includes("vanrakshak") || slug.includes("forest") || title.includes("वनरक्षक") || type === "VANRAKSHAK") {
      return "VANRAKSHAK";
    }
    if (slug.includes("group-d") || slug.includes("saralseva") || title.includes("गट-डी") || title.includes("सरळसेवा") || type === "SARALSEVA") {
      return "SARALSEVA";
    }
    if (e.isPyq || slug.includes("pyq") || title.includes("pyq") || title.includes("मूळ")) {
      return "PYQ";
    }
    return "OTHER";
  };

  const categories = [
    { id: "ALL", labelMr: `सर्व परीक्षा (${exams.length})`, labelEn: `All Tests (${exams.length})` },
    {
      id: "PYQ",
      labelMr: `📜 अधिकृत PYQ पेपर्स (${exams.filter((e) => e.isPyq || e.slug?.includes("pyq") || e.title?.includes("PYQ") || e.title?.includes("मूळ")).length})`,
      labelEn: `📜 Official PYQs (${exams.filter((e) => e.isPyq || e.slug?.includes("pyq") || e.title?.includes("PYQ") || e.title?.includes("मूळ")).length})`,
    },
    {
      id: "POLICE",
      labelMr: `पोलीस भरती (${exams.filter((e) => getCategoryFromExam(e) === "POLICE").length})`,
      labelEn: `Police Bharti (${exams.filter((e) => getCategoryFromExam(e) === "POLICE").length})`,
    },
    {
      id: "TALATHI",
      labelMr: `तलाठी भरती TCS (${exams.filter((e) => getCategoryFromExam(e) === "TALATHI").length})`,
      labelEn: `Talathi TCS (${exams.filter((e) => getCategoryFromExam(e) === "TALATHI").length})`,
    },
    {
      id: "MPSC_RAJYASEVA",
      labelMr: `MPSC राज्यसेवा (${exams.filter((e) => getCategoryFromExam(e) === "MPSC_RAJYASEVA").length})`,
      labelEn: `MPSC Rajyaseva (${exams.filter((e) => getCategoryFromExam(e) === "MPSC_RAJYASEVA").length})`,
    },
    {
      id: "MPSC_COMBINE",
      labelMr: `MPSC संयुक्त गट ब व क (${exams.filter((e) => getCategoryFromExam(e) === "MPSC_COMBINE").length})`,
      labelEn: `MPSC Combine B & C (${exams.filter((e) => getCategoryFromExam(e) === "MPSC_COMBINE").length})`,
    },
    {
      id: "ZP",
      labelMr: `जिल्हा परिषद / आरोग्य सेवक (${exams.filter((e) => getCategoryFromExam(e) === "ZP").length})`,
      labelEn: `Zilla Parishad (${exams.filter((e) => getCategoryFromExam(e) === "ZP").length})`,
    },
    {
      id: "VANRAKSHAK",
      labelMr: `वनरक्षक भरती (${exams.filter((e) => getCategoryFromExam(e) === "VANRAKSHAK").length})`,
      labelEn: `Vanrakshak / Forest (${exams.filter((e) => getCategoryFromExam(e) === "VANRAKSHAK").length})`,
    },
    {
      id: "SARALSEVA",
      labelMr: `सरळसेवा / गट-डी (${exams.filter((e) => getCategoryFromExam(e) === "SARALSEVA").length})`,
      labelEn: `Saralseva / Group D (${exams.filter((e) => getCategoryFromExam(e) === "SARALSEVA").length})`,
    },
  ];

  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      let matchCat = true;
      if (activeCategory === "PYQ") {
        matchCat = e.isPyq || e.slug?.includes("pyq") || e.title?.includes("PYQ") || e.title?.includes("मूळ");
      } else if (activeCategory !== "ALL") {
        matchCat = getCategoryFromExam(e) === activeCategory;
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
  }, [exams, activeCategory, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCategory(c.id)}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition active:scale-95 sm:text-sm ${
                activeCategory === c.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 dark:bg-blue-600"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {language === "mr" ? c.labelMr : c.labelEn}
            </button>
          ))}
        </div>

        {/* Live Search Input */}
        <div className="relative shrink-0 sm:w-80">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              language === "mr"
                ? "परीक्षा शोधा (उदा. पोलीस, तलाठी, MPSC)..."
                : "Search tests (e.g. Police, Talathi, MPSC)..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white sm:text-sm"
          />
        </div>
      </div>

      {/* Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          {language === "mr"
            ? `${filteredExams.length} सराव परीक्षा उपलब्ध`
            : `Showing ${filteredExams.length} tests`}
        </span>
        {activeCategory !== "ALL" && (
          <button
            type="button"
            onClick={() => setActiveCategory("ALL")}
            className="font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            {language === "mr" ? "सर्व परीक्षा पहा" : "Clear filter"}
          </button>
        )}
      </div>

      {/* Exams Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredExams.map((e) => {
          const qCount = e.questions || e.totalQuestions || 100;
          const duration = e.duration || e.durationMinutes || 90;
          const marks = e.marks || e.totalMarks || 100;

          return (
            <article
              key={e.id}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center justify-center rounded-lg border px-2.5 py-1 text-[11px] font-bold leading-none ${e.badgeColor}`}
                  >
                    {language === "mr" ? e.badgeMr : e.badgeEn}
                  </span>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {e.examType?.replace(/_/g, " ") || "CBT"}
                  </span>
                </div>

                <h2 className="mt-4 line-clamp-2 text-base font-black leading-snug text-slate-900 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 sm:text-lg">
                  {e.title}
                </h2>

                <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 text-center text-xs dark:bg-slate-800/60">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-slate-400">
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span className="text-[10px]">प्रश्न</span>
                    </div>
                    <div className="mt-1 font-black text-slate-900 dark:text-slate-100">
                      {qCount}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-[10px]">वेळ</span>
                    </div>
                    <div className="mt-1 font-black text-slate-900 dark:text-slate-100">
                      {duration} मि
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-slate-400">
                      <Award className="h-3.5 w-3.5" />
                      <span className="text-[10px]">गुण</span>
                    </div>
                    <div className="mt-1 font-black text-blue-600 dark:text-blue-400">
                      {marks}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <Link
                  href={`/exam/${e.slug || e.id}/attempt`}
                  prefetch={true}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white shadow-glow transition hover:bg-blue-500 active:scale-[0.98]"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-300" />
                  <span>{language === "mr" ? "सराव सुरू करा" : "Attempt Now"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <Link
                  href={`/exam/${e.slug || e.id}`}
                  prefetch={true}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
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
            <p className="text-base font-bold">या वर्गात परीक्षा सापडली नाही.</p>
            <p className="mt-1 text-xs text-slate-400">
              कृपया दुसरा प्रवर्ग निवडा किंवा सर्च शब्द बदलून पहा.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
