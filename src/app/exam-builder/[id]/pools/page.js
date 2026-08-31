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
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-black">Question Pools</h1>
        <p className="mt-1 text-slate-500">
          Choose random questions from a larger authorized pool.
        </p>
        <form onSubmit={add} className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["name", "Pool name"],
              ["questionCount", "Questions to select"],
              ["sectionName", "Section"],
              ["difficulty", "Difficulty"],
            ].map(([k, l]) => (
              <label key={k} className="text-sm font-semibold">
                {l}
                <input
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className="mt-1 w-full rounded-xl border p-3"
                  required={k === "name"}
                />
              </label>
            ))}
            <label className="text-sm font-semibold">
              Selection mode
              <select
                value={form.selectionMode}
                onChange={(e) => setForm({ ...form, selectionMode: e.target.value })}
                className="mt-1 w-full rounded-xl border p-3"
              >
                <option value="RANDOM">Random</option>
                <option value="FIXED">Fixed</option>
                <option value="POOL">Pool</option>
              </select>
            </label>
          </div>
          <button className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white">
            Add Pool
          </button>
          {msg && <span className="ml-3 text-sm text-slate-500">{msg}</span>}
        </form>
        <div className="mt-6 space-y-3">
          {pools.map((p) => (
            <div key={p.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex justify-between">
                <b>{p.name}</b>
                <span className="text-xs font-bold">{p.selectionMode}</span>
              </div>
              <div className="mt-2 text-sm text-slate-500">
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
