"use client";

import Link from "next/link";
import { Building2, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useAuth } from "@/components/auth-provider";

export function CoachingSection() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const isCoaching = user?.role === "COACHING_ADMIN" || user?.role === "TEACHER";

  return (
    <section id="coaching" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-amber-50/40 to-slate-50 p-8 shadow-sm transition-colors dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-900 dark:via-amber-950/30 dark:to-slate-900 sm:p-12">
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
                  href={isCoaching ? "/coaching/dashboard" : "/coaching/register"}
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-6 py-3.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-500 active:scale-95 sm:text-sm"
                >
                  <Building2 className="h-4 w-4" />
                  <span>{isCoaching ? "अकॅडेमी डॅशबोर्ड उघडा" : t.coachRegisterBtn}</span>
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
  );
}

