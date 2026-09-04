"use client";

import { useEffect, useState } from "react";

export default function Checkout({ params }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [examId, setExamId] = useState(null);

  useEffect(() => {
    Promise.resolve(params).then((p) => {
      setExamId(p.examId);
      fetch(`/api/exams/${p.examId}/access`)
        .then((r) => r.json())
        .then(setData);
    });
  }, [params]);

  async function buy() {
    if (!examId) {
      return;
    }
    setLoading(true);
    setMsg("");
    const r = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId }),
    });
    const d = await r.json();
    if (!r.ok) {
      setMsg(d.error || "Failed to create payment order");
      setLoading(false);
      return;
    }
    if (!window.Razorpay) {
      setMsg(
        "Razorpay Checkout script is not loaded. Add the official checkout script in your root layout.",
      );
      setLoading(false);
      return;
    }
    const options = {
      key: d.order.keyId,
      amount: d.order.amount,
      currency: d.order.currency,
      name: "MahaExam",
      description: data?.exam?.title,
      order_id: d.order.id,
      handler: async (response) => {
        const vr = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          }),
        });
        const vd = await vr.json();
        if (vr.ok) {
          location.href = `/exam/${examId}/attempt`;
        } else {
          setMsg(vd.error || "Payment verification failed");
        }
      },
      modal: {
        ondismiss: () => setMsg("Payment window closed."),
      },
    };
    new window.Razorpay(options).open();
    setLoading(false);
  }

  if (!data) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-400">
        Loading...
      </main>
    );
  }

  if (data.allowed) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 dark:bg-slate-950">
        <a
          href={`/exam/${examId}/attempt`}
          className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-blue-500"
        >
          Start Exam
        </a>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 transition-colors dark:bg-slate-950">
      <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
          {data.exam?.title}
        </h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
          Purchase access to attempt this examination.
        </p>
        <div className="mt-8 text-4xl font-black text-slate-900 dark:text-white">
          ₹{data.exam?.price}
        </div>
        <button
          disabled={loading}
          onClick={buy}
          className="mt-8 w-full rounded-xl bg-blue-600 py-3 font-bold text-white shadow-sm transition hover:bg-blue-500 active:scale-95 disabled:opacity-50"
        >
          {loading ? "Opening payment..." : "Pay & Unlock Exam"}
        </button>
        {msg && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-rose-950/50 dark:text-rose-300">
            {msg}
          </p>
        )}
      </div>
    </main>
  );
}
