"use client";

import { useEffect, useState } from "react";

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const r = await fetch("/api/coaching/batches");
    const d = await r.json();
    setBatches(d.batches || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    const r = await fetch("/api/coaching/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const d = await r.json();
    if (!r.ok) {
      return setMsg(d.error);
    }
    setName("");
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Coaching Batches</h1>
        <div className="mt-6 flex flex-wrap gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Batch name"
            className="rounded-xl border border-slate-300 bg-white p-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white placeholder:text-slate-400"
          />
          <button onClick={add} className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-500 transition-colors">
            Create
          </button>
        </div>
        {msg && <p className="mt-2 text-red-600 dark:text-red-400">{msg}</p>}
        <div className="mt-6 grid gap-3">
          {batches.map((b) => (
            <div key={b.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <b className="text-lg font-bold text-slate-900 dark:text-white">{b.name}</b>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Code: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{b.code}</span> · Students: <span className="font-semibold text-slate-700 dark:text-slate-300">{b._count?.memberships || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
