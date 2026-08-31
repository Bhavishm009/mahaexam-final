"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, CheckCircle2 } from "lucide-react";
import { MAHARASHTRA_EXAM_TYPES } from "@/lib/exam-types";

const steps = ["Basic Details", "Questions", "Rules", "Assign", "Preview & Publish"];

export default function ExamBuilder() {
  const [draft, setDraft] = useState(null);
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [publishedExam, setPublishedExam] = useState(null);
  const [search, setSearch] = useState("");
  const [bank, setBank] = useState([]);
  const [selected, setSelected] = useState([]);
  const [assign, setAssign] = useState({ batchIds: [], studentIds: [] });
  const [schedule, setSchedule] = useState({ publishNow: false, startAt: "", endAt: "" });

  useEffect(() => {
    fetch("/api/coaching/exam-drafts", { method: "POST" })
      .then((r) => r.json())
      .then((d) => setDraft(d.draft));
  }, []);
  async function save(data) {
    const r = await fetch(`/api/coaching/exam-drafts/${draft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const d = await r.json();
    if (r.ok) {
      setDraft(d.draft);
    } else {
      setMessage(d.error);
    }
  }
  async function findQuestions() {
    const d = await fetch(`/api/question-bank?search=${encodeURIComponent(search)}&take=50`).then(
      (r) => r.json(),
    );
    setBank(d.questions || []);
  }
  async function addQuestions() {
    const qs = selected.map((q) => ({
      questionId: q.question.id,
      marks: 1,
      negativeMarks: draft.defaultNegativeMarks,
      source: "MANUAL",
    }));
    const r = await fetch(`/api/coaching/exam-drafts/${draft.id}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions: qs }),
    });
    const d = await r.json();
    if (r.ok) {
      setDraft(d.draft);
    }
    setSelected([]);
  }
  async function publish() {
    const r = await fetch(`/api/coaching/exam-drafts/${draft.id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(schedule),
    });
    const d = await r.json();
    if (r.ok) {
      setPublishedExam(d.exam);
      setMessage(`Exam created successfully: ${d.exam.title}`);
    } else {
      setMessage((d.errors || [d.error]).join(", "));
    }
  }
  if (!draft) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="animate-shimmer h-10 w-48 rounded-xl" />
          <div className="animate-shimmer h-6 w-72 rounded-lg" />
          <div className="animate-shimmer h-96 w-full rounded-3xl" />
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-black">Create Examination</h1>
        <p className="mt-2 text-slate-500">Save your work as a draft at every step.</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {steps.map((x, i) => (
            <button
              key={x}
              onClick={() => setStep(i + 1)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${step === i + 1 ? "bg-blue-600 text-white" : "bg-white text-slate-600"}`}
            >
              {i + 1}. {x}
            </button>
          ))}
        </div>
        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          {step === 1 && (
            <div className="space-y-4">
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                onBlur={() => save({ title: draft.title })}
                className="w-full rounded-xl border p-3"
                placeholder="Exam title"
              />
              <textarea
                value={draft.description || ""}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                onBlur={() => save({ description: draft.description })}
                className="min-h-24 w-full rounded-xl border p-3"
                placeholder="Description"
              />
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-700">
                    Exam Category (परीक्षेचा प्रकार)
                  </label>
                  <select
                    value={draft.examType || "Police Bharti"}
                    onChange={(e) => {
                      setDraft({ ...draft, examType: e.target.value });
                      save({ examType: e.target.value });
                    }}
                    className="mt-1 w-full rounded-xl border p-3 text-xs font-semibold"
                  >
                    {MAHARASHTRA_EXAM_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Language (माध्यम)</label>
                  <select
                    value={draft.language || "mr"}
                    onChange={(e) => {
                      setDraft({ ...draft, language: e.target.value });
                      save({ language: e.target.value });
                    }}
                    className="mt-1 w-full rounded-xl border p-3 text-xs font-semibold"
                  >
                    <option value="mr">Marathi (मराठी)</option>
                    <option value="both">Bilingual (Marathi + English)</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-700">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={draft.durationMinutes}
                    onChange={(e) =>
                      setDraft({ ...draft, durationMinutes: Number(e.target.value) })
                    }
                    onBlur={() => save({ durationMinutes: draft.durationMinutes })}
                    className="mt-1 w-full rounded-xl border p-3 text-xs"
                    placeholder="Duration"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Passing Score (%)</label>
                  <input
                    type="number"
                    value={draft.passingScore || ""}
                    onChange={(e) => setDraft({ ...draft, passingScore: Number(e.target.value) })}
                    onBlur={() => save({ passingScore: draft.passingScore })}
                    className="mt-1 w-full rounded-xl border p-3 text-xs"
                    placeholder="e.g. 40"
                  />
                </div>
              </div>

              {/* Explicit Negative Marking Selector */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      Negative Marking (नकारात्मक गुणदान)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {draft.defaultNegativeMarks > 0
                        ? `Deducting ${draft.defaultNegativeMarks} marks per wrong answer`
                        : "No negative marking (शून्य)"}
                    </div>
                  </div>
                  <select
                    value={draft.defaultNegativeMarks || 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setDraft({ ...draft, defaultNegativeMarks: val });
                      save({ defaultNegativeMarks: val });
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    <option value={0}>No Negative Marking (नकारात्मक गुण नाही)</option>
                    <option value={0.25}>0.25 Marks (1/4th Pattern)</option>
                    <option value={0.33}>0.33 Marks (1/3rd Pattern)</option>
                    <option value={0.5}>0.50 Marks (1/2 Mark Pattern)</option>
                    <option value={1.0}>1.00 Mark (Full Mark Deduction)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <div className="flex gap-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && findQuestions()}
                  className="flex-1 rounded-xl border p-3"
                  placeholder="Search question bank"
                />
                <button
                  onClick={findQuestions}
                  className="rounded-xl bg-slate-900 px-5 font-bold text-white"
                >
                  Search
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {bank.map((q) => (
                  <label key={q.id} className="flex gap-3 rounded-xl border p-4">
                    <input
                      type="checkbox"
                      checked={selected.some((x) => x.id === q.id)}
                      onChange={(e) =>
                        setSelected(
                          e.target.checked
                            ? [...selected, q]
                            : selected.filter((x) => x.id !== q.id),
                        )
                      }
                    />
                    <span>
                      <b>{q.question.questionText}</b>
                      <small className="block text-slate-500">
                        {q.difficulty} · {q.question.subject?.name || "Subject"}
                      </small>
                    </span>
                  </label>
                ))}
              </div>
              <button
                onClick={addQuestions}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
              >
                Add Selected Questions
              </button>
              <div className="mt-6 font-semibold">{draft.questions.length} questions in paper</div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={draft.negativeMarking}
                  onChange={(e) => {
                    setDraft({ ...draft, negativeMarking: e.target.checked });
                    save({ negativeMarking: e.target.checked });
                  }}
                />
                Enable negative marking
              </label>
              <input
                type="number"
                step="0.01"
                value={draft.defaultNegativeMarks}
                onChange={(e) =>
                  setDraft({ ...draft, defaultNegativeMarks: Number(e.target.value) })
                }
                onBlur={() => save({ defaultNegativeMarks: draft.defaultNegativeMarks })}
                className="rounded-xl border p-3"
                placeholder="Negative marks"
              />
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={draft.fullscreenRequired}
                  onChange={(e) => {
                    setDraft({ ...draft, fullscreenRequired: e.target.checked });
                    save({ fullscreenRequired: e.target.checked });
                  }}
                />
                Require fullscreen
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={draft.randomizeQuestions}
                  onChange={(e) => {
                    setDraft({ ...draft, randomizeQuestions: e.target.checked });
                    save({ randomizeQuestions: e.target.checked });
                  }}
                />
                Randomize questions
              </label>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">
                Enter IDs from your coaching batch/student management screens.
              </p>
              <input
                onChange={(e) =>
                  setAssign({
                    ...assign,
                    batchIds: e.target.value
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Batch IDs, comma separated"
                className="w-full rounded-xl border p-3"
              />
              <input
                onChange={(e) =>
                  setAssign({
                    ...assign,
                    studentIds: e.target.value
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Student IDs, comma separated"
                className="w-full rounded-xl border p-3"
              />
              <button
                onClick={async () => {
                  const r = await fetch(`/api/coaching/exam-drafts/${draft.id}/assign`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(assign),
                  });
                  const d = await r.json();
                  if (r.ok) {
                    setDraft(d.draft);
                  } else {
                    setMessage(d.error);
                  }
                }}
                className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
              >
                Save Assignment
              </button>
            </div>
          )}
          {step === 5 && (
            <div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <h2 className="text-2xl font-black">{draft.title}</h2>
                <div className="mt-2 text-slate-500">
                  {draft.questions.length} questions · {draft.durationMinutes} minutes ·{" "}
                  {draft.language}
                </div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <label className="rounded-xl border p-4">
                  Start
                  <input
                    type="datetime-local"
                    value={schedule.startAt}
                    onChange={(e) => setSchedule({ ...schedule, startAt: e.target.value })}
                    className="mt-2 w-full rounded-lg border p-2"
                  />
                </label>
                <label className="rounded-xl border p-4">
                  End
                  <input
                    type="datetime-local"
                    value={schedule.endAt}
                    onChange={(e) => setSchedule({ ...schedule, endAt: e.target.value })}
                    className="mt-2 w-full rounded-lg border p-2"
                  />
                </label>
              </div>
              <label className="mt-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={schedule.publishNow}
                  onChange={(e) => setSchedule({ ...schedule, publishNow: e.target.checked })}
                />{" "}
                Publish immediately
              </label>
              <button
                onClick={publish}
                className="mt-6 rounded-xl bg-green-600 px-6 py-3 font-bold text-white"
              >
                Create & Publish Examination
              </button>
            </div>
          )}
        </div>
        {message && (
          <div className="mt-4 space-y-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs font-bold text-blue-950 dark:border-blue-800 dark:bg-blue-950/70 dark:text-blue-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{message}</span>
            </div>
            {publishedExam && (
              <div>
                <Link
                  href={`/exam/${publishedExam.slug || publishedExam.id}/review`}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-blue-500"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>🔍 Review Exam Paper &amp; Answer Keys (परीक्षेचे पुनरावलोकन करा)</span>
                </Link>
              </div>
            )}
          </div>
        )}
        <div className="mt-6 flex justify-between">
          <button
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="rounded-xl bg-white px-5 py-3 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            disabled={step === 5}
            onClick={() => setStep(step + 1)}
            className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}
