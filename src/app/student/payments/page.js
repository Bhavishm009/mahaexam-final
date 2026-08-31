"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard } from "lucide-react";

export default function Payments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/payments")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.payments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen space-y-6 font-sans text-slate-900 transition-colors dark:text-slate-100">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-blue-100 backdrop-blur-md">
                <CreditCard className="h-3.5 w-3.5 text-amber-300" />
                Billing & Purchases
              </span>
              <h1 className="mt-3 text-2xl font-black sm:text-3xl">
                My Purchases & Payment History
              </h1>
              <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                Track payments, invoice receipts, and subscription packages.
              </p>
            </div>
            <Link
              href="/student/dashboard"
              className="inline-flex items-center gap-1.5 self-start rounded-2xl bg-white/20 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/30 sm:self-auto"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <h2 className="text-base font-black text-slate-900 dark:text-white sm:text-lg">
            Transaction History (व्यवहार इतिहास)
          </h2>

          {loading ? (
            <div className="grid min-h-[30vh] place-items-center">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <span>Loading purchases...</span>
              </div>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="rounded-l-xl p-3.5 font-bold">Exam Package</th>
                    <th className="p-3.5 font-bold">Amount</th>
                    <th className="p-3.5 font-bold">Status</th>
                    <th className="rounded-r-xl p-3.5 font-bold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((x) => (
                    <tr
                      key={x.id}
                      className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {x.exam?.title || "Exam Package"}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                        ₹{((x.amountPaise || 0) / 100).toFixed(2)}
                      </td>
                      <td className="p-3.5">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                          {x.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 dark:text-slate-400">
                        {new Date(x.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {!items.length && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-xs text-slate-400">
                        All currently available mock tests are 100% free. No paid transactions
                        found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
