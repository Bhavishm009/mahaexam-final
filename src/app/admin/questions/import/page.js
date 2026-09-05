"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";

const sample = `questionText,questionTextMr,optionA,optionB,optionC,optionD,correctAnswer,subject,difficulty,marks,negativeMarks,explanation
Which city is the capital of Maharashtra?,महाराष्ट्राची राजधानी कोणती?,Mumbai,Pune,Nagpur,Nashik,A,General Knowledge,EASY,1,0.25,Mumbai is the capital of Maharashtra.
What is the official language of Maharashtra?,महाराष्ट्राची अधिकृत भाषा कोणती?,Marathi,Hindi,English,Gujarati,A,Marathi,EASY,1,0.25,Marathi is the official language of Maharashtra.`;

export default function AdminImportQuestionsPage() {
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
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/admin/questions/bank"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Question Bank
            </Link>
            <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
              Bulk Question Import
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Upload CSV file with MCQs in Marathi or English to auto-populate the question bank.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Download CSV Template</span>
            </button>

            {subjects.length > 0 && (
              <select
                value={defaultSubjectId}
                onChange={(e) => setDefaultSubjectId(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="">Select Default Subject (Optional)</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
            <Upload className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-200">
              Select CSV file to upload
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0] || null)}
              className="mt-3 block w-full text-xs text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-blue-500"
            />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={previewFile}
              disabled={!file || loading}
              className="rounded-2xl border border-slate-200 bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-800 transition hover:bg-slate-200 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Preview CSV
            </button>
            <button
              onClick={importFile}
              disabled={!file || loading}
              className="rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow transition hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Import Questions Now"}
            </button>
          </div>
        </div>

        {preview && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              CSV Preview ({preview.validCount || 0} valid questions)
            </h2>
            {preview.errors?.length > 0 && (
              <div className="mt-3 rounded-2xl bg-rose-50 p-4 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                {preview.errors.map((e, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{e}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 max-h-80 overflow-y-auto rounded-2xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Question</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Difficulty</th>
                    <th className="p-3">Correct</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(preview.rows || []).map((r, i) => (
                    <tr key={i}>
                      <td className="p-3 font-bold">{i + 1}</td>
                      <td className="p-3 font-medium">{r.questionTextMr || r.questionText}</td>
                      <td className="p-3">{r.subject || "General"}</td>
                      <td className="p-3 font-bold">{r.difficulty || "EASY"}</td>
                      <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                        {r.correctAnswer}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {result && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/40">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
              <h2 className="text-lg font-bold">Import Result</h2>
            </div>
            <p className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {result.importedCount} questions successfully imported into the bank!
            </p>
            <div className="mt-4">
              <Link
                href="/admin/questions/bank"
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500"
              >
                Go to Question Bank
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
