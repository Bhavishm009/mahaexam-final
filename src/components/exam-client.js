"use client";

import { useEffect, useMemo, useState } from "react";
import { questions } from "@/lib/demo-data";

export default function ExamClient({ examId }) {
  const examQuestions = useMemo(() => questions, []);
  const [attemptId, setAttemptId] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [expiresAt, setExpiresAt] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [violations, setViolations] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [started, setStarted] = useState(false);
  const [starting, setStarting] = useState(false);
  const [saving, setSaving] = useState(false);

  const start = async () => {
    setStarting(true);
    const response = await fetch("/api/exam/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId }),
    });
    const data = await response.json();
    setAttemptId(data.attemptId);
    setExpiresAt(data.expiresAt);
    setSeconds(Math.max(0, Math.floor((new Date(data.expiresAt) - new Date()) / 1000)));
    setStarted(true);
    try {
      await document.documentElement.requestFullscreen();
    } catch {}
    setStarting(false);
  };

  useEffect(() => {
    if (!started || submitted || !expiresAt) {
      return;
    }
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt) - new Date()) / 1000));
      setSeconds(remaining);
      if (remaining <= 0) {
        submit(true);
      }
    }, 500);
    return () => clearInterval(timer);
  }, [started, submitted, expiresAt]);

  const reportViolation = async (type) => {
    if (!attemptId || submitted) {
      return;
    }
    const response = await fetch("/api/exam/violation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId, type }),
    });
    const data = await response.json();
    if (typeof data.violationCount === "number") {
      setViolations(data.violationCount);
    }
    if (data.status === "AUTO_SUBMITTED") {
      await loadAttemptResult();
    }
  };

  useEffect(() => {
    if (!started || submitted) {
      return;
    }
    const onVisibility = () => {
      if (document.hidden) {
        reportViolation("TAB_SWITCH");
      }
    };
    const onFullscreen = () => {
      if (!document.fullscreenElement) {
        reportViolation("FULLSCREEN_EXIT");
      }
    };
    const onContext = (e) => {
      e.preventDefault();
      reportViolation("RIGHT_CLICK");
    };
    const onCopy = (e) => {
      e.preventDefault();
      reportViolation("COPY_ATTEMPT");
    };
    const onPaste = (e) => {
      e.preventDefault();
      reportViolation("PASTE_ATTEMPT");
    };

    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("fullscreenchange", onFullscreen);
    document.addEventListener("contextmenu", onContext);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("fullscreenchange", onFullscreen);
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
    };
  }, [started, submitted, attemptId]);

  const loadAttemptResult = async () => {
    if (!attemptId) {
      return;
    }
    const response = await fetch(`/api/exam/attempt/${attemptId}`);
    const data = await response.json();
    if (data.result) {
      setResult(data.result);
      setSubmitted(true);
    }
  };

  const submit = async (auto = false) => {
    if (!attemptId || submitted) {
      return;
    }
    const response = await fetch("/api/exam/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId, auto }),
    });
    const data = await response.json();
    if (data.result) {
      setResult(data.result);
      setSubmitted(true);
    }
  };

  const choose = async (index) => {
    const q = examQuestions[current];
    setAnswers((a) => ({ ...a, [q.id]: index }));
    setSaving(true);
    try {
      await fetch("/api/exam/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          questionId: q.id,
          selectedOptionId: index,
          timeSpentSeconds: 0,
        }),
      });
    } finally {
      setSaving(false);
    }
  };

  const q = examQuestions[current];
  const answered = Object.keys(answers).length;
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  if (!started) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto mt-16 max-w-2xl rounded-3xl bg-white p-8 text-slate-900 shadow-2xl">
          <div className="text-sm font-semibold text-blue-600">POLICE BHARTI • DEMO EXAM</div>
          <h1 className="mt-3 text-3xl font-black">Police Bharti Mock Test 01</h1>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <b>50</b>
              <div className="text-xs text-slate-500">Questions</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <b>45 min</b>
              <div className="text-xs text-slate-500">Duration</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <b>-0.25</b>
              <div className="text-xs text-slate-500">Negative</div>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Server-authoritative demo timer. Fullscreen and browser violations are recorded by the
            API.
          </div>
          <button
            disabled={starting}
            onClick={start}
            className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {starting ? "Starting..." : "Start Examination"}
          </button>
        </div>
      </main>
    );
  }

  if (submitted && result) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="text-sm font-semibold text-blue-600">EXAM SUBMITTED</div>
            <h1 className="mt-2 text-3xl font-black">Your Result</h1>
            <div className="mt-6 grid gap-4 sm:grid-cols-4">
              <div className="rounded-2xl bg-blue-50 p-5">
                <div className="text-3xl font-black text-blue-700">{result.score.toFixed(2)}</div>
                <div className="text-xs text-slate-500">Score</div>
              </div>
              <div className="rounded-2xl bg-green-50 p-5">
                <div className="text-3xl font-black text-green-700">{result.correctCount}</div>
                <div className="text-xs text-slate-500">Correct</div>
              </div>
              <div className="rounded-2xl bg-red-50 p-5">
                <div className="text-3xl font-black text-red-700">{result.wrongCount}</div>
                <div className="text-xs text-slate-500">Wrong</div>
              </div>
              <div className="rounded-2xl bg-slate-100 p-5">
                <div className="text-3xl font-black">{result.unansweredCount}</div>
                <div className="text-xs text-slate-500">Unanswered</div>
              </div>
            </div>
            <div className="mt-6 rounded-2xl border p-5 text-sm">
              <div className="flex justify-between">
                <span>Percentage</span>
                <b>{result.percentage}%</b>
              </div>
              <div className="mt-2 flex justify-between">
                <span>Time taken</span>
                <b>
                  {Math.floor(result.timeTakenSeconds / 60)}m {result.timeTakenSeconds % 60}s
                </b>
              </div>
              <div className="mt-2 flex justify-between">
                <span>Security violations</span>
                <b>{result.violations}</b>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-10 border-b bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <div className="font-bold">Police Bharti Mock Test 01</div>
            <div className="text-xs text-slate-500">
              Question {current + 1} of {examQuestions.length} {saving ? "· Saving..." : "· Saved"}
            </div>
          </div>
          <div
            className={`rounded-xl px-4 py-2 font-mono text-lg font-bold text-white ${seconds < 300 ? "bg-red-600" : "bg-slate-900"}`}
          >
            {mins}:{secs}
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-5 p-4 lg:grid-cols-[1fr_300px]">
        <section className="rounded-2xl bg-white p-5 shadow-sm md:p-8">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {q.subject}
            </span>
            {violations > 0 && (
              <span className="text-xs font-semibold text-red-600">Violations: {violations}/3</span>
            )}
          </div>
          <h2 className="mt-6 text-xl font-bold leading-relaxed">{q.text}</h2>
          <p className="mt-2 text-sm text-slate-500">{q.textMr}</p>
          <div className="mt-7 space-y-3">
            {q.options.map((option, i) => (
              <button
                key={option}
                onClick={() => choose(i)}
                className={`w-full rounded-xl border p-4 text-left transition ${answers[q.id] === i ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100" : "hover:bg-slate-50"}`}
              >
                <span className="mr-3 inline-grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-xs font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
              </button>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-between gap-3">
            <button
              disabled={current === 0}
              onClick={() => setCurrent((c) => c - 1)}
              className="rounded-xl bg-slate-100 px-5 py-3 font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setMarked((m) => ({ ...m, [q.id]: !m[q.id] }))}
                className="rounded-xl border px-5 py-3 font-semibold"
              >
                {marked[q.id] ? "Unmark" : "Mark for review"}
              </button>
              <button
                onClick={() =>
                  current === examQuestions.length - 1 ? submit(false) : setCurrent((c) => c + 1)
                }
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
              >
                {current === examQuestions.length - 1 ? "Submit" : "Next"}
              </button>
            </div>
          </div>
        </section>
        <aside className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="font-bold">Question Navigator</div>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {examQuestions.map((x, i) => (
              <button
                key={x.id}
                onClick={() => setCurrent(i)}
                className={`h-10 rounded-lg text-xs font-bold ${i === current ? "bg-blue-600 text-white" : answers[x.id] !== undefined ? "bg-green-100 text-green-700" : marked[x.id] ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="mt-5 space-y-2 text-xs text-slate-500">
            <div>Answered: {answered}</div>
            <div>Unanswered: {examQuestions.length - answered}</div>
            <div>Marked: {Object.values(marked).filter(Boolean).length}</div>
          </div>
          <button
            onClick={() => submit(false)}
            className="mt-6 w-full rounded-xl bg-red-600 px-4 py-3 font-bold text-white"
          >
            Submit Exam
          </button>
        </aside>
      </div>
    </main>
  );
}
