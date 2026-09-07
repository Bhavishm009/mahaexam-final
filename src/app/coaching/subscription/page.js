"use client";
import { useEffect, useState } from "react";
export default function SubscriptionPage() {
  const [plans, setPlans] = useState([]);
  const [message, setMessage] = useState("");
  useEffect(() => {
    fetch("/api/subscription-plans")
      .then((r) => r.json())
      .then((d) => setPlans(d.plans || []));
  }, []);
  async function buy(planId) {
    setMessage("Creating order...");
    const r = await fetch("/api/payments/subscription/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    const d = await r.json();
    if (!r.ok) {
      return setMessage(d.error);
    }
    if (d.order.demo) {
      const vr = await fetch("/api/payments/subscription/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          localPaymentId: d.payment.id,
          paymentId: `demo_payment_${Date.now()}`,
          signature: `demo_signature_${d.order.id}_demo_payment`,
        }),
      });
      setMessage(vr.ok ? "Demo subscription activated." : "Demo verification failed.");
      return;
    }
    setMessage("Razorpay order created. Connect the Razorpay Checkout UI here for live payment.");
  }
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Coaching Plans</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Choose a plan for your institute.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.id}
              className="glass-card flex flex-col justify-between p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">{p.name}</h2>
                <div className="mt-3 text-4xl font-black text-amber-500 dark:text-amber-400">
                  ₹{p.price}
                </div>
                <div className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-300">
                  {p.billingPeriod.toLowerCase()}
                </div>
                <ul className="mt-5 space-y-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <li>• Students: {p.maxStudents || "Unlimited"}</li>
                  <li>• Batches: {p.maxBatches || "Unlimited"}</li>
                  <li>• Exams: {p.maxExams || "Unlimited"}</li>
                </ul>
              </div>
              <button
                onClick={() => buy(p.id)}
                className="glass-btn-primary mt-6 w-full rounded-2xl px-4 py-3 text-xs font-black text-white shadow-md transition active:scale-95"
              >
                Choose Plan
              </button>
            </div>
          ))}
        </div>
        {message && <p className="mt-5 text-sm text-slate-600 dark:text-slate-400">{message}</p>}
      </div>
    </main>
  );
}
