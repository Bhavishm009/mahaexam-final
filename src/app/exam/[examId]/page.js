import Link from "next/link";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import {
  Clock,
  HelpCircle,
  Award,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  FileText,
  ChevronRight,
  Zap,
  Eye,
  FileCheck2,
} from "lucide-react";
import { prisma } from "@/lib/db";

const examDetailsMap = {
  "police-01": {
    id: "police-01",
    title: "Maharashtra Police Bharti Full Mock Test 01",
    titleMr: "महाराष्ट्र पोलीस भरती सराव प्रश्नपत्रिका ०१",
    category: "Police Bharti",
    categoryMr: "पोलीस भरती",
    questions: 100,
    duration: 90,
    marks: 100,
    negativeMarks: "०.२५ (1/4th)",
    language: "मराठी",
    pattern: "Maharashtra Police Selection Board (TCS Pattern)",
    subjects: [
      { name: "मराठी व्याकरण (Marathi Grammar)", count: 25, marks: 25 },
      { name: "अंकगणित व बुद्धिमत्ता (Maths & Reasoning)", count: 50, marks: 50 },
      { name: "सामान्य ज्ञान व चालू घडामोडी (GK & Current Affairs)", count: 25, marks: 25 },
    ],
  },
  "mpsc-01": {
    id: "mpsc-01",
    title: "MPSC Rajyaseva GS Paper 1 Comprehensive Test",
    titleMr: "एमपीएससी राज्यसेवा सामान्य अध्ययन पेपर १ सराव चाचणी",
    category: "MPSC",
    categoryMr: "एमपीएससी",
    questions: 100,
    duration: 120,
    marks: 200,
    negativeMarks: "०.२५ (1/4th)",
    language: "मराठी",
    pattern: "MPSC State Services Prelims Exam Pattern",
    subjects: [
      { name: "महाराष्ट्र व भारताचा इतिहास (History)", count: 15, marks: 30 },
      { name: "महाराष्ट्र व भारताचा भूगोल (Geography)", count: 15, marks: 30 },
      { name: "भारतीय राज्यघटना व पंचायत राज (Polity)", count: 20, marks: 40 },
      { name: "अर्थव्यवस्था व नियोजन (Economics)", count: 15, marks: 30 },
      { name: "सामान्य विज्ञान व तंत्रज्ञान (Science)", count: 20, marks: 40 },
      { name: "चालू घडामोडी (Current Affairs)", count: 15, marks: 30 },
    ],
  },
  "talathi-01": {
    id: "talathi-01",
    title: "Talathi Bharti Special Practice Test Series 2026",
    titleMr: "तलाठी भरती विशेष ऑनलाइन सराव परीक्षा २०२६",
    category: "Talathi",
    categoryMr: "तलाठी भरती",
    questions: 100,
    duration: 120,
    marks: 200,
    negativeMarks: "नाही (None)",
    language: "मराठी",
    pattern: "TCS / IBPS Online Exam Pattern",
    subjects: [
      { name: "मराठी भाषा (Marathi)", count: 25, marks: 50 },
      { name: "इंग्रजी व्याकरण (English)", count: 25, marks: 50 },
      { name: "सामान्य ज्ञान (General Knowledge)", count: 25, marks: 50 },
      { name: "बौद्धिक चाचणी व अंकगणित (Aptitude)", count: 25, marks: 50 },
    ],
  },
  "zp-01": {
    id: "zp-01",
    title: "Zilla Parishad Arogya Sevak Full Length Test",
    titleMr: "जिल्हा परिषद आरोग्य सेवक / सेविका सराव चाचणी",
    category: "Zilla Parishad",
    categoryMr: "जिल्हा परिषद भरती",
    questions: 100,
    duration: 90,
    marks: 200,
    negativeMarks: "०.२५",
    language: "मराठी",
    pattern: "IBPS Maharashtra ZP CBT Pattern",
    subjects: [
      { name: "मराठी व इंग्रजी (Languages)", count: 30, marks: 60 },
      { name: "सामान्य ज्ञान व बुद्धिमत्ता (GK & Reasoning)", count: 30, marks: 60 },
      { name: "आरोग्य व तांत्रिक विषय (Technical / Health)", count: 40, marks: 80 },
    ],
  },
  "vanrakshak-01": {
    id: "vanrakshak-01",
    title: "Vanrakshak (Forest Guard) CBT Exam Simulator",
    titleMr: "वनरक्षक भरती ऑनलाइन संगणकीय सराव चाचणी",
    category: "Saralseva",
    categoryMr: "सरळसेवा भरती",
    questions: 60,
    duration: 90,
    marks: 120,
    negativeMarks: "०.५०",
    language: "मराठी",
    pattern: "TCS Online Exam Pattern",
    subjects: [
      { name: "मराठी व्याकरण (Marathi)", count: 15, marks: 30 },
      { name: "इंग्रजी व्याकरण (English)", count: 15, marks: 30 },
      { name: "सामान्य ज्ञान व पर्यावरण (GK & Forest)", count: 15, marks: 30 },
      { name: "बौद्धिक चाचणी (Reasoning)", count: 15, marks: 30 },
    ],
  },
  "police-02": {
    id: "police-02",
    title: "Maharashtra Police GK & Marathi Grammar Focus",
    titleMr: "पोलीस भरती सामान्य ज्ञान व मराठी व्याकरण विशेष चाचणी",
    category: "Police Bharti",
    categoryMr: "पोलीस भरती",
    questions: 50,
    duration: 45,
    marks: 50,
    negativeMarks: "०.२५",
    language: "मराठी",
    pattern: "Maharashtra Police Syllabus",
    subjects: [
      { name: "मराठी व्याकरण (Marathi Grammar)", count: 25, marks: 25 },
      { name: "सामान्य ज्ञान (General Knowledge)", count: 25, marks: 25 },
    ],
  },
};

export default async function ExamPublicPage({ params }) {
  const { examId } = await params;

  let dbExam = null;
  try {
    dbExam = await prisma.exam.findFirst({
      where: {
        OR: [{ id: examId }, { slug: examId }],
      },
      include: {
        organization: { select: { name: true } },
        questions: {
          take: 1,
          select: { id: true },
        },
      },
    });
  } catch {}

  const staticExam = examDetailsMap[examId];
  const exam = dbExam
    ? {
        id: dbExam.id,
        slug: dbExam.slug || dbExam.id,
        title: dbExam.title,
        titleMr: dbExam.title,
        category: dbExam.examType || "Competitive Exam",
        categoryMr: dbExam.examType || "स्पर्धा परीक्षा",
        questions: dbExam.totalQuestions || dbExam.questions?.length || 25,
        duration: dbExam.durationMinutes || 90,
        marks: dbExam.totalMarks || 100,
        negativeMarks: dbExam.negativeMarks > 0 ? `${dbExam.negativeMarks} गुण` : "नाही (शून्य)",
        language: "मराठी",
        isFree: dbExam.isFree,
        price: dbExam.price,
        pattern: dbExam.organization
          ? `${dbExam.organization.name} टेस्ट सिरीज`
          : "TCS/IBPS ऑनलाइन संगणक परीक्षा (CBT)",
        subjects: staticExam?.subjects || [
          { name: "मराठी भाषा व व्याकरण", count: 25, marks: 25 },
          { name: "सामान्य ज्ञान व चालू घडामोडी", count: 25, marks: 25 },
          { name: "अंकगणित व बुद्धिमत्ता चाचणी", count: 25, marks: 25 },
        ],
      }
    : staticExam || {
        id: examId,
        slug: examId,
        title: `Maharashtra Competitive Exam (${examId})`,
        titleMr: `महाराष्ट्र स्पर्धा परीक्षा सराव चाचणी (${examId})`,
        category: "Mock Test",
        categoryMr: "सराव चाचणी",
        questions: 50,
        duration: 45,
        marks: 100,
        negativeMarks: "०.२५",
        language: "मराठी",
        pattern: "TCS/IBPS ऑनलाइन संगणक परीक्षा (CBT)",
        subjects: [
          { name: "मराठी व इंग्रजी भाषा", count: 20, marks: 40 },
          { name: "सामान्य ज्ञान", count: 15, marks: 30 },
          { name: "अंकगणित व बुद्धिमत्ता", count: 15, marks: 30 },
        ],
      };

  const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  const isPrivilegedUser =
    session && ["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(session.role);

  return (
    <div className="flex min-h-screen flex-col justify-between bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <PublicNavbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Admin/Teacher Review Banner */}
        {isPrivilegedUser && (
          <div className="mb-6 flex flex-col justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50/90 p-4 shadow-sm dark:border-blue-900/60 dark:bg-blue-950/70 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-blue-900 dark:text-blue-300">
                  {session.role === "SUPER_ADMIN"
                    ? "👑 Super Admin Preview Mode"
                    : "👨‍🏫 Faculty / Coaching Admin Preview Mode"}
                </div>
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  You are previewing this examination as an Administrator / Faculty. You can inspect all questions, correct answers, and manage schedules.
                </p>
              </div>
            </div>

            <Link
              href={`/exam/${exam.slug || exam.id}/review`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500 active:scale-95"
            >
              <Eye className="h-4 w-4" />
              <span>🔍 Review All Questions &amp; Answer Keys (प्रश्नांची पडताळणी)</span>
            </Link>
          </div>
        )}

        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link href="/" className="transition hover:text-blue-600 dark:hover:text-white">
            मुख्यपृष्ठ
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/#exams" className="transition hover:text-blue-600 dark:hover:text-white">
            सराव परीक्षा
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-blue-600 dark:text-blue-400">{exam.categoryMr}</span>
        </div>

        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                  {exam.categoryMr}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  मोफत ऑनलाइन परीक्षा
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {exam.language}
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-black leading-tight text-slate-900 dark:text-white sm:text-3xl">
                {exam.titleMr}
              </h1>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                परीक्षेचा पॅटर्न:{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {exam.pattern}
                </span>
              </p>

              {/* Key Exam Stats Grid */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>एकूण प्रश्न</span>
                  </div>
                  <div className="mt-1.5 text-2xl font-black text-slate-900 dark:text-white">
                    {exam.questions}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>वेळ मर्यादा</span>
                  </div>
                  <div className="mt-1.5 text-2xl font-black text-slate-900 dark:text-white">
                    {exam.duration}{" "}
                    <span className="text-xs font-normal text-slate-500">मिनिटे</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span>एकूण गुण</span>
                  </div>
                  <div className="mt-1.5 text-2xl font-black text-slate-900 dark:text-white">
                    {exam.marks}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    <span>निगेटिव्ह गुण</span>
                  </div>
                  <div className="mt-1.5 text-lg font-black text-slate-900 dark:text-white">
                    {exam.negativeMarks}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Start Card */}
            <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    CBT सिम्युलेटर
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                    उपलब्ध
                  </span>
                </div>

                <div className="mt-6">
                  <div className="text-xs text-slate-500 dark:text-slate-400">प्रवेश शुल्क:</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                      {exam.isFree !== false ? "मोफत (Free)" : `₹${exam.price}`}
                    </span>
                  </div>
                </div>

                <ul className="mt-6 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>अस्सल TCS/IBPS परीक्षा स्क्रीन</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>त्वरित निकाल व रँक</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>सविस्तर उत्तरे व विश्लेषण</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href={`/exam/${exam.slug || exam.id}/attempt`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-500 active:scale-95"
                >
                  <Zap className="h-4 w-4 text-amber-300" />
                  <span>आता परीक्षा सुरू करा</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Exam Syllabus & Subject Breakdown */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Subject Distribution */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>विषयवार गुण विभागणी (Subject Weightage)</span>
            </div>

            <div className="mt-6 space-y-3">
              {exam.subjects.map((sub, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {sub.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {sub.count} प्रश्न
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-blue-600 dark:text-blue-400">
                      {sub.marks} गुण
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exam Rules & Instructions */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              <span>परीक्षेचे महत्त्वाचे नियम व सूचना</span>
            </div>

            <ul className="mt-6 space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-100 text-[10px] font-black text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                  १
                </span>
                <span>परीक्षा सुरू होताच टायमर सुरू होईल. वेळेचे काटेकोर पालन करा.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-100 text-[10px] font-black text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                  २
                </span>
                <span>
                  परीक्षेदरम्यान इतर टॅब उघडल्यास चेतावणी दिली जाईल आणि परीक्षा आपोआप सबमिट होऊ
                  शकते.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-100 text-[10px] font-black text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                  ३
                </span>
                <span>
                  प्रत्येक प्रश्नाचे उत्तर जतन करण्यासाठी{" "}
                  <strong>&ldquo;जतन करा आणि पुढे जा&rdquo;</strong> बटनाचा वापर करा.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-100 text-[10px] font-black text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                  ४
                </span>
                <span>
                  परीक्षा संपल्यानंतर लगेचच तुमचा सविस्तर निकाल व उत्तरतालिका उपलब्ध होईल.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
