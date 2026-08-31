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
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-black">Coaching Batches</h1>
        <div className="mt-6 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Batch name"
            className="rounded-xl border p-3"
          />
          <button onClick={add} className="rounded-xl bg-blue-600 px-5 font-bold text-white">
            Create
          </button>
        </div>
        {msg && <p className="mt-2 text-red-600">{msg}</p>}
        <div className="mt-6 grid gap-3">
          {batches.map((b) => (
            <div key={b.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <b>{b.name}</b>
              <div className="text-sm text-slate-500">
                Code: {b.code} · Students: {b._count?.memberships || 0}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
