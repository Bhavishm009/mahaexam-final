"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Lock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Sparkles,
  ShieldCheck,
  X,
} from "lucide-react";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function RazorpayPaymentModal({ exam, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const examPrice = Number(exam?.price || 1);

  async function handleCheckout() {
    setLoading(true);
    setErrorMsg("");

    try {
      // 1. Ensure Razorpay Checkout script is loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error(
          "Razorpay Checkout SDK failed to load. Please check your internet connection.",
        );
      }

      // 2. Call backend to create Razorpay Order
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId: exam.id }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || "Unable to create payment order");
      }

      if (orderData.alreadyPurchased) {
        toast.info("Exam is already unlocked!");
        onSuccess?.();
        return;
      }

      // 3. Configure Razorpay Standard Checkout options
      const options = {
        key:
          orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TYdQhv3Hll4Q5X",
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "MahaExam Platform",
        description: exam.title || "Exam Access",
        order_id: orderData.order_id || orderData.id,
        handler: async function (response) {
          try {
            setLoading(true);
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                examId: exam.id,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              toast.success(
                "🎉 पेमेंट यशस्वी! परीक्षा अनलॉक झाली आहे. (Payment verified! Exam unlocked.)",
              );
              onSuccess?.();
            } else {
              const err = verifyData.error || "Payment signature verification failed";
              toast.error(err);
              setErrorMsg(err);
            }
          } catch (err) {
            toast.error(err.message || "Failed to verify payment");
            setErrorMsg(err.message);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.info("पेमेंट रद्द केले (Payment dismissed)");
            onCancel?.();
          },
        },
        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        setLoading(false);
        const desc = response.error?.description || "Payment failed";
        toast.error(`Payment failed: ${desc}`);
        setErrorMsg(desc);
      });

      rzp.open();
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error(err.message || "Payment initiation failed");
      setErrorMsg(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg overflow-hidden rounded-3xl border border-blue-200 bg-white p-6 shadow-xl transition-all dark:border-blue-900/60 dark:bg-slate-900 sm:p-8">
      {/* Test Mode Badge */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>🧪 Razorpay Test Mode</span>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Header */}
      <div className="mt-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          <Lock className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
          सशुल्क परीक्षा (Paid Mock Test)
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
          ही परीक्षा सोडवण्यासाठी कृपया पेमेंट पूर्ण करा. एकदा पेमेंट झाल्यावर परीक्षा लगेच सुरू
          होईल.
        </p>
      </div>

      {/* Exam Summary Box */}
      <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          निवडलेली परीक्षा:
        </div>
        <div className="mt-1 text-sm font-black text-slate-900 dark:text-white sm:text-base">
          {exam?.title || "Maharashtra Competitive Mock Test"}
        </div>
        <div className="mt-4 flex items-baseline justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            प्रवेश शुल्क (Price):
          </span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400">₹{examPrice}</span>
        </div>
      </div>

      {/* Feature Bullet Points */}
      <ul className="mt-5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
        <li className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>अस्सल TCS/IBPS पॅटर्न संगणकीय परीक्षा (CBT Simulator)</span>
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>त्वरित सविस्तर निकाल व महाराष्ट्र राज्यस्तरीय रँक</span>
        </li>
        <li className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-blue-500" />
          <span>सुरक्षित Razorpay टेस्ट गेटवेद्वारे त्वरित अनलॉकिंग</span>
        </li>
      </ul>

      {/* Error Message */}
      {errorMsg && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-rose-50 p-3 text-xs font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-6">
        <button
          type="button"
          disabled={loading}
          onClick={handleCheckout}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50"
        >
          <CreditCard className="h-4 w-4" />
          <span>
            {loading ? "पेमेंट विंडो उघडत आहे..." : `₹${examPrice} पेमेंट करा व परीक्षा सुरू करा`}
          </span>
        </button>
      </div>

      <p className="mt-3 text-center text-[11px] text-slate-400">
        Test Mode: You can use test cards / netbanking simulation to test payment.
      </p>
    </div>
  );
}

export default RazorpayPaymentModal;
