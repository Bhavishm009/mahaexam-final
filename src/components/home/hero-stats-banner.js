"use client";

import { useLanguage } from "@/components/language-provider";

export function HeroStatsBanner() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 border-t border-slate-200 pt-8 text-center dark:border-slate-800 sm:grid-cols-4">
      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
          {t.statQuestions}
        </div>
        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {t.statQuestionsLabel}
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="text-xl font-black text-amber-600 dark:text-amber-400 sm:text-2xl">
          {t.statPattern}
        </div>
        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {t.statPatternLabel}
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="text-xl font-black text-blue-600 dark:text-blue-400 sm:text-2xl">
          {t.statBilingual}
        </div>
        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {t.statBilingualLabel}
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 sm:text-2xl">
          {t.statPrice}
        </div>
        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t.statPriceLabel}</div>
      </div>
    </div>
  );
}
