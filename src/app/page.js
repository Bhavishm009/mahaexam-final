"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { useLanguage } from "@/components/language-provider";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Trophy,
  ArrowRight,
  BarChart3,
  Layers3,
  ChevronDown,
  Building2,
  GraduationCap,
  Zap,
} from "lucide-react";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaq, setOpenFaq] = useState(null);
  const [dbExams, setDbExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const { language, t } = useLanguage();

  useEffect(() => {
    fetch("/api/student/exams")
      .then((r) => r.json())
      .then((d) => {
        if (d.exams && Array.isArray(d.exams) && d.exams.length > 0) {
          setDbExams(d.exams);
        }
        setLoadingExams(false);
      })
      .catch(() => setLoadingExams(false));
  }, []);



  const examsData = [
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

  const faqsData = [
    {
      qMr: "मॉक टेस्ट्स मराठी आणि इंग्रजी दोन्ही भाषेत उपलब्ध आहेत का?",
      qEn: "Are the mock tests available in both Marathi and English?",
      aMr: "होय, महाएक्झामवरील सर्व परीक्षा मराठी आणि इंग्रजी दोन्ही भाषेत उपलब्ध आहेत. परीक्षेदरम्यान तुम्ही एका क्लिकवर प्रश्न मराठी किंवा इंग्रजीत पाहू शकता.",
      aEn: "Yes! All mock tests on MahaExam are fully bilingual. You can switch between Marathi and English with one click during the examination.",
    },
    {
      qMr: "परीक्षेत अँटी-चीटिंग आणि फुलस्क्रीन सुविधा आहे का?",
      qEn: "Does the platform enforce anti-cheating and fullscreen mode?",
      aMr: "होय, परीक्षा सुरू होताच ती सुरक्षित फुलस्क्रीन मोडमध्ये जाते. टॅब बदलणे, कॉपी-पेस्ट करणे आणि इतर गैरप्रकारांवर स्वयंचलित नियंत्रण ठेवले जाते.",
      aEn: "Yes! When an exam is started, it enters secure fullscreen mode, detects tab switching, and prevents copy-pasting with automated proctoring.",
    },
    {
      qMr: "कोचिंग क्लासेस स्वतःच्या प्रश्नपत्रिका तयार करू शकतात का?",
      qEn: "Can coaching academies create their own question papers?",
      aMr: "नक्कीच! अकॅडेमी संचालक स्वतःचे प्रश्न बँक तयार करू शकतात, CSV फाईलने प्रश्न अपलोड करू शकतात आणि बॅचनुसार परीक्षा घेऊ शकतात.",
      aEn: "Absolutely! Coaching institutes can upload MCQ questions in bulk via CSV, create custom question banks, and conduct batch-wise exams.",
    },
    {
      qMr: "परीक्षेनंतर निकाल व रँक कधी मिळते?",
      qEn: "When do students receive their rank and scorecards?",
      aMr: "परीक्षा सबमिट करताच त्वरित संपूर्ण निकाल, अचूकता टक्केवारी, निगेटिव्ह मार्किंग वजावट आणि राज्यस्तरीय रँक मिळते.",
      aEn: "Immediately upon submission! Students receive complete scorecards with accuracy breakdown, negative marking deduction, and statewide rank.",
    },
  ];

  const sourceList = useMemo(() => {
    return dbExams.length > 0 ? dbExams : examsData;
  }, [dbExams, examsData]);

  const getExamCategory = (e) => {
    const type = (e.examType || e.category || "").toUpperCase();
    const slug = (e.slug || e.id || "").toLowerCase();
    const title = (e.title || e.titleMr || e.titleEn || "").toLowerCase();

    if (type.includes("POLICE") || slug.includes("police") || title.includes("police") || title.includes("पोलीस")) {
      return { id: "police", labelMr: "पोलीस भरती", labelEn: "Police Bharti" };
    }
    if (type.includes("MPSC") || slug.includes("mpsc") || title.includes("mpsc") || title.includes("राज्यसेवा") || title.includes("संयुक्त")) {
      return { id: "mpsc", labelMr: "एमपीएससी", labelEn: "MPSC Exams" };
    }
    if (type.includes("TALATHI") || slug.includes("talathi") || title.includes("talathi") || title.includes("तलाठी")) {
      return { id: "talathi", labelMr: "तलाठी भरती", labelEn: "Talathi Bharti" };
    }
    if (type.includes("ZILLA") || type.includes("ZP") || slug.includes("zp") || slug.includes("gramsevak") || title.includes("जिल्हा परिषद") || title.includes("ग्रामसेवक") || title.includes("आरोग्य")) {
      return { id: "zp", labelMr: "जिल्हा परिषद (ZP)", labelEn: "Zilla Parishad" };
    }
    if (type.includes("SARALSEVA") || type.includes("VANRAKSHAK") || slug.includes("vanrakshak") || slug.includes("saralseva") || title.includes("वनरक्षक") || title.includes("सरळसेवा")) {
      return { id: "saralseva", labelMr: "सरळसेवा / वनरक्षक", labelEn: "Saralseva & Forest" };
    }
    if (type.includes("PYQ") || slug.includes("official") || slug.includes("pyq") || e.isPyq === true || title.includes("मूळ प्रश्नपत्रिका") || title.includes("official paper")) {
      return { id: "pyq", labelMr: "मूळ PYQ प्रश्नपत्रिका", labelEn: "Official PYQs" };
    }
    const fallbackId = type ? type.toLowerCase().replace(/[^a-z0-9]/g, "-") : "other";
    return { id: fallbackId, labelMr: e.examType || "इतर परीक्षा", labelEn: e.examType || "Other Exams" };
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

  const displayExams = useMemo(() => {
    return sourceList.filter((e) => {
      if (activeCategory === "all") {
        return true;
      }
      const cat = getExamCategory(e);
      return cat.id === activeCategory;
    });
  }, [sourceList, activeCategory]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <PublicNavbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-blue-50/60 via-white to-slate-50 pb-20 pt-16 text-slate-900 transition-colors dark:border-slate-800/80 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white sm:pb-28 sm:pt-20">
          {/* Ambient Glows */}
          <div className="pointer-events-none absolute left-1/2 top-1/4 h-[350px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[100px] dark:bg-blue-600/20" />
          <div className="pointer-events-none absolute bottom-0 right-10 h-[250px] w-[350px] rounded-full bg-amber-500/10 blur-[100px] dark:bg-amber-600/15" />

          <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 shadow-sm backdrop-blur-md dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200 sm:text-sm">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>{t.heroBadge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="mx-auto mt-6 max-w-4xl text-balance text-3xl font-black leading-[1.2] tracking-tight sm:text-5xl lg:text-6xl">
              {t.heroTitlePrefix}{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-sky-300 dark:to-amber-400">
                {t.heroTitleHighlight}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-5 max-w-2xl text-balance text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
              {t.heroSubtitle}
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-500 active:scale-95 sm:px-7 sm:py-4 sm:text-base"
              >
                <GraduationCap className="h-5 w-5" />
                <span>{t.heroCtaMock}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/coaching/register"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800 sm:px-7 sm:py-4 sm:text-base"
              >
                <Building2 className="h-5 w-5 text-amber-500" />
                <span>{t.heroCtaCoaching}</span>
              </Link>
            </div>

            {/* Stats Bar */}
            <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 border-t border-slate-200 pt-8 text-center dark:border-slate-800 sm:grid-cols-4">
              <div className="rounded-2xl bg-white/70 p-3 shadow-sm dark:bg-slate-900/60">
                <div className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
                  {t.statQuestions}
                </div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {t.statQuestionsLabel}
                </div>
              </div>
              <div className="rounded-2xl bg-white/70 p-3 shadow-sm dark:bg-slate-900/60">
                <div className="text-xl font-black text-amber-600 dark:text-amber-400 sm:text-2xl">
                  {t.statPattern}
                </div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {t.statPatternLabel}
                </div>
              </div>
              <div className="rounded-2xl bg-white/70 p-3 shadow-sm dark:bg-slate-900/60">
                <div className="text-xl font-black text-blue-600 dark:text-blue-400 sm:text-2xl">
                  {t.statSpeed}
                </div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {t.statSpeedLabel}
                </div>
              </div>
              <div className="rounded-2xl bg-white/70 p-3 shadow-sm dark:bg-slate-900/60">
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 sm:text-2xl">
                  {t.statSecurity}
                </div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {t.statSecurityLabel}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MOCK TESTS SECTION */}
        <section id="exams" className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
                {t.mockTestsTitle} ({displayExams.length} उपलब्ध परीक्षा)
              </h2>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                {t.mockTestsSubtitle}
              </p>
            </div>

            {/* Category Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {categories.map((c) => {
                const isActive = activeCategory === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveCategory(c.id)}
                    className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-xs font-bold leading-none transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Exams Grid */}
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayExams.map((exam) => {
                const title =
                  exam.titleMr || exam.title || (language === "mr" ? exam.titleMr : exam.titleEn);
                const qCount = exam.totalQuestions || exam.questions || 100;
                const duration = exam.durationMinutes || exam.duration || 90;
                const totalMarks = exam.totalMarks || exam.marks || 100;
                const isPyq =
                  exam.slug?.includes("pyq") ||
                  exam.title?.includes("PYQ") ||
                  exam.title?.includes("मूळ");
                const badgeText = isPyq
                  ? "अधिकृत PYQ 100 Qs"
                  : exam.badgeMr
                    ? language === "mr"
                      ? exam.badgeMr
                      : exam.badgeEn
                    : "100% मोफत Live";
                const badgeColor = isPyq
                  ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700"
                  : exam.badgeColor ||
                    "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700";

                return (
                  <div
                    key={exam.id || exam.slug}
                    className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
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

                      <h3 className="mt-4 text-base font-black leading-snug text-slate-900 dark:text-white line-clamp-2">
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
                        href={`/exam/${exam.slug || exam.id}`}
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

        {/* FEATURES SECTION */}
        <section
          id="features"
          className="border-y border-slate-200/80 bg-slate-100/50 py-16 dark:border-slate-800/80 dark:bg-slate-900/50 sm:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
                {t.featuresTitle}
              </h2>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                {t.featuresSubtitle}
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <Layers3 className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">
                  {t.feat1Title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {t.feat1Desc}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">
                  {t.feat2Title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {t.feat2Desc}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                  <Trophy className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">
                  {t.feat3Title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {t.feat3Desc}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">
                  {t.feat4Title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {t.feat4Desc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FOR COACHING INSTITUTES */}
        <section id="coaching" className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-amber-50/40 to-slate-50 p-8 shadow-sm dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-900 dark:via-amber-950/30 dark:to-slate-900 sm:p-12">
              <div className="grid items-center gap-8 lg:grid-cols-2">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-800 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>कोचिंग क्लासेस व अकॅडेमी पार्टनर</span>
                  </div>

                  <h2 className="mt-4 text-2xl font-black leading-tight text-slate-900 dark:text-white sm:text-3xl">
                    {t.coachingTitle}
                  </h2>
                  <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
                    {t.coachingSubtitle}
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 sm:text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>{t.coachFeat1}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 sm:text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>{t.coachFeat2}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 sm:text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>{t.coachFeat3}</span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Link
                      href="/coaching/register"
                      className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-6 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-amber-500 active:scale-95"
                    >
                      <Building2 className="h-4 w-4" />
                      <span>{t.coachRegisterBtn}</span>
                    </Link>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        अकॅडेमी डॅशबोर्ड
                      </div>
                      <div className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                        विद्यार्थी व बॅच व्यवस्थापन प्रणाली
                      </div>
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        स्वयंचलित निकाल आणि WhatsApp वर थेट निकाल पाठवण्याची सुविधा.
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        ऑनलाईन प्रश्नपत्रिका निर्मिती
                      </div>
                      <div className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                        Paper Builder & Bulk CSV Import
                      </div>
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        ५ मिनिटांत १०० गुणांची TCS पॅटर्न प्रश्नपत्रिका तयार करा.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section
          id="pricing"
          className="border-t border-slate-200/80 bg-slate-100/50 py-16 dark:border-slate-800/80 dark:bg-slate-900/50 sm:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
                {t.pricingTitle}
              </h2>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                {t.pricingSubtitle}
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {/* Free Plan */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {t.planFreeTitle}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {t.planFreePrice}
                  </span>
                  <span className="text-xs text-slate-500">{t.planFreePeriod}</span>
                </div>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>सर्व मोफत मॉक टेस्ट्स</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>त्वरित निकाल व गुण</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>मराठी व इंग्रजी प्रश्न</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link
                    href="/register"
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {t.choosePlan}
                  </Link>
                </div>
              </div>

              {/* Student Pro Plan */}
              <div className="relative rounded-3xl border-2 border-blue-600 bg-white p-6 shadow-lg dark:bg-slate-900">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-[10px] font-black text-white">
                  POPULAR
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {t.planStudentTitle}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                    {t.planStudentPrice}
                  </span>
                  <span className="text-xs text-slate-500">{t.planStudentPeriod}</span>
                </div>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span>अमर्यादित सर्व प्रीमियम टेस्ट्स</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span>राज्यस्तरीय रँक व प्रगत विश्लेषण</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span>सविस्तर उत्तरे व स्पष्टीकरण</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link
                    href="/register"
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-500"
                  >
                    {t.choosePlan}
                  </Link>
                </div>
              </div>

              {/* Coaching Plan */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {t.planCoachingTitle}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
                    {t.planCoachingPrice}
                  </span>
                  <span className="text-xs text-slate-500">{t.planCoachingPeriod}</span>
                </div>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-500" />
                    <span>अमर्यादित विद्यार्थी व बॅचेस</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-500" />
                    <span>स्वतःच्या प्रश्नपत्रिका व प्रश्न बँक</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-500" />
                    <span>अकॅडेमी ब्रँडिंग व विश्लेषण</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link
                    href="/coaching/register"
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-500/20 dark:text-amber-400"
                  >
                    {t.choosePlan}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQS SECTION */}
        <section id="faq" className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
                {t.faqTitle}
              </h2>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                {t.faqSubtitle}
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {faqsData.map((faq, idx) => {
                const isOpen = openFaq === idx;
                const questionText = language === "mr" ? faq.qMr : faq.qEn;
                const answerText = language === "mr" ? faq.aMr : faq.aEn;

                return (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between p-4 text-left text-xs font-bold text-slate-900 transition hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800/60 sm:text-sm"
                    >
                      <span>{questionText}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-blue-600" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-slate-100 bg-slate-50/50 p-4 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-300">
                        {answerText}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
