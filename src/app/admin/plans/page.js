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
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.id}
              className="glass-card flex flex-col justify-between p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">{p.name}</h2>
                <div className="mt-2 text-3xl font-black text-sky-600 dark:text-sky-400">
                  ₹{p.price}
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {p.maxStudents || "∞"} students · {p.maxBatches || "∞"} batches ·{" "}
                  {p.maxExams || "∞"} exams
                </p>
              </div>
              <button
                onClick={() => toggle(p)}
                className={`mt-6 rounded-xl border px-4 py-2 text-xs font-bold transition-all active:scale-95 ${
                  p.active
                    ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/60 dark:text-rose-300"
                    : "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/60 dark:text-emerald-300"
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
