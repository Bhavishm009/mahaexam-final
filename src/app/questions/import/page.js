"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";

const sample = `questionText,questionTextMr,optionA,optionB,optionC,optionD,correctAnswer,subject,difficulty,marks,negativeMarks,explanation
Which city is the capital of Maharashtra?,महाराष्ट्राची राजधानी कोणती?,Mumbai,Pune,Nagpur,Nashik,A,General Knowledge,EASY,1,0.25,Mumbai is the capital of Maharashtra.
What is the official language of Maharashtra?,महाराष्ट्राची अधिकृत भाषा कोणती?,Marathi,Hindi,English,Gujarati,A,Marathi,EASY,1,0.25,Marathi is the official language of Maharashtra.`;

export default function ImportQuestions() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [defaultSubjectId, setDefaultSubjectId] = useState("");

  useEffect(() => {
    fetch("/api/question-bank?take=100")
      .then((r) => r.json())
      .then((d) => {
        const unique = [];
        const seen = new Set();
        (d.questions || []).forEach((q) => {
          if (q.question?.subject && !seen.has(q.question.subject.id)) {
            seen.add(q.question.subject.id);
            unique.push(q.question.subject);
          }
        });
        setSubjects(unique);
      })
      .catch(() => {});
  }, []);

  async function previewFile() {
    if (!file) {
      return;
    }
    const f = new FormData();
    f.append("file", file);
    if (defaultSubjectId) {
      f.append("defaultSubjectId", defaultSubjectId);
    }
    setLoading(true);
    const r = await fetch("/api/questions/import/preview", { method: "POST", body: f });
    setPreview(await r.json());
    setLoading(false);
  }

  async function importFile() {
    if (!file) {
      return;
    }
    const f = new FormData();
    f.append("file", file);
    if (defaultSubjectId) {
      f.append("defaultSubjectId", defaultSubjectId);
    }
    setLoading(true);
    const r = await fetch("/api/questions/import", { method: "POST", body: f });
    const d = await r.json();
    setResult(d);
    setLoading(false);
  }

  function downloadTemplate() {
    const b = new Blob([sample], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = "mahaexam-question-template.csv";
    a.click();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/questions/bank"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Question Bank
            </Link>
            <h1 className="mt-2 text-3xl font-black text-slate-900">Bulk Question Import</h1>
            <p className="mt-1 text-xs text-slate-500">
              Upload CSV file with MCQs in Marathi or English to auto-populate the question bank.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-800 transition hover:bg-slate-100"
            >
              <FileText className="h-4 w-4 text-blue-600" />
              Download CSV Template
            </button>

            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setPreview(null);
                setResult(null);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 file:mr-3 file:rounded-xl file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-xs file:font-bold file:text-blue-700"
            />
            <select
              value={defaultSubjectId}
              onChange={(e) => setDefaultSubjectId(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
            >
              <option value="">Auto-detect Subject from CSV</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameMr ? `${s.nameMr} (${s.name})` : s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
            <p className="font-bold text-slate-800">CSV Header Format:</p>
            <p className="mt-1 font-mono text-[11px] text-slate-700">
              questionText, questionTextMr, optionA, optionB, optionC, optionD, correctAnswer,
              subject, difficulty, marks, negativeMarks, explanation
            </p>
            <p className="mt-1.5 text-[11px] text-slate-500">
              • `subject` can be Marathi, English, History, Geography, General Knowledge,
              Constitution, Science, Mathematics, Reasoning, etc.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              disabled={!file || loading}
              onClick={previewFile}
              className="rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Checking..." : "Validate & Preview"}
            </button>
            <button
              disabled={!preview?.valid || loading}
              onClick={importFile}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow transition hover:bg-blue-500 disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" />
              Import Valid Questions
            </button>
          </div>
        </div>

        {preview && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-900">Validation Preview</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Stat n={preview.total} l="Total Rows" color="text-slate-900" />
              <Stat n={preview.valid} l="Valid Questions" color="text-emerald-600" />
              <Stat n={preview.invalid} l="Invalid Rows" color="text-rose-600" />
            </div>
            <div className="mt-5 max-h-72 space-y-2 overflow-auto pr-1">
              {preview.preview.map((x) => (
                <div
                  key={x.index}
                  className={`flex items-start gap-2.5 rounded-2xl border p-3 text-xs ${
                    x.valid ? "border-slate-200 bg-slate-50/50" : "border-rose-200 bg-rose-50/50"
                  }`}
                >
                  {x.valid ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600" />
                  )}
                  <div>
                    <b>Row {x.index}:</b> {x.valid ? "Ready for import" : x.errors.join("; ")}
                    <div className="mt-0.5 font-medium text-slate-700">
                      {x.row.questionTextMr || x.row.questionText}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {result && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Import Completed Successfully
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-4">
              <Stat n={result.importedRows} l="Successfully Imported" color="text-emerald-600" />
              <Stat n={result.duplicateRows} l="Skipped Duplicates" color="text-amber-600" />
              <Stat n={result.invalidRows} l="Failed / Invalid" color="text-rose-600" />
              <Stat n={result.totalRows} l="Total Analyzed" color="text-slate-900" />
            </div>
            {result.errors?.length > 0 && (
              <div className="mt-5 rounded-2xl bg-rose-50 p-4 text-xs text-rose-800">
                <div className="font-bold">Errors occurred on the following rows:</div>
                {result.errors.slice(0, 20).map((e, i) => (
                  <div key={i} className="mt-1">
                    Row {e.row}: {e.errors.join("; ")}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6">
              <Link
                href="/questions/bank"
                className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                Go to Question Bank &rarr;
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Stat({ n, l, color = "text-slate-900" }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="text-xs font-semibold text-slate-500">{l}</div>
      <div className={`mt-1 text-2xl font-black ${color}`}>{n}</div>
    </div>
  );
}
