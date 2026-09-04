"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useAuth } from "@/components/auth-provider";

const fallbackExamsData = [
  {
    id: "police-01",
    category: "police",
    titleMr: "महाराष्ट्र पोलीस भरती संपूर्ण सराव परीक्षा ०१",
    titleEn: "Maharashtra Police Bharti Full Mock Test 01",
    questions: 100,
    duration: 90,
    marks: 100,
    negativeMarks: "०.२५",
    negativeMarksEn: "0.25",
    badgeMr: "सर्वात लोकप्रिय",
    badgeEn: "Most Popular",
    badgeColor:
      "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700",
  },
  {
    id: "mpsc-01",
    category: "mpsc",
    titleMr: "MPSC राज्यसेवा सामान्य अध्ययन पेपर १ सराव परीक्षा",
    titleEn: "MPSC Rajyaseva GS Paper 1 Comprehensive Test",
    questions: 100,
    duration: 120,
    marks: 200,
    negativeMarks: "०.२५",
    negativeMarksEn: "0.25",
    badgeMr: "TCS/IBPS पॅटर्न",
    badgeEn: "TCS/IBPS Pattern",
    badgeColor:
      "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-700",
  },
  {
    id: "talathi-01",
    category: "talathi",
    titleMr: "तलाठी भरती विशेष ऑनलाइन टेस्ट सिरीज २०२६",
    titleEn: "Talathi Bharti Special Practice Test Series 2026",
    questions: 100,
    duration: 120,
    marks: 200,
    negativeMarks: "नाही",
    negativeMarksEn: "None",
    badgeMr: "नवीन अभ्यासक्रम",
    badgeEn: "Latest Syllabus",
    badgeColor:
      "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700",
  },
  {
    id: "zp-01",
    category: "zp",
    titleMr: "जिल्हा परिषद आरोग्य सेवक परिपूर्ण सराव परीक्षा",
    titleEn: "Zilla Parishad Arogya Sevak Full Length Test",
    questions: 100,
    duration: 90,
    marks: 200,
    negativeMarks: "०.२५",
    negativeMarksEn: "0.25",
    badgeMr: "नवीन २०२६",
    badgeEn: "Updated 2026",
    badgeColor:
      "bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-700",
  },
  {
    id: "vanrakshak-01",
    category: "saralseva",
    titleMr: "वनरक्षक सरळसेवा भरती ऑनलाइन CBT परीक्षा",
    titleEn: "Vanrakshak (Forest Guard) CBT Exam Simulator",
    questions: 60,
    duration: 90,
    marks: 120,
    negativeMarks: "०.५०",
    negativeMarksEn: "0.50",
    badgeMr: "ऑनलाइन CBT",
    badgeEn: "Online CBT",
    badgeColor:
      "bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-700",
  },
  {
    id: "police-02",
    category: "police",
    titleMr: "पोलीस भरती सामान्य ज्ञान व मराठी व्याकरण सराव",
    titleEn: "Police Bharti GK & Marathi Grammar Focus",
    questions: 50,
    duration: 45,
    marks: 50,
    negativeMarks: "०.२५",
    negativeMarksEn: "0.25",
    badgeMr: "विषयवार टेस्ट",
    badgeEn: "Subject Test",
    badgeColor:
      "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700",
  },
];

export function PublicExamsSection({ initialExams = [] }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const sourceList = useMemo(() => {
    return initialExams && initialExams.length > 0 ? initialExams : fallbackExamsData;
  }, [initialExams]);

  const getExamCategory = (e) => {
    const type = (e.examType || e.category || "").toUpperCase();
    const slug = (e.slug || e.id || "").toLowerCase();
    const title = (e.title || e.titleMr || e.titleEn || "").toLowerCase();

    if (
      type.includes("POLICE") ||
      slug.includes("police") ||
      title.includes("police") ||
      title.includes("पोलीस")
    ) {
      return { id: "police", labelMr: "पोलीस भरती", labelEn: "Police Bharti" };
    }
    if (
      type.includes("MPSC") ||
      slug.includes("mpsc") ||
      title.includes("mpsc") ||
      title.includes("राज्यसेवा") ||
      title.includes("संयुक्त")
    ) {
      return { id: "mpsc", labelMr: "एमपीएससी", labelEn: "MPSC Exams" };
    }
    if (
      type.includes("TALATHI") ||
      slug.includes("talathi") ||
      title.includes("talathi") ||
      title.includes("तलाठी")
    ) {
      return { id: "talathi", labelMr: "तलाठी भरती", labelEn: "Talathi Bharti" };
    }
    if (
      type.includes("ZILLA") ||
      type.includes("ZP") ||
      slug.includes("zp") ||
      slug.includes("gramsevak") ||
      title.includes("जिल्हा परिषद") ||
      title.includes("ग्रामसेवक") ||
      title.includes("आरोग्य")
    ) {
      return { id: "zp", labelMr: "जिल्हा परिषद (ZP)", labelEn: "Zilla Parishad" };
    }
    if (
      type.includes("SARALSEVA") ||
      type.includes("VANRAKSHAK") ||
      slug.includes("vanrakshak") ||
      slug.includes("saralseva") ||
      title.includes("वनरक्षक") ||
      title.includes("सरळसेवा")
    ) {
      return { id: "saralseva", labelMr: "सरळसेवा / वनरक्षक", labelEn: "Saralseva & Forest" };
    }
    if (
      type.includes("PYQ") ||
      slug.includes("official") ||
      slug.includes("pyq") ||
      e.isPyq === true ||
      title.includes("मूळ प्रश्नपत्रिका") ||
      title.includes("official paper")
    ) {
      return { id: "pyq", labelMr: "मूळ PYQ प्रश्नपत्रिका", labelEn: "Official PYQs" };
    }
    const fallbackId = type ? type.toLowerCase().replace(/[^a-z0-9]/g, "-") : "other";
    return {
      id: fallbackId,
      labelMr: e.examType || "इतर परीक्षा",
      labelEn: e.examType || "Other Exams",
    };
  };

  const categories = useMemo(() => {
    const counts = { all: sourceList.length };
    const infoMap = new Map();

    sourceList.forEach((e) => {
      const cat = getExamCategory(e);
      counts[cat.id] = (counts[cat.id] || 0) + 1;
      if (!infoMap.has(cat.id)) {
        infoMap.set(cat.id, cat);
      }
    });

    const list = [
      {
        id: "all",
        label: `${language === "mr" ? "सर्व परीक्षा" : "All Exams"} (${counts.all})`,
      },
    ];

    const preferredOrder = ["police", "mpsc", "talathi", "zp", "saralseva", "pyq"];
    preferredOrder.forEach((catId) => {
      if (counts[catId] > 0) {
        const info = infoMap.get(catId);
        list.push({
          id: catId,
          label: `${language === "mr" ? info.labelMr : info.labelEn} (${counts[catId]})`,
        });
      }
    });

    infoMap.forEach((info, catId) => {
      if (!preferredOrder.includes(catId) && catId !== "all" && counts[catId] > 0) {
        list.push({
          id: catId,
          label: `${language === "mr" ? info.labelMr : info.labelEn} (${counts[catId]})`,
        });
      }
    });

    return list;
  }, [sourceList, language]);

  const filteredExams = useMemo(() => {
    if (activeCategory === "all") {
      return sourceList;
    }
    return sourceList.filter((e) => {
      const cat = getExamCategory(e);
      return cat.id === activeCategory;
    });
  }, [sourceList, activeCategory]);

  return (
    <section id="exams" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white sm:text-4xl">
            {t.mockTestsTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-xs text-slate-600 dark:text-slate-300 sm:text-base">
            {t.mockTestsSubtitle}
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition active:scale-95 sm:px-5 sm:py-2.5 sm:text-sm ${
                activeCategory === cat.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 dark:bg-blue-600"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Exam Cards Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredExams.map((exam) => {
            const title =
              language === "mr"
                ? exam.titleMr || exam.title
                : exam.titleEn || exam.title || exam.titleMr;
            const qCount = exam.questions || exam._count?.questions || 100;
            const duration = exam.duration || exam.durationMinutes || 90;
            const totalMarks = exam.marks || exam.totalMarks || 100;
            const isPyq = exam.examType === "PREVIOUS_YEAR";

            const badgeText = isPyq
              ? "अधिकृत PYQ"
              : exam.badgeMr
                ? language === "mr"
                  ? exam.badgeMr
                  : exam.badgeEn
                : "100% Live";

            const badgeColor = isPyq
              ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700"
              : exam.badgeColor ||
                "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700";

            const targetHref = `/exam/${exam.slug || exam.id}`;

            return (
              <div
                key={exam.id || exam.slug}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center justify-center rounded-lg border px-2.5 py-1 text-[11px] font-bold leading-none ${badgeColor}`}
                    >
                      {badgeText}
                    </span>
                    <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold leading-none text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {qCount} {t.questionsCount}
                    </span>
                  </div>

                  <h3 className="mt-4 line-clamp-2 text-base font-black leading-snug text-slate-900 dark:text-white">
                    {title}
                  </h3>

                  <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 text-center text-xs dark:bg-slate-800/60">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="text-[10px] font-medium leading-none text-slate-400">
                        {t.questionsCount}
                      </div>
                      <div className="font-black leading-none text-slate-900 dark:text-white">
                        {qCount}
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1 border-x border-slate-200/60 dark:border-slate-700/50">
                      <div className="text-[10px] font-medium leading-none text-slate-400">
                        {t.minutes}
                      </div>
                      <div className="font-black leading-none text-blue-600 dark:text-blue-400">
                        {duration}m
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="text-[10px] font-medium leading-none text-slate-400">
                        {t.marks}
                      </div>
                      <div className="font-black leading-none text-emerald-600 dark:text-emerald-400">
                        {totalMarks}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <Link
                    href={targetHref}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-xs font-bold leading-none text-white shadow-sm transition hover:bg-blue-500 active:scale-95 dark:bg-blue-600 dark:hover:bg-blue-500"
                  >
                    <Zap className="h-4 w-4 text-amber-300" />
                    <span>{t.startExamBtn}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
