"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  Plus,
  ArrowRight,
  MapPin,
  Sparkles,
  Phone,
  Mail,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export default function StudentAcademiesPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const isMr = language === "mr";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [msg, setMsg] = useState({ text: "", error: false });

  function load() {
    setLoading(true);
    fetch("/api/student/academies")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleJoin(e) {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setJoining(true);
    setMsg({ text: "", error: false });

    try {
      const r = await fetch("/api/student/academies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inviteCode.trim() }),
      });
      const res = await r.json();
      if (!r.ok) {
        setMsg({
          text:
            res.error || (isMr ? "अकॅडेमीमध्ये सामील होता आले नाही." : "Failed to join academy."),
          error: true,
        });
      } else {
        setMsg({
          text:
            res.message ||
            (isMr ? "अकॅडेमीमध्ये यशस्वीरित्या सामील झालात!" : "Successfully joined academy!"),
          error: false,
        });
        setInviteCode("");
        load();
        router.refresh();
      }
    } catch {
      setMsg({
        text: isMr
          ? "नेटवर्क त्रुटी आली. कृपया पुन्हा प्रयत्न करा."
          : "Network error. Please try again.",
        error: true,
      });
    } finally {
      setJoining(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="animate-shimmer h-36 w-full rounded-3xl" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="animate-shimmer h-64 rounded-3xl" />
          <div className="animate-shimmer h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  const orgs = data?.organizations || [];

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-blue-100 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>{isMr ? "कोचिंग अकॅडेमी पोर्टल" : "Coaching Academy Portal"}</span>
            </div>
            <h1 className="mt-3 text-2xl font-black sm:text-3xl">
              {isMr ? "माझ्या अकॅडेमी" : "My Coaching Academies"}
            </h1>
            <p className="mt-1 max-w-xl text-xs text-blue-100 sm:text-sm">
              {isMr
                ? "तुम्ही नोंदणी केलेल्या सर्व कोचिंग अकॅडेमी, त्यांच्या बॅचेस, शिक्षक आणि खाजगी मॉक टेस्ट्स एकाच ठिकाणी पहा."
                : "View all coaching institutes you are currently enrolled in, their batches, faculty, and private classroom mock exams."}
            </p>
          </div>

          <div className="shrink-0 rounded-2xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-md">
            <div className="text-xs font-semibold text-blue-200">
              {isMr ? "जोडलेल्या अकॅडेमी" : "Enrolled Academies"}
            </div>
            <div className="mt-0.5 text-2xl font-black text-white sm:text-3xl">{orgs.length}</div>
          </div>
        </div>
      </div>

      {/* Join Another Academy Box */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400">
            <GraduationCap className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-black text-slate-900 dark:text-white sm:text-base">
            {isMr
              ? "अकॅडेमीत सामील व्हा किंवा नवीन कोड जोडा"
              : "Join an Academy or Add Batch Invite Code"}
          </h2>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {isMr
            ? "तुमच्या शिक्षकांनी किंवा अकॅडेमीने दिलेला इन्व्हाईट कोड (उदा. PUNE2025 किंवा अकॅडेमी कोड) टाका:"
            : "Enter the invite code or institute slug given by your teacher or coaching center:"}
        </p>

        {msg.text && (
          <div
            className={`mt-3.5 flex items-center gap-2 rounded-2xl p-3 text-xs font-bold ${
              msg.error
                ? "border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {msg.error ? (
              <AlertCircle className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleJoin} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder={isMr ? "उदा. PUNE2025 किंवा अकॅडेमी कोड" : "e.g. PUNE2025 or Academy Code"}
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
          <button
            type="submit"
            disabled={joining || !inviteCode.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500 active:scale-95 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span>
              {joining
                ? isMr
                  ? "सामील होत आहे..."
                  : "Joining..."
                : isMr
                  ? "सामील व्हा"
                  : "Join Academy"}
            </span>
          </button>
        </form>
      </div>

      {/* Enrolled Academies List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 dark:text-white sm:text-lg">
            {isMr
              ? `नोंदणी केलेल्या अकॅडेमी (${orgs.length})`
              : `Enrolled Coaching Academies (${orgs.length})`}
          </h2>
        </div>

        {orgs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900 sm:p-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <Building2 className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              {isMr ? "कोणतीही अकॅडेमी जोडलेली नाही" : "No Coaching Institutes Connected"}
            </h3>
            <p className="mx-auto mt-1.5 max-w-md text-xs text-slate-500 dark:text-slate-400">
              {isMr
                ? "तुम्ही सध्या MahaExam वरील सर्व मोफत व ग्लोबल परीक्षांचा सराव करत आहात. जर तुम्ही एखाद्या अकॅडेमीचे विद्यार्थी असाल, तर त्यांचा इन्व्हाईट कोड वर टाकून त्यांच्या खाजगी मॉक टेस्ट्स मिळवू शकता."
                : "You are practicing with MahaExam platform tests. If you are part of a coaching institute, enter their invite code above to get their classroom test series."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/student/exams"
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-500 active:scale-95"
              >
                <BookOpen className="h-4 w-4" />
                <span>{isMr ? "सर्व उपलब्ध परीक्षा पहा" : "Browse All Available Exams"}</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {orgs.map((org) => (
              <div
                key={org.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        {org.district && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-rose-500" />
                            {org.district}
                          </span>
                        )}
                        <span>•</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {isMr ? "सक्रिय विद्यार्थी" : "Active Enrollment"}
                        </span>
                      </div>
                      <h3 className="mt-1.5 text-lg font-black text-slate-900 dark:text-white">
                        {org.name}
                      </h3>
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400">
                      <Building2 className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Contact info if provided */}
                  {(org.email || org.phone) && (
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      {org.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-blue-500" />
                          {org.phone}
                        </span>
                      )}
                      {org.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-amber-500" />
                          {org.email}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Batches enrolled */}
                  <div className="mt-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {isMr ? "नोंदणी केलेल्या बॅचेस:" : "Enrolled Batches:"}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {org.batches && org.batches.length > 0 ? (
                        org.batches.map((b) => (
                          <span
                            key={b.id}
                            className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-300"
                          >
                            {b.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">
                          {isMr ? "सामान्य बॅच" : "General Enrollment"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Assigned Mock Exams */}
                  <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>
                        {isMr
                          ? `अकॅडेमी परीक्षा (${org.exams?.length || 0})`
                          : `Academy Mock Exams (${org.exams?.length || 0})`}
                      </span>
                    </div>

                    <div className="mt-2.5 space-y-2">
                      {org.exams && org.exams.length > 0 ? (
                        org.exams.slice(0, 4).map((e) => (
                          <div
                            key={e.id}
                            className="flex items-center justify-between gap-2 rounded-2xl bg-slate-50 p-3 transition hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-xs font-bold text-slate-900 dark:text-white">
                                {e.title}
                              </div>
                              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                                <span>📝 {e.totalQuestions || 100} Qs</span>
                                <span>•</span>
                                <span>⏱ {e.durationMinutes} mins</span>
                                <span>•</span>
                                <span>🎯 {e.totalMarks || 100} गुण</span>
                              </div>
                            </div>
                            <Link
                              href={`/exam/${e.slug || e.id}/attempt`}
                              className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-500 active:scale-95"
                            >
                              <span>{isMr ? "सुरू करा" : "Start"}</span>
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        ))
                      ) : (
                        <div className="py-2 text-xs text-slate-400">
                          {isMr
                            ? "सध्या कोणतीही खाजगी चाचणी नियोजित नाही."
                            : "No private mock tests scheduled right now."}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      {org.teachers?.length || 1}{" "}
                      {isMr ? "मार्गदर्शक शिक्षक" : "Faculty Teacher(s)"}
                    </span>
                  </div>
                  <Link
                    href="/student/exams"
                    className="font-bold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {isMr ? "सर्व परीक्षा →" : "All Exams →"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
