"use client";

import { useLanguage } from "@/components/language-provider";

export function HeroStatsBanner() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 border-t border-slate-200/80 pt-8 text-center dark:border-slate-800/80 sm:grid-cols-4">
      <div className="glass-card p-3.5 shadow-sm transition-transform hover:scale-105">
        <div className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
          {t.statQuestions}
        </div>
        <div className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-300">
          {t.statQuestionsLabel}
        </div>
      </div>
      <div className="glass-card p-3.5 shadow-sm transition-transform hover:scale-105">
        <div className="text-xl font-black text-amber-500 dark:text-amber-400 sm:text-2xl">
          {t.statPattern}
        </div>
        <div className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-300">
          {t.statPatternLabel}
        </div>
      </div>
      <div className="glass-card p-3.5 shadow-sm transition-transform hover:scale-105">
        <div className="text-xl font-black text-sky-500 dark:text-sky-400 sm:text-2xl">
          {t.statBilingual}
        </div>
        <div className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-300">
          {t.statBilingualLabel}
        </div>
      </div>
      <div className="glass-card p-3.5 shadow-sm transition-transform hover:scale-105">
        <div className="text-xl font-black text-emerald-500 dark:text-emerald-400 sm:text-2xl">
          {t.statPrice}
        </div>
        <div className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-300">
          {t.statPriceLabel}
        </div>
      </div>
    </div>
  );
}
