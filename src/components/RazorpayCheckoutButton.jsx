"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function RazorpayCheckoutButton({ examId, title, price, onSuccess }) {
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);
    try {
      const r = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Unable to create order");
      if (d.alreadyPurchased) {
        toast.info("Exam is already unlocked!");
        onSuccess?.();
        return;
      }
      const script = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!script || !window.Razorpay) throw new Error("Razorpay checkout failed to load");

      const rz = new window.Razorpay({
        key: d.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TYdQhv3Hll4Q5X",
        amount: d.amount,
        currency: d.currency || "INR",
        name: "MahaExam",
        description: title || "Exam Access",
        order_id: d.order_id || d.id,
        handler: async (response) => {
          const vr = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              examId,
            }),
          });
          const vd = await vr.json();
          if (!vr.ok || !vd.success) {
            toast.error(vd.error || "Payment verification failed");
          } else {
            toast.success("🎉 Payment verified! Exam unlocked successfully.");
            onSuccess?.();
          }
        },
        modal: { ondismiss: () => setLoading(false) },
        theme: { color: "#2563eb" },
      });

      rz.on("payment.failed", (response) => {
        setLoading(false);
        toast.error(`Payment failed: ${response.error?.description || "Transaction failed"}`);
      });

      rz.open();
    } catch (e) {
      toast.error(e.message);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={pay}
      disabled={loading}
      className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow transition hover:bg-blue-500 disabled:opacity-50"
    >
      {loading ? "Opening payment..." : `Pay ₹${price || 1} & Unlock Exam`}
    </button>
  );
}

function loadScript(src) {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}
