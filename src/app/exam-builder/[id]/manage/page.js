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
    return <main className="grid min-h-screen place-items-center">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-black">{exam.title}</h1>
        <div className="mt-2 text-sm text-slate-500">
          {exam.status} · {exam.questionSnapshots?.length || 0} fixed questions ·{" "}
          {exam.questionPools?.length || 0} pools {exam.frozenAt ? "· FROZEN" : ""}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={`/exam-builder/${id}/pools`}
            className="rounded-xl border bg-white px-5 py-3 font-bold"
          >
            Manage Pools
          </a>
          {exam.status === "DRAFT" && (
            <button
              onClick={() => action("publish")}
              className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
            >
              Publish Exam
            </button>
          )}
          {!exam.frozenAt && exam.status !== "DRAFT" && (
            <button
              onClick={() => action("freeze")}
              className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"
            >
              Freeze Exam
            </button>
          )}
        </div>
        {msg && <div className="mt-4 rounded-xl bg-white p-4">{msg}</div>}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-black">Publish Audit</h2>
          {exam.publishAudits?.map((a) => (
            <div key={a.id} className="border-t py-3 text-sm">
              <b>{a.action}</b> · {new Date(a.createdAt).toLocaleString()}
              <div className="break-all text-xs text-slate-500">{a.snapshotHash}</div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
