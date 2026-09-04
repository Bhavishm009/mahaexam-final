"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useAuth } from "@/components/auth-provider";

export function PricingSection() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const isStudent = user?.role === "STUDENT";
  const isCoaching = user?.role === "COACHING_ADMIN" || user?.role === "TEACHER";

  return (
    <section id="pricing" className="border-t border-slate-200/80 bg-slate-100/50 py-16 transition-colors dark:border-slate-800/80 dark:bg-slate-950/40 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            {t.pricingTitle}
          </h2>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            {t.pricingSubtitle}
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {/* Free Plan */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {t.planFreeTitle}
            </h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {t.planFreePrice}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{t.planFreePeriod}</span>
            </div>
            <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>सर्व मोफत बेसिक मॉक टेस्ट्स</span>
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
                href={user ? "/student/exams" : "/register"}
                className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {user ? "परीक्षा पहा (View Exams)" : t.choosePlan}
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
              <span className="text-xs text-slate-500 dark:text-slate-400">{t.planStudentPeriod}</span>
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
                href={user ? (isStudent ? "/student/exams" : "/dashboard") : "/register"}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-500 active:scale-95"
              >
                {user ? "सराव सुरू करा (Start Practice)" : t.choosePlan}
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
              <span className="text-xs text-slate-500 dark:text-slate-400">{t.planCoachingPeriod}</span>
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
                href={isCoaching ? "/coaching/subscription" : "/coaching/register"}
                className="inline-flex w-full items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-500/20 active:scale-95 dark:text-amber-400"
              >
                {isCoaching ? "सबस्क्रिप्शन व्यवस्थापन" : t.choosePlan}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

