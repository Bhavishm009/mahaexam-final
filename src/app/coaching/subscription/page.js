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
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-black">Coaching Plans</h1>
        <p className="mt-2 text-slate-500">Choose a plan for your institute.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.id} className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">{p.name}</h2>
              <div className="mt-3 text-4xl font-black">₹{p.price}</div>
              <div className="mt-1 text-sm text-slate-500">{p.billingPeriod.toLowerCase()}</div>
              <ul className="mt-5 space-y-2 text-sm">
                <li>Students: {p.maxStudents || "Unlimited"}</li>
                <li>Batches: {p.maxBatches || "Unlimited"}</li>
                <li>Exams: {p.maxExams || "Unlimited"}</li>
              </ul>
              <button
                onClick={() => buy(p.id)}
                className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white"
              >
                Choose Plan
              </button>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm text-slate-500">{message}</p>
      </div>
    </main>
  );
}
