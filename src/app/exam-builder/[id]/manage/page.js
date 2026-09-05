"use client";

import { useEffect, useState } from "react";

export default function Manage({ params }) {
  const [exam, setExam] = useState(null);
  const [msg, setMsg] = useState("");
  const [id, setId] = useState(null);

  useEffect(() => {
    Promise.resolve(params).then((p) => {
      setId(p.id);
      fetch(`/api/exam-builder/${p.id}`)
        .then((r) => r.json())
        .then((d) => setExam(d.exam));
    });
  }, [params]);

  async function load(examId) {
    const targetId = examId || id;
    if (!targetId) {
      return;
    }
    const r = await fetch(`/api/exam-builder/${targetId}`);
    const d = await r.json();
    setExam(d.exam);
  }

  async function action(path) {
    if (!id) {
      return;
    }
    const r = await fetch(`/api/exam-builder/${id}/${path}`, {
      method: "POST",
    });
    const d = await r.json();
    setMsg(r.ok ? `${path} successful` : d.error);
    load(id);
  }

  if (!exam) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">{exam.title}</h1>
        <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {exam.status} · {exam.questionSnapshots?.length || 0} fixed questions ·{" "}
          {exam.questionPools?.length || 0} pools {exam.frozenAt ? "· FROZEN" : ""}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={`/exam-builder/${id}/pools`}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-800 shadow-sm transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Manage Pools
          </a>
          {exam.status === "DRAFT" && (
            <button
              onClick={() => action("publish")}
              className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-sm transition-colors hover:bg-blue-500"
            >
              Publish Exam
            </button>
          )}
          {!exam.frozenAt && exam.status !== "DRAFT" && (
            <button
              onClick={() => action("freeze")}
              className="rounded-xl bg-slate-800 px-5 py-3 font-bold text-white shadow-sm transition-colors hover:bg-slate-700"
            >
              Freeze Exam
            </button>
          )}
        </div>
        {msg && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-slate-800 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            {msg}
          </div>
        )}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-black text-slate-900 dark:text-white">Publish Audit</h2>
          {exam.publishAudits?.map((a) => (
            <div
              key={a.id}
              className="border-t border-slate-100 py-3 text-sm text-slate-800 dark:border-slate-800 dark:text-slate-200"
            >
              <b className="text-slate-900 dark:text-white">{a.action}</b> ·{" "}
              {new Date(a.createdAt).toLocaleString()}
              <div className="break-all text-xs text-slate-500 dark:text-slate-400">
                {a.snapshotHash}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
