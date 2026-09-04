"use client";

import Link from "next/link";
import { ShieldCheck, Award, Globe, Heart, LogOut } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useAuth } from "@/components/auth-provider";

export function PublicFooter() {
  const { language } = useLanguage();
  const { user, logout } = useAuth();

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
      {/* Top Value Badges Banner */}
      <div className="border-b border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-8">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {language === "mr" ? "मराठी व इंग्रजी" : "Marathi & English"}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === "mr" ? "१००% दोन्ही भाषेत" : "100% Bilingual"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {language === "mr" ? "TCS / IBPS पॅटर्न" : "TCS / IBPS Pattern"}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === "mr" ? "नवीनतम अभ्यासक्रम" : "Latest Syllabus"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {language === "mr" ? "अँटी-चीट सुरक्षा" : "Anti-Cheat Guard"}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === "mr" ? "फुलस्क्रीन व टॅब लॉक" : "Fullscreen & Tab Lock"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                <div className="text-sm font-black text-purple-600 dark:text-purple-400">50K+</div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {language === "mr" ? "प्रश्न संच" : "Question Bank"}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === "mr" ? "सविस्तर स्पष्टीकरणासह" : "With Explanations"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="space-y-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-600 font-black text-white">
                M
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                Maha<span className="text-blue-600 dark:text-blue-400">Exam</span>
              </span>
            </Link>
            <p className="max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {language === "mr"
                ? "महाराष्ट्र पोलीस भरती, MPSC, तलाठी, जिल्हा परिषद आणि सर्व स्पर्धा परीक्षांसाठी महाराष्ट्रातील अग्रगण्य ऑनलाइन परीक्षा पोर्टल."
                : "Maharashtra’s leading examination portal for Police Bharti, MPSC, Talathi, Zilla Parishad, and competitive coaching institutes."}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Made with</span>
              <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
              <span>for Maharashtra Students</span>
            </div>
          </div>

          {/* Exams Column */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              {language === "mr" ? "मॉक टेस्ट्स व परीक्षा" : "Mock Tests & Exams"}
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link
                  href="/exams"
                  prefetch={true}
                  className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  {language === "mr" ? "सर्व २९+ मोफत टेस्ट्स →" : "All 29+ Free Tests →"}
                </Link>
              </li>
              <li>
                <Link
                  href="/exams?category=police"
                  prefetch={true}
                  className="transition hover:text-blue-600 dark:hover:text-white"
                >
                  {language === "mr" ? "महाराष्ट्र पोलीस भरती" : "Police Bharti 2026"}
                </Link>
              </li>
              <li>
                <Link
                  href="/exams?category=mpsc"
                  prefetch={true}
                  className="transition hover:text-blue-600 dark:hover:text-white"
                >
                  {language === "mr" ? "MPSC राज्यसेवा / संयुक्त" : "MPSC Rajyaseva / Combined"}
                </Link>
              </li>
              <li>
                <Link
                  href="/exams?category=talathi"
                  prefetch={true}
                  className="transition hover:text-blue-600 dark:hover:text-white"
                >
                  {language === "mr" ? "तलाठी भरती सराव" : "Talathi Bharti Mock Tests"}
                </Link>
              </li>
              <li>
                <Link
                  href="/exams?category=zp"
                  prefetch={true}
                  className="transition hover:text-blue-600 dark:hover:text-white"
                >
                  {language === "mr" ? "जिल्हा परिषद भरती" : "Zilla Parishad Recruitment"}
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs"
                  prefetch={true}
                  className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  {language === "mr" ? "भरती जाहिराती २०२६ 🔥" : "Govt Job Alerts 2026 🔥"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Coaching Column */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              {language === "mr" ? "प्लॅटफॉर्म व अकॅडेमी" : "Platform & Academy"}
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link
                  href="/features"
                  prefetch={true}
                  className="transition hover:text-blue-600 dark:hover:text-white"
                >
                  {language === "mr" ? "वैशिष्ट्ये (TCS/IBPS इंजिन)" : "Platform Features"}
                </Link>
              </li>
              <li>
                <Link
                  href="/for-coaching"
                  prefetch={true}
                  className="transition hover:text-blue-600 dark:hover:text-white"
                >
                  {language === "mr" ? "अकॅडेमी सोल्यूशन्स" : "For Coaching Institutes"}
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  prefetch={true}
                  className="transition hover:text-blue-600 dark:hover:text-white"
                >
                  {language === "mr" ? "किंमत व प्लॅन्स" : "Pricing & Plans"}
                </Link>
              </li>
              {user?.role === "COACHING_ADMIN" || user?.role === "TEACHER" ? (
                <>
                  <li>
                    <Link
                      href="/coaching/dashboard"
                      prefetch={true}
                      className="transition hover:text-blue-600 dark:hover:text-white"
                    >
                      {language === "mr" ? "अकॅडेमी डॅशबोर्ड" : "Coaching Dashboard"}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/coaching/exams"
                      prefetch={true}
                      className="transition hover:text-blue-600 dark:hover:text-white"
                    >
                      {language === "mr" ? "परीक्षा व्यवस्थापन" : "Manage Exams"}
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/coaching/register"
                      prefetch={true}
                      className="transition hover:text-blue-600 dark:hover:text-white"
                    >
                      {language === "mr" ? "नवीन अकॅडेमी नोंदणी" : "Register Academy"}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/coaching/login"
                      prefetch={true}
                      className="transition hover:text-blue-600 dark:hover:text-white"
                    >
                      {language === "mr" ? "अकॅडेमी संचालक लॉगिन" : "Academy Admin Login"}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Account & Legal Column */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              {language === "mr" ? "खाते व मदत" : "Account & Help"}
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              {user ? (
                <>
                  <li>
                    <Link
                      href={
                        user.role === "SUPER_ADMIN"
                          ? "/admin"
                          : user.role === "COACHING_ADMIN"
                            ? "/coaching/dashboard"
                            : "/student/dashboard"
                      }
                      prefetch={true}
                      className="transition hover:text-blue-600 dark:hover:text-white"
                    >
                      {language === "mr" ? "माझा डॅशबोर्ड" : "My Dashboard"}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={
                        user.role === "SUPER_ADMIN"
                          ? "/admin/profile"
                          : user.role === "COACHING_ADMIN"
                            ? "/coaching/profile"
                            : "/student/profile"
                      }
                      prefetch={true}
                      className="transition hover:text-blue-600 dark:hover:text-white"
                    >
                      {language === "mr" ? "माझे प्रोफाइल" : "My Profile"}
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={logout}
                      className="inline-flex items-center gap-1 text-rose-600 transition hover:underline dark:text-rose-400"
                    >
                      <LogOut className="h-3 w-3" />
                      <span>{language === "mr" ? "लॉगआउट" : "Sign Out"}</span>
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/login"
                      prefetch={true}
                      className="transition hover:text-blue-600 dark:hover:text-white"
                    >
                      {language === "mr" ? "विद्यार्थी लॉगिन" : "Student Login"}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      prefetch={true}
                      className="transition hover:text-blue-600 dark:hover:text-white"
                    >
                      {language === "mr" ? "मोफत नोंदणी" : "Free Registration"}
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link
                  href="/faq"
                  prefetch={true}
                  className="transition hover:text-blue-600 dark:hover:text-white"
                >
                  {language === "mr" ? "वारंवार विचारले जाणारे प्रश्न (FAQ)" : "Frequently Asked Questions"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 text-xs text-slate-400 dark:border-slate-800 sm:flex-row">
          <div>© {new Date().getFullYear()} MahaExam. All rights reserved. (सर्व हक्क राखीव)</div>
          <div className="flex gap-4">
            <span className="hover:underline">Privacy Policy</span>
            <span className="hover:underline">Terms of Service</span>
            <span className="hover:underline">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
