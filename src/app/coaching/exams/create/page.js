"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, Badge } from "@/components/ui";
import { MAHARASHTRA_EXAM_TYPES } from "@/lib/exam-types";
import { ArrowLeft, BookOpen, Users, HelpCircle, Globe, Shield, Tag } from "lucide-react";

export default function CreateExam() {
  const [questions, setQuestions] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selected, setSelected] = useState([]);
  const [batchIds, setBatchIds] = useState([]);
  const [hasNegativeMarking, setHasNegativeMarking] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    examType: "Police Bharti",
    durationMinutes: 90,
    negativeMarks: 0.25,
    visibilityMode: "COACHING", // COACHING | FREE_GLOBAL | GLOBAL
    isFree: true,
    price: 0,
    startAt: "",
  });
  const [message, setMessage] = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    Promise.all([
      fetch("/api/coaching/questions").then((r) => r.json()),
      fetch("/api/coaching/batches").then((r) => r.json()),
    ]).then(([q, b]) => {
      setQuestions(q.questions || []);
      setBatches(b.batches || []);
    });
  }, []);

  async function create() {
    if (!form.title) {
      setMessage("Please enter an exam title.");
      return;
    }
    setMessage("Creating examination...");
    const payload = {
      ...form,
      negativeMarks: hasNegativeMarking ? Number(form.negativeMarks || 0.25) : 0,
      questionIds: selected,
    };
    const r = await fetch("/api/coaching/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const d = await r.json();
    if (!r.ok) {
      setMessage(d.error || "Failed to create exam");
      return;
    }
    if (batchIds.length && form.visibilityMode === "COACHING") {
      await fetch(`/api/coaching/exams/${d.exam.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchIds }),
      });
    }
    setMessage(`Successfully created: ${d.exam.title}`);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/coaching/dashboard"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
            Create Coaching Examination
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Publish private coaching exams for your batches or open free/paid tests for all
            students.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Exam Details */}
        <Card className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-1">
          <h2 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Exam Details
          </h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Exam Title *
              </label>
              <input
                placeholder="e.g. Pune Police Constable Weekly Test"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Exam Category (परीक्षेचा प्रकार) *
              </label>
              <select
                value={form.examType}
                onChange={(e) => update("examType", e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              >
                {MAHARASHTRA_EXAM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Scope / Visibility Mode Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Exam Target Scope *
              </label>
              <div className="mt-1.5 space-y-1.5">
                <label
                  onClick={() => update("visibilityMode", "COACHING")}
                  className={`flex cursor-pointer items-start gap-2.5 rounded-2xl border p-2.5 transition ${
                    form.visibilityMode === "COACHING"
                      ? "border-blue-500 bg-blue-50/70 text-blue-900 dark:border-blue-600 dark:bg-blue-950/60 dark:text-blue-200"
                      : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  }`}
                >
                  <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <div className="text-xs">
                    <div className="font-bold">Institute Batches Only (खाजगी)</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Visible only to students enrolled in your coaching institute.
                    </div>
                  </div>
                </label>

                <label
                  onClick={() => {
                    update("visibilityMode", "FREE_GLOBAL");
                    update("isFree", true);
                    update("price", 0);
                  }}
                  className={`flex cursor-pointer items-start gap-2.5 rounded-2xl border p-2.5 transition ${
                    form.visibilityMode === "FREE_GLOBAL"
                      ? "border-emerald-500 bg-emerald-50/70 text-emerald-900 dark:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-200"
                      : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  }`}
                >
                  <Globe className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div className="text-xs">
                    <div className="font-bold">Global Free Test (सर्व विद्यार्थ्यांसाठी मोफत)</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Open to all Maharashtra students as a free mock test.
                    </div>
                  </div>
                </label>

                <label
                  onClick={() => {
                    update("visibilityMode", "GLOBAL");
                    update("isFree", false);
                    update("price", form.price || 49);
                  }}
                  className={`flex cursor-pointer items-start gap-2.5 rounded-2xl border p-2.5 transition ${
                    form.visibilityMode === "GLOBAL"
                      ? "border-indigo-500 bg-indigo-50/70 text-indigo-900 dark:border-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-200"
                      : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  }`}
                >
                  <Tag className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                  <div className="text-xs">
                    <div className="font-bold">Paid Marketplace Exam (सशुल्क विक्री)</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Sell directly to students on the marketplace.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {form.visibilityMode === "GLOBAL" && (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Exam Price (INR ₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.price}
                  onChange={(e) => update("price", Number(e.target.value))}
                  className="mt-1 w-full rounded-2xl border border-indigo-300 bg-indigo-50/30 px-3.5 py-2 text-xs font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:border-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-200"
                  placeholder="e.g. 49"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                placeholder="Instructions or syllabus notes..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Duration (Mins)
                </label>
                <input
                  type="number"
                  value={form.durationMinutes}
                  onChange={(e) => update("durationMinutes", e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={form.startAt}
                  onChange={(e) => update("startAt", e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-2 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={form.endAt || ""}
                  onChange={(e) => update("endAt", e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-2 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-2.5 text-[11px] text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
              🔔 <strong>Automatic Alerts:</strong> Target students receive 4 automated notifications:
              Upon scheduling, <strong>1 hour before</strong>, <strong>10 minutes before</strong>, and at <strong>Go-Live</strong>.
            </div>

            {/* Explicit Negative Marking Toggle */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Negative Marking (नकारात्मक गुणदान)
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {hasNegativeMarking
                      ? "चुकीच्या उत्तरासाठी गुण वजा केले जातील"
                      : "नकारात्मक गुणदान नाही (कोणतीही वजावट नाही)"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHasNegativeMarking(!hasNegativeMarking)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    hasNegativeMarking ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                      hasNegativeMarking ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {hasNegativeMarking && (
                <div className="mt-3">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    Deduction per incorrect answer:
                  </label>
                  <select
                    value={form.negativeMarks}
                    onChange={(e) => setForm({ ...form, negativeMarks: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value={0.25}>0.25 Marks (1/4th - TCS/MPSC Pattern)</option>
                    <option value={0.33}>0.33 Marks (1/3rd Pattern)</option>
                    <option value={0.5}>0.50 Marks (1/2 Mark Pattern)</option>
                    <option value={1.0}>1.00 Mark (Full Mark Deduction)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Questions Selection */}
        <Card className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
              <HelpCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Select Questions
            </h2>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              {selected.length} selected
            </Badge>
          </div>
          <div className="mt-4 max-h-[480px] space-y-2 overflow-auto pr-1">
            {questions.map((q) => (
              <label
                key={q.id}
                className={`flex cursor-pointer gap-3 rounded-2xl border p-3 transition ${
                  selected.includes(q.id)
                    ? "border-blue-500 bg-blue-50/50 dark:border-blue-600 dark:bg-blue-950/40"
                    : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(q.id)}
                  onChange={(e) =>
                    setSelected((s) =>
                      e.target.checked ? [...s, q.id] : s.filter((x) => x !== q.id),
                    )
                  }
                  className="mt-0.5 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs">
                  <span className="line-clamp-2 font-semibold text-slate-900 dark:text-slate-100">
                    {q.questionTextMr || q.questionText}
                  </span>
                  <span className="mt-1 block text-[11px] text-slate-500 dark:text-slate-400">
                    {q.subject?.name || "General"} · {q.marks || 1} Mark
                  </span>
                </span>
              </label>
            ))}
            {!questions.length && (
              <div className="py-8 text-center text-xs text-slate-400">
                No questions available in question bank.
              </div>
            )}
          </div>
        </Card>

        {/* Batch Assignment */}
        <Card className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
                <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Assign Batches
              </h2>
              {form.visibilityMode !== "COACHING" && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Global Test
                </span>
              )}
            </div>

            {form.visibilityMode !== "COACHING" ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <p className="font-bold">🌐 Open for All Students</p>
                <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400">
                  Since this is set as a Global Test, all students across the platform can access it
                  directly without batch restrictions.
                </p>
              </div>
            ) : (
              <div className="mt-4 max-h-[380px] space-y-2 overflow-auto pr-1">
                {batches.map((b) => (
                  <label
                    key={b.id}
                    className={`flex cursor-pointer gap-3 rounded-2xl border p-3 transition ${
                      batchIds.includes(b.id)
                        ? "border-emerald-500 bg-emerald-50/50 dark:border-emerald-600 dark:bg-emerald-950/40"
                        : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={batchIds.includes(b.id)}
                      onChange={(e) =>
                        setBatchIds((s) =>
                          e.target.checked ? [...s, b.id] : s.filter((x) => x !== b.id),
                        )
                      }
                      className="mt-0.5 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs">
                      <b className="text-slate-900 dark:text-slate-100">{b.name}</b>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                        {b.students?.length || 0} students · {b.examType || "General"}
                      </span>
                    </span>
                  </label>
                ))}
                {!batches.length && (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No batches configured yet.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
            <Button
              onClick={create}
              className="w-full rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white shadow-glow transition hover:bg-blue-500 active:scale-95"
            >
              Create Examination
            </Button>
            {message && (
              <div className="mt-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400">
                {message}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
