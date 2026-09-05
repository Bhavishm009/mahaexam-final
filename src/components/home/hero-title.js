"use client";

import { useLanguage } from "@/components/language-provider";
import { Sparkles } from "lucide-react";

export function HeroTitle() {
  const { t } = useLanguage();

  return (
    <>
      <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-300">
        <Sparkles className="h-3.5 w-3.5 animate-pulse text-amber-500" />
        <span>{t.heroBadge}</span>
      </div>

      <h1 className="mx-auto mt-6 max-w-4xl text-balance text-3xl font-black leading-[1.2] tracking-tight sm:text-5xl lg:text-6xl">
        {t.heroTitlePrefix}{" "}
        <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-sky-300 dark:to-amber-400">
          {t.heroTitleHighlight}
        </span>
      </h1>

      <p className="mx-auto mt-5 max-w-2xl text-balance text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
        {t.heroSubtitle}
      </p>
    </>
  );
}
