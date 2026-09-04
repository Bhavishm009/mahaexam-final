"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { getCategoryBySlug } from "@/lib/exam-category-helper";
import {
  Shield,
  CheckCircle2,
  Clock,
  HelpCircle,
  Award,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Globe,
  Monitor,
  Zap,
} from "lucide-react";

export default function ExamStartInstructionsPage({ params }) {
  const resolvedParams = use(params);
  const { category, examSlug } = resolvedParams;
  const router = useRouter();
  const cat = getCategoryBySlug(category);

  const [agreed, setAgreed] = useState(false);
  const [selectedLang, setSelectedLang] = useState("mr");

  const testUrl = `/exams/${category}/${examSlug}/test`;

  const handleStartExam = () => {
    if (!agreed) return;
    router.push(testUrl);
  };

  const formattedExamTitle = examSlug.replace(/-/g, " ").toUpperCase();

  return (
    <div className="flex min-h-screen flex-col justify-between bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <PublicNavbar />

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link href="/" prefetch={true} className="transition hover:text-blue-600 dark:hover:text-white">
            मुख्यपृष्ठ
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/exams/${category}`} prefetch={true} className="transition hover:text-blue-600 dark:hover:text-white">
            {cat.badgeMr}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/exams/${category}/${examSlug}`} prefetch={true} className="transition hover:text-blue-600 dark:hover:text-white truncate max-w-[150px]">
            {formattedExamTitle}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-bold text-blue-600 dark:text-blue-400">परीक्षेच्या सूचना</span>
        </nav>

        {/* Card Wrapper */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
          <div className="border-b border-slate-100 pb-6 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${cat.badgeColor}`}>
                {cat.badgeMr}
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                CBT संगणकीय परीक्षा
              </span>
            </div>

            <h1 className="mt-4 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              ऑनलाइन सराव परीक्षा सूचना व नियम
            </h1>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              कृपया परीक्षा सुरू करण्यापूर्वी खालील सर्व सूचना काळजीपूर्वक वाचा.
            </p>
          </div>

          {/* Quick Summary Grid */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                <span>एकूण प्रश्न</span>
              </div>
              <div className="mt-1 text-xl font-black text-slate-900 dark:text-white">१००</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="h-4 w-4 text-emerald-600" />
                <span>वेळ मर्यादा</span>
              </div>
              <div className="mt-1 text-xl font-black text-slate-900 dark:text-white">९० मिनिटे</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Award className="h-4 w-4 text-amber-600" />
                <span>एकूण गुण</span>
              </div>
              <div className="mt-1 text-xl font-black text-slate-900 dark:text-white">१००</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <span>निगेटिव्ह गुण</span>
              </div>
              <div className="mt-1 text-base font-black text-slate-900 dark:text-white">०.२५ (1/4)</div>
            </div>
          </div>

          {/* Detailed Instructions */}
          <div className="mt-8 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              परीक्षेचे नियम (General Instructions):
            </h2>
            <ul className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>परीक्षेचा कालावधी ९० मिनिटे आहे. टायमर स्क्रीनच्या उजव्या बाजूला दिसेल.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>प्रत्येक बरोबर उत्तरासाठी १ गुण मिळेल. चुकीच्या उत्तरासाठी ०.२५ गुण वजा केले जातील.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>उत्तर सेव्ह करण्यासाठी नेहमी <strong>&quot;Save & Next&quot;</strong> बटनावर क्लिक करा.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>परीक्षेदरम्यान इतर कोणतेही ब्राउझर टॅब किंवा विंडो उघडू नका.</span>
              </li>
            </ul>
          </div>

          {/* Language Selection */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
            <label className="block text-xs font-bold text-slate-900 dark:text-white">
              माध्यम निवडा (Select Default Medium):
            </label>
            <div className="mt-3 flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="radio"
                  name="lang"
                  value="mr"
                  checked={selectedLang === "mr"}
                  onChange={() => setSelectedLang("mr")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>मराठी (Marathi)</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="radio"
                  name="lang"
                  value="en"
                  checked={selectedLang === "en"}
                  onChange={() => setSelectedLang("en")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>English (इंग्रजी)</span>
              </label>
            </div>
          </div>

          {/* Agreement & Action */}
          <div className="mt-8 border-t border-slate-100 pt-6 dark:border-slate-800">
            <label className="flex cursor-pointer items-start gap-3 text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
              />
              <span className="font-semibold">
                मी सर्व सूचना व नियम काळजीपूर्वक वाचले आहेत आणि मला ते मान्य आहेत. मी प्रामाणिकपणे परीक्षा देईन.
              </span>
            </label>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Link
                href={`/exams/${category}/${examSlug}`}
                prefetch={true}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                रद्द करा (Cancel)
              </Link>

              <button
                type="button"
                disabled={!agreed}
                onClick={handleStartExam}
                className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-xs font-bold text-white shadow-lg transition active:scale-95 ${
                  agreed
                    ? "bg-blue-600 hover:bg-blue-500 shadow-blue-500/25"
                    : "cursor-not-allowed bg-slate-300 dark:bg-slate-800 opacity-60"
                }`}
              >
                <Zap className="h-4 w-4 text-amber-300" />
                <span>परीक्षा सुरू करा (Start Exam Now)</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
