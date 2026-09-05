"use client";

import { useEffect, useState } from "react";

export default function Pools({ params }) {
  const [pools, setPools] = useState([]);
  const [form, setForm] = useState({
    name: "",
    questionCount: 10,
    selectionMode: "RANDOM",
    difficulty: "",
    sectionName: "",
  });
  const [msg, setMsg] = useState("");
  const [id, setId] = useState(null);

  useEffect(() => {
    Promise.resolve(params).then((p) => {
      setId(p.id);
      fetch(`/api/exam-builder/${p.id}/pools`)
        .then((r) => r.json())
        .then((d) => setPools(d.pools || []));
    });
  }, [params]);

  async function load(examId) {
    const targetId = examId || id;
    if (!targetId) {
      return;
    }
    const r = await fetch(`/api/exam-builder/${targetId}/pools`);
    const d = await r.json();
    setPools(d.pools || []);
  }

  async function add(e) {
    e.preventDefault();
    if (!id) {
      return;
    }
    const r = await fetch(`/api/exam-builder/${id}/pools`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    if (!r.ok) {
      return setMsg(d.error);
    }
    setMsg("Pool added");
    setForm({ ...form, name: "" });
    load(id);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Question Pools</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Choose random questions from a larger authorized pool.
        </p>
        <form
          onSubmit={add}
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["name", "Pool name"],
              ["questionCount", "Questions to select"],
              ["sectionName", "Section"],
              ["difficulty", "Difficulty"],
            ].map(([k, l]) => (
              <label key={k} className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {l}
                <input
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required={k === "name"}
                />
              </label>
            ))}
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Selection mode
              <select
                value={form.selectionMode}
                onChange={(e) => setForm({ ...form, selectionMode: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="RANDOM">Random</option>
                <option value="FIXED">Fixed</option>
                <option value="POOL">Pool</option>
              </select>
            </label>
          </div>
          <button className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-sm transition-colors hover:bg-blue-500">
            Add Pool
          </button>
          {msg && <span className="ml-3 text-sm text-slate-600 dark:text-slate-400">{msg}</span>}
        </form>
        <div className="mt-6 space-y-3">
          {pools.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <b className="text-lg font-bold text-slate-900 dark:text-white">{p.name}</b>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {p.selectionMode}
                </span>
              </div>
              <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Select {p.questionCount} · {p.sectionName || "No section"} ·{" "}
                {p.difficulty || "Any difficulty"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
