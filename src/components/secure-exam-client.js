"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Send,
  AlertTriangle,
  Bookmark,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Maximize2,
  X,
  Globe,
  LayoutGrid,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function SecureExamClient({ examId }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [remaining, setRemaining] = useState(0);
  const [violations, setViolations] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showMobilePalette, setShowMobilePalette] = useState(false);
  const [offline, setOffline] = useState(false);
  const [lang, setLang] = useState("mr"); // Default pure Marathi

  const isSubmittingRef = useRef(false);
  const violationSentRef = useRef(false);

  // Initialize attempt
  useEffect(() => {
    let active = true;

    async function init() {
      try {
        const res = await fetch("/api/student/exam-attempts/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ examId }),
        });

        const data = await res.json();
        if (!res.ok) {
          if (active) {
            setError(data.error || "परीक्षेची माहिती लोड करताना अडचण आली.");
            setLoading(false);
          }
          return;
        }

        if (active) {
          setExam(data.exam);
          setAttempt(data.attempt);

          // Restore previously saved answers
          if (data.attempt.answers && typeof data.attempt.answers === "object") {
            setAnswers(data.attempt.answers);
          }

          // Calculate remaining time
          const durationMs = (data.exam.duration || 60) * 60 * 1000;
          const startedAt = new Date(data.attempt.startedAt).getTime();
          const elapsed = Date.now() - startedAt;
          const left = Math.max(0, durationMs - elapsed);
          setRemaining(left);

          setLoading(false);
        }
      } catch {
        if (active) {
          setError("सर्व्हरशी संपर्क होऊ शकला नाही. कृपया पुन्हा प्रयत्न करा.");
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      active = false;
    };
  }, [examId]);

  // Submit attempt helper
  const submit = useCallback(
    async (isAuto = false) => {
      if (!attempt || isSubmittingRef.current) {
        return;
      }
      isSubmittingRef.current = true;
      setSubmitting(true);

      try {
        const res = await fetch("/api/student/exam-attempts/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attemptId: attempt.id,
            answers,
            violations,
            autoSubmitted: isAuto,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          router.push(`/student/results/${data.attemptId || attempt.id}`);
          router.refresh();
        } else {
          setError(data.error || "सबमिशन अयशस्वी झाले.");
          setSubmitting(false);
          isSubmittingRef.current = false;
        }
      } catch {
        setError("सबमिट करताना त्रुटी आली. कृपया इंटरनेट तपासा.");
        setSubmitting(false);
        isSubmittingRef.current = false;
      }
    },
    [attempt, answers, violations, router],
  );

  // Sync Timer
  useEffect(() => {
    if (loading || remaining <= 0 || !attempt) {
      return;
    }

    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1000) {
          clearInterval(timer);
          submit(true);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, remaining, attempt, submit]);

  // Offline / Online listeners
  useEffect(() => {
    function handleOnline() {
      setOffline(false);
    }
    function handleOffline() {
      setOffline(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Proctoring: Tab switch & visibility loss detection
  const reportViolation = useCallback(
    (reason) => {
      if (violationSentRef.current) {
        return;
      }
      setViolations((v) => {
        const next = v + 1;
        if (attempt) {
          fetch("/api/student/exam-attempts/violation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              attemptId: attempt.id,
              type: reason,
              count: next,
            }),
          }).catch(() => {});
        }
        return next;
      });
    },
    [attempt],
  );

  useEffect(() => {
    if (loading || !attempt) {
      return;
    }

    function onVisibilityChange() {
      if (document.hidden) {
        reportViolation("TAB_SWITCH");
      }
    }

    function onBlur() {
      reportViolation("WINDOW_BLUR");
    }

    function preventContextMenu(e) {
      e.preventDefault();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    document.addEventListener("contextmenu", preventContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("contextmenu", preventContextMenu);
    };
  }, [loading, attempt, reportViolation]);

  // Background state sync
  const syncAnswers = useCallback(
    (newAnswers) => {
      if (!attempt) {
        return;
      }
      fetch("/api/student/exam-attempts/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: attempt.id,
          answers: newAnswers,
          currentQuestion: current,
        }),
      }).catch(() => {});
    },
    [attempt, current],
  );

  function choose(optionId) {
    if (!exam || !exam.questions) {
      return;
    }
    const qId = exam.questions[current]?.id;
    if (!qId) {
      return;
    }

    const nextAnswers = { ...answers };
    if (optionId === null) {
      delete nextAnswers[qId];
    } else {
      nextAnswers[qId] = optionId;
    }
    setAnswers(nextAnswers);
    syncAnswers(nextAnswers);
  }

  function toggleMark() {
    if (!exam || !exam.questions) {
      return;
    }
    const qId = exam.questions[current]?.id;
    if (!qId) {
      return;
    }

    setMarked((m) => {
      const next = { ...m };
      if (next[qId]) {
        delete next[qId];
      } else {
        next[qId] = true;
      }
      return next;
    });
  }

  function goToQuestion(index) {
    if (!exam || !exam.questions) {
      return;
    }
    if (index >= 0 && index < exam.questions.length) {
      setCurrent(index);
      setShowMobilePalette(false);
    }
  }

  function enterFullscreen() {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }

  function manualSubmit() {
    setShowSubmitModal(false);
    submit(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center font-sans dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <h2 className="mt-4 text-sm font-bold text-slate-900 dark:text-white sm:text-base">
          सुरक्षित CBT परीक्षा स्क्रीन लोड होत आहे...
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          कृपया प्रतीक्षा करा, प्रश्नपत्रिका तयार केली जात आहे.
        </p>
      </div>
    );
  }

  if (error && !exam) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center font-sans dark:bg-slate-950">
        <div className="w-full max-w-md rounded-3xl border border-rose-200 bg-white p-8 shadow-xl dark:border-rose-900/50 dark:bg-slate-900">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
            परीक्षा सुरू करताना अडचण आली
          </h3>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{error}</p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                const curPath =
                  typeof window !== "undefined" ? window.location.pathname : "/student/exams";
                router.push(`/login?next=${encodeURIComponent(curPath)}`);
              }}
              className="rounded-2xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-blue-500 active:scale-95"
            >
              लॉगिन करा (Sign In to Start)
            </button>
            <button
              type="button"
              onClick={() => router.push("/student/dashboard")}
              className="rounded-2xl border border-slate-200 bg-slate-100 px-6 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              डॅशबोर्डवर परत जा
            </button>
          </div>
        </div>
      </div>
    );
  }

  const questionsList = exam.questions || [];
  const totalCount = questionsList.length;
  const q = questionsList[current] || {};

  const totalAnswered = Object.keys(answers).length;
  const totalMarked = Object.keys(marked).length;
  const totalUnanswered = totalCount - totalAnswered;

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);

  // Pure language text resolution
  const qText =
    lang === "mr"
      ? q.textMr || q.questionTextMr || q.text || q.questionText
      : q.text || q.questionText || q.textMr || q.questionTextMr;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {/* TOP CBT NAVBAR */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/95">
        {/* DESKTOP HEADER (>= 1024px) */}
        <div className="mx-auto hidden max-w-7xl items-center justify-between px-6 py-3 lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-black text-white shadow-sm">
              M
            </div>
            <div className="min-w-0 max-w-md">
              <h1 className="truncate text-sm font-black text-slate-900 dark:text-white">
                {exam.title}
              </h1>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {lang === "mr"
                  ? `प्रश्न ${current + 1} / ${totalCount}`
                  : `Question ${current + 1} of ${totalCount}`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLang(lang === "mr" ? "en" : "mr")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-slate-200 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              title="भाषा बदला"
            >
              <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>{lang === "mr" ? "English" : "मराठी"}</span>
            </button>

            {/* Timer Badge */}
            <div
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-mono text-sm font-black shadow-inner ${
                remaining < 300000
                  ? "animate-pulse bg-rose-600 text-white"
                  : "border border-slate-200 bg-slate-100 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-amber-300"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>
                {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
              </span>
            </div>

            <ThemeToggle />

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={enterFullscreen}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>{lang === "mr" ? "फुलस्क्रीन" : "Fullscreen"}</span>
            </button>

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500 active:scale-95"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{lang === "mr" ? "सबमिट करा" : "Submit"}</span>
            </button>
          </div>
        </div>

        {/* MOBILE HEADER (< 1024px): 2-Tier Clean Layout */}
        <div className="lg:hidden">
          {/* Row 1: Logo + Exam Title + Timer + Submit */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 dark:border-slate-800">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">
                M
              </div>
              <h1 className="truncate text-xs font-black text-slate-900 dark:text-white">
                {exam.title}
              </h1>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              {/* Timer Badge */}
              <div
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-mono text-xs font-black ${
                  remaining < 300000
                    ? "animate-pulse bg-rose-600 text-white"
                    : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-amber-300"
                }`}
              >
                <Clock className="h-3 w-3" />
                <span>
                  {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                </span>
              </div>

              <ThemeToggle className="h-7 w-7 rounded-lg" />

              {/* Submit CTA */}
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm active:scale-95"
              >
                <Send className="h-3 w-3" />
                <span>सबमिट</span>
              </button>
            </div>
          </div>

          {/* Row 2: Status Strip (Question # + Marks + Language + Palette Button) */}
          <div className="flex items-center justify-between bg-slate-50/80 px-3 py-1.5 text-xs font-bold dark:bg-slate-900/60">
            <div className="flex items-center gap-1.5">
              <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-black text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                {lang === "mr"
                  ? `प्रश्न ${current + 1}/${totalCount}`
                  : `Q ${current + 1}/${totalCount}`}
              </span>
              <span className="rounded-md bg-slate-200/70 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                +{q.marks || 1} {lang === "mr" ? "गुण" : "Mark"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Switch */}
              <button
                type="button"
                onClick={() => setLang(lang === "mr" ? "en" : "mr")}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <Globe className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <span>{lang === "mr" ? "English" : "मराठी"}</span>
              </button>

              {/* Palette Drawer Trigger */}
              <button
                type="button"
                onClick={() => setShowMobilePalette(true)}
                className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
              >
                <LayoutGrid className="h-3 w-3" />
                <span>प्रश्न सूची</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {offline && (
        <div className="bg-rose-600 px-4 py-1.5 text-center text-xs font-bold text-white shadow">
          ⚠️ इंटरनेट कनेक्शन बंद झाले आहे. कृपया पुन्हा जोडा.
        </div>
      )}

      {/* MAIN EXAMINATION AREA */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-3 pb-24 sm:p-6 sm:pb-24 lg:grid lg:grid-cols-[1fr_320px] lg:pb-6">
        {/* Left Question Card */}
        <div className="flex min-h-[60vh] flex-1 flex-col justify-between rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 sm:min-h-[70vh] sm:p-8">
          <div>
            {/* Desktop Question Header */}
            <div className="hidden items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800 lg:flex">
              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                  {lang === "mr" ? `प्रश्न क्रमांक ${current + 1}` : `Question ${current + 1}`}
                </span>
                <span className="rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  +{q.marks || 1} {lang === "mr" ? "गुण" : "Mark"}
                  {exam.negativeMarks > 0 ? ` / -${exam.negativeMarks}` : ""}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {marked[q.id] && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 font-bold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                    <Bookmark className="h-3 w-3" />
                    {lang === "mr" ? "रिव्ह्यूसाठी चिन्हांकित" : "Marked for Review"}
                  </span>
                )}
                {violations > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 font-bold text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
                    <AlertTriangle className="h-3 w-3" />
                    {violations} {lang === "mr" ? "चेतावणी" : "warning(s)"}
                  </span>
                )}
              </div>
            </div>

            {/* Question Statement */}
            <div className="mt-2 lg:mt-5">
              <h2 className="text-base font-bold leading-relaxed text-slate-900 dark:text-white sm:text-xl">
                {qText}
              </h2>
            </div>

            {/* Multiple Choice Options List */}
            <div className="mt-6 space-y-3">
              {(q.options || []).map((opt, idx) => {
                const optText =
                  lang === "mr"
                    ? opt.textMr || opt.optionTextMr || opt.text || opt.optionText
                    : opt.text || opt.optionText || opt.textMr || opt.optionTextMr;
                const isSelected = answers[q.id] === opt.id;

                return (
                  <button
                    key={opt.id || idx}
                    type="button"
                    onClick={() => choose(opt.id)}
                    className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all active:scale-[0.99] ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/90 text-blue-950 shadow-sm ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-100"
                        : "border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-xl text-xs font-black transition-colors ${
                          isSelected
                            ? "bg-blue-600 text-white dark:bg-blue-500"
                            : "bg-white text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <div
                        className={`text-xs font-bold leading-snug sm:text-sm ${
                          isSelected
                            ? "text-blue-950 dark:text-blue-200"
                            : "text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {optText}
                      </div>
                    </div>

                    <div
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500"
                          : "border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop Actions Bar */}
          <div className="mt-8 hidden flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6 dark:border-slate-800 lg:flex">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={current === 0}
                onClick={() => goToQuestion(current - 1)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{lang === "mr" ? "मागील प्रश्न" : "Previous"}</span>
              </button>

              <button
                type="button"
                onClick={toggleMark}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
                  marked[q.id]
                    ? "border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                <Bookmark className="h-4 w-4" />
                <span>
                  {marked[q.id]
                    ? lang === "mr"
                      ? "रिव्ह्यू काढा"
                      : "Unmark Review"
                    : lang === "mr"
                      ? "रिव्ह्यूसाठी ठेवा"
                      : "Mark for Review"}
                </span>
              </button>

              {answers[q.id] && (
                <button
                  type="button"
                  onClick={() => choose(null)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/60 dark:text-rose-300"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{lang === "mr" ? "उत्तर रद्द करा" : "Clear Response"}</span>
                </button>
              )}
            </div>

            <div>
              {current < totalCount - 1 ? (
                <button
                  type="button"
                  onClick={() => goToQuestion(current + 1)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500 active:scale-95"
                >
                  <span>{lang === "mr" ? "जतन करा आणि पुढे जा" : "Save & Next"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-500 active:scale-95"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{lang === "mr" ? "परीक्षा सबमिट करा" : "Submit Test"}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Desktop Question Palette */}
        <aside className="hidden flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 lg:flex">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            {lang === "mr" ? "प्रश्न सूची (Question Palette)" : "Question Palette"}
          </h3>

          {/* Color Legend */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md bg-emerald-500" />
              <span>
                {totalAnswered} {lang === "mr" ? "सोडवले" : "Answered"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md bg-amber-500" />
              <span>
                {totalMarked} {lang === "mr" ? "रिव्ह्यू" : "Review"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md bg-slate-200 dark:bg-slate-700" />
              <span>
                {totalUnanswered} {lang === "mr" ? "शिल्लक" : "Left"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md bg-blue-600" />
              <span>{lang === "mr" ? "चालू प्रश्न" : "Current"}</span>
            </div>
          </div>

          {/* Question Grid */}
          <div className="mt-4 flex-1 overflow-y-auto p-1">
            <div className="grid grid-cols-5 gap-2">
              {questionsList.map((item, index) => {
                const isCurrent = current === index;
                const isAns = Boolean(answers[item.id]);
                const isMkd = Boolean(marked[item.id]);

                let btnClass =
                  "border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";

                if (isAns && isMkd) {
                  btnClass = "bg-purple-600 text-white border-purple-700 font-black";
                } else if (isAns) {
                  btnClass = "bg-emerald-600 text-white border-emerald-700 font-black";
                } else if (isMkd) {
                  btnClass = "bg-amber-500 text-white border-amber-600 font-black";
                } else if (isCurrent) {
                  btnClass = "bg-blue-600 text-white border-blue-600 font-black";
                }

                if (isCurrent) {
                  btnClass +=
                    " ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900";
                }

                return (
                  <button
                    key={item.id || index}
                    type="button"
                    onClick={() => goToQuestion(index)}
                    className={`relative grid h-10 w-full place-items-center rounded-xl text-xs font-black transition-all hover:scale-105 active:scale-95 ${btnClass}`}
                  >
                    <span>{index + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </main>

      {/* MOBILE FIXED BOTTOM ACTION BAR */}
      <div className="safe-area-bottom fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-2 border-t border-slate-200 bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/95 lg:hidden">
        {/* Previous Button */}
        <button
          type="button"
          disabled={current === 0}
          onClick={() => goToQuestion(current - 1)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-700 active:scale-95 disabled:opacity-30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          title="मागील प्रश्न"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Mark for Review Button */}
        <button
          type="button"
          onClick={toggleMark}
          className={`flex h-11 items-center justify-center gap-1.5 rounded-2xl border px-3.5 text-xs font-bold transition-colors active:scale-95 ${
            marked[q.id]
              ? "border-amber-400 bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
              : "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          <Bookmark className="h-4 w-4" />
          <span>{marked[q.id] ? "रिव्ह्यू" : "मार्क"}</span>
        </button>

        {/* Clear Option Button (if answered) */}
        {answers[q.id] && (
          <button
            type="button"
            onClick={() => choose(null)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 active:scale-95 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
            title="उत्तर साफ करा"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}

        {/* Save & Next / Submit Button */}
        {current < totalCount - 1 ? (
          <button
            type="button"
            onClick={() => goToQuestion(current + 1)}
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-blue-600 px-4 text-xs font-bold text-white shadow-md active:scale-95"
          >
            <span>{lang === "mr" ? "पुढील प्रश्न" : "Save & Next"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-md active:scale-95"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{lang === "mr" ? "सबमिट करा" : "Submit"}</span>
          </button>
        )}
      </div>

      {/* MOBILE SLIDE-UP QUESTION PALETTE DRAWER */}
      {showMobilePalette && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm lg:hidden">
          <div className="max-h-[80vh] rounded-t-3xl border-t border-slate-200 bg-white p-5 shadow-2xl transition-colors dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {lang === "mr"
                  ? `प्रश्न सूची (${totalCount} प्रश्न)`
                  : `Question Palette (${totalCount} Questions)`}
              </h3>
              <button
                type="button"
                onClick={() => setShowMobilePalette(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Legend */}
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-md bg-emerald-500" />
                {totalAnswered} {lang === "mr" ? "सोडवले" : "Ans"}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-md bg-amber-500" />
                {totalMarked} {lang === "mr" ? "रिव्ह्यू" : "Review"}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-md bg-slate-300 dark:bg-slate-700" />
                {totalUnanswered} {lang === "mr" ? "शिल्लक" : "Left"}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-md bg-blue-600" />
                {lang === "mr" ? "चालू" : "Current"}
              </span>
            </div>

            {/* Grid */}
            <div className="mt-4 max-h-[50vh] overflow-y-auto p-1">
              <div className="grid grid-cols-5 gap-2.5">
                {questionsList.map((item, index) => {
                  const isCurrent = current === index;
                  const isAns = Boolean(answers[item.id]);
                  const isMkd = Boolean(marked[item.id]);

                  let btnClass =
                    "border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";

                  if (isAns && isMkd) {
                    btnClass = "bg-purple-600 text-white border-purple-700 font-black";
                  } else if (isAns) {
                    btnClass = "bg-emerald-600 text-white border-emerald-700 font-black";
                  } else if (isMkd) {
                    btnClass = "bg-amber-500 text-white border-amber-600 font-black";
                  } else if (isCurrent) {
                    btnClass = "bg-blue-600 text-white border-blue-600 font-black";
                  }

                  if (isCurrent) {
                    btnClass +=
                      " ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900";
                  }

                  return (
                    <button
                      key={item.id || index}
                      type="button"
                      onClick={() => goToQuestion(index)}
                      className={`grid h-11 w-full place-items-center rounded-2xl text-xs font-black transition-all active:scale-95 ${btnClass}`}
                    >
                      <span>{index + 1}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {lang === "mr" ? "परीक्षा सबमिट करावी का?" : "Are you sure you want to submit?"}
            </h3>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              {lang === "mr"
                ? "परीक्षा सबमिट केल्यानंतर लगेचच तुमचे गुण, अचूकता आणि उत्तरांचे सविस्तर विश्लेषण दिसेल."
                : "Once submitted, you will immediately see your official scorecard, accuracy, and answer key."}
            </p>

            <div className="my-5 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-xs dark:bg-slate-800/60">
              <div>
                <span className="text-slate-500 dark:text-slate-400">
                  {lang === "mr" ? "सोडवलेले प्रश्न:" : "Answered:"}
                </span>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  {totalAnswered} / {totalCount}
                </div>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">
                  {lang === "mr" ? "रिव्ह्यूसाठी ठेवलेले:" : "For Review:"}
                </span>
                <div className="text-base font-black text-amber-600 dark:text-amber-400">
                  {totalMarked}
                </div>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">
                  {lang === "mr" ? "न सोडवलेले प्रश्न:" : "Unanswered:"}
                </span>
                <div className="text-base font-black text-slate-700 dark:text-slate-300">
                  {totalUnanswered}
                </div>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">
                  {lang === "mr" ? "उर्वरित वेळ:" : "Time Left:"}
                </span>
                <div className="text-base font-black text-blue-600 dark:text-blue-400">
                  {mins}m {secs}s
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-100 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {lang === "mr" ? "सराव चालू ठेवा" : "Continue Test"}
              </button>
              <button
                type="button"
                onClick={manualSubmit}
                disabled={submitting}
                className="flex-1 rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md transition hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
              >
                {submitting
                  ? lang === "mr"
                    ? "सबमिट होत आहे..."
                    : "Submitting..."
                  : lang === "mr"
                    ? "होय, सबमिट करा"
                    : "Yes, Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SecureExamClient;
