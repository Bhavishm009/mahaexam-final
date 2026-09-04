"use client";

import { Layers3, ShieldCheck, Trophy, BarChart3 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export function FeaturesSection() {
  const { t } = useLanguage();

  return (
    <section
      id="features"
      className="border-y border-slate-200/80 bg-slate-100/50 py-16 transition-colors dark:border-slate-800/80 dark:bg-slate-950/40 sm:py-20"
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
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
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

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
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

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-amber-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
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

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-purple-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
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
  );
}

