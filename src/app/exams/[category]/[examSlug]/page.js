import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { getCategoryBySlug } from "@/lib/exam-category-helper";
import { prisma } from "@/lib/db";
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
  BookOpen,
} from "lucide-react";

export async function generateMetadata({ params }) {
  const { category, examSlug } = await params;
  const cat = getCategoryBySlug(category);

  let examTitle = examSlug.replace(/-/g, " ");
  try {
    const dbExam = await prisma.exam.findFirst({
      where: { OR: [{ slug: examSlug }, { id: examSlug }] },
      select: { title: true },
    });
    if (dbExam?.title) examTitle = dbExam.title;
  } catch {}

  return {
    title: `${examTitle} | ${cat?.titleMr || "ऑनलाइन सराव परीक्षा"} — MahaExam`,
    description: `महाराष्ट्र ${cat?.titleMr || "स्पर्धा परीक्षा"} TCS/IBPS पॅटर्न ऑनलाईन मॉक टेस्ट. १०० गुणांचे सराव पेपर्स, वेळ व अचूकता विश्लेषण.`,
    openGraph: {
      title: `${examTitle} — MahaExam`,
      description: `TCS/IBPS पॅटर्न सराव परीक्षा. त्वरित निकाल व रँक.`,
      type: "article",
    },
  };
}

export default async function ExamSlugDetailPage({ params }) {
  const { category, examSlug } = await params;
  const cat = getCategoryBySlug(category);

  let dbExam = null;
  try {
    dbExam = await prisma.exam.findFirst({
      where: {
        OR: [{ slug: examSlug }, { id: examSlug }],
      },
      include: {
        organization: { select: { name: true } },
        questions: { take: 1, select: { id: true } },
      },
    });
  } catch {}

  const exam = dbExam
    ? {
        id: dbExam.id,
        slug: dbExam.slug || dbExam.id,
        title: dbExam.title,
        titleMr: dbExam.title,
        questions: dbExam.totalQuestions || dbExam.questions?.length || 100,
        duration: dbExam.durationMinutes || 90,
        marks: dbExam.totalMarks || 100,
        negativeMarks: dbExam.negativeMarks > 0 ? `${dbExam.negativeMarks} गुण` : "०.२५ (1/4th)",
        language: "मराठी व इंग्रजी",
        pattern: dbExam.organization ? dbExam.organization.name : "TCS / IBPS पॅटर्न",
        isFree: dbExam.isFree,
        price: dbExam.price,
      }
    : {
        id: examSlug,
        slug: examSlug,
        title: examSlug.replace(/-/g, " ").toUpperCase(),
        titleMr: `${cat.badgeMr} सराव प्रश्नपत्रिका (${examSlug})`,
        questions: 100,
        duration: 90,
        marks: 100,
        negativeMarks: "०.२५ (1/4th)",
        language: "मराठी व इंग्रजी",
        pattern: "TCS / IBPS ऑनलाइन संगणक परीक्षा (CBT)",
        isFree: true,
        price: 0,
      };

  const session = await verifySessionToken((await cookies()).get(COOKIE)?.value);
  const isPrivilegedUser =
    session && ["SUPER_ADMIN", "COACHING_ADMIN", "TEACHER"].includes(session.role);

  const startUrl = `/exams/${category}/${exam.slug || exam.id}/start`;
  const testUrl = `/exams/${category}/${exam.slug || exam.id}/test`;

  return (
    <div className="flex min-h-screen flex-col justify-between bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <PublicNavbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Admin Review Banner */}
        {isPrivilegedUser && (
          <div className="mb-6 flex flex-col justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50/90 p-4 shadow-sm dark:border-blue-900/60 dark:bg-blue-950/70 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-blue-900 dark:text-blue-300">
                  Preview Mode ({session.role})
                </div>
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  शिक्षक व प्रशासक म्हणून आपण या परीक्षेची सर्व उत्तरे व स्पष्टीकरणे तपासू शकता.
                </p>
              </div>
            </div>

            <Link
              href={`/exam/${exam.slug || exam.id}/review`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500 active:scale-95"
            >
              <Eye className="h-4 w-4" />
              <span>🔍 प्रश्न व उत्तरे तपासा (Review Keys)</span>
            </Link>
          </div>
        )}

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link href="/" prefetch={true} className="transition hover:text-blue-600 dark:hover:text-white">
            मुख्यपृष्ठ
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/exams" prefetch={true} className="transition hover:text-blue-600 dark:hover:text-white">
            सर्व परीक्षा
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/exams/${category}`} prefetch={true} className="transition hover:text-blue-600 dark:hover:text-white">
            {cat.badgeMr}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-bold text-blue-600 dark:text-blue-400 truncate max-w-[200px]">
            {exam.titleMr}
          </span>
        </nav>

        {/* Hero Details Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${cat.badgeColor}`}>
                  {cat.badgeMr}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  मोफत ऑनलाईन परीक्षा
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

              {/* Exam Stats */}
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
                  <div className="mt-1.5 text-base font-black text-slate-900 dark:text-white">
                    {exam.negativeMarks}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Box */}
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
                  <div className="text-xs text-slate-500 dark:text-slate-400">शुल्क:</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                      {exam.isFree !== false ? "मोफत (Free)" : `₹${exam.price}`}
                    </span>
                  </div>
                </div>

                <ul className="mt-6 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>अस्सल TCS/IBPS संगणकीय इंटरफेस</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>त्वरित सविस्तर निकाल व रँकिंग</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>अचूकता व वेळ व्यवस्थापन चार्ट</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <Link
                  href={startUrl}
                  prefetch={true}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-500 active:scale-95"
                >
                  <Zap className="h-4 w-4 text-amber-300" />
                  <span>सराव चाचणी सुरू करा (Start Exam)</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href={testUrl}
                  prefetch={true}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span>थेट टेस्ट स्क्रीनवर जा (Direct CBT)</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Syllabus Distribution */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>विषयवार गुण विभागणी (Subject Weightage)</span>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">मराठी भाषा व व्याकरण</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">२५ प्रश्न</div>
                </div>
                <div className="text-sm font-black text-blue-600 dark:text-blue-400">२५ गुण</div>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">अंकगणित व बुद्धिमत्ता चाचणी</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">५० प्रश्न</div>
                </div>
                <div className="text-sm font-black text-blue-600 dark:text-blue-400">५० गुण</div>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">सामान्य ज्ञान व चालू घडामोडी</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">२५ प्रश्न</div>
                </div>
                <div className="text-sm font-black text-blue-600 dark:text-blue-400">२५ गुण</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              <span>परीक्षेचे महत्त्वाचे नियम</span>
            </div>

            <ul className="mt-6 space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-100 text-[10px] font-black text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                  १
                </span>
                <span>परीक्षेचा टायमर स्क्रीनवर सुरू राहील. वेळ संपल्यावर टेस्ट आपोआप सबमिट होईल.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-100 text-[10px] font-black text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                  २
                </span>
                <span>टॅब स्विच करणे किंवा स्क्रीन लहान करणे टाळा.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-100 text-[10px] font-black text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                  ३
                </span>
                <span>उत्तर जतन करण्यासाठी &quot;Save & Next&quot; बटनाचा वापर करा.</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
