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
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <a href="/admin" className="text-sm font-semibold text-blue-600">
          ← Admin
        </a>
        <h1 className="mt-3 text-3xl font-black">Subscription Plans</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.id} className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">{p.name}</h2>
              <div className="mt-2 text-3xl font-black">₹{p.price}</div>
              <p className="mt-3 text-sm text-slate-500">
                {p.maxStudents || "∞"} students · {p.maxBatches || "∞"} batches ·{" "}
                {p.maxExams || "∞"} exams
              </p>
              <button
                onClick={() => toggle(p)}
                className={`mt-5 rounded-xl px-4 py-2 font-semibold ${p.active ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
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
