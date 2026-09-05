"use client";
import { useEffect, useState } from "react";
export default function Plans() {
  const [plans, setPlans] = useState([]);
  useEffect(() => {
    fetch("/api/admin/plans")
      .then((r) => r.json())
      .then((d) => setPlans(d.plans || []));
  }, []);
  async function toggle(p) {
    const r = await fetch("/api/admin/plans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, active: !p.active }),
    });
    const d = await r.json();
    setPlans((x) => x.map((q) => (q.id === p.id ? d.plan : q)));
  }
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl">
        <a
          href="/admin"
          className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Admin
        </a>
        <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
          Subscription Plans
        </h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{p.name}</h2>
              <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                ₹{p.price}
              </div>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                {p.maxStudents || "∞"} students · {p.maxBatches || "∞"} batches ·{" "}
                {p.maxExams || "∞"} exams
              </p>
              <button
                onClick={() => toggle(p)}
                className={`mt-5 rounded-xl px-4 py-2 font-semibold transition-colors ${
                  p.active
                    ? "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-400 dark:hover:bg-rose-900/50"
                    : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                }`}
              >
                {p.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
