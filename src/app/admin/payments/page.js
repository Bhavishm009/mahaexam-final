"use client";
import { useEffect, useState } from "react";
export default function Payments() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    fetch("/api/admin/payments")
      .then((r) => r.json())
      .then((d) => setItems(d.payments || []));
  }, []);
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl">
        <a
          href="/admin"
          className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Admin
        </a>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
              Payments & Transactions
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Audit log of all student mock test checkouts, subscriptions, and Razorpay settlements.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              Total Logged: <b>{items.length}</b>
            </span>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/80 dark:text-slate-400">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Customer / Student</th>
                <th className="p-4">Exam / Item</th>
                <th className="p-4">Razorpay Identifiers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 dark:divide-slate-800 dark:text-slate-200">
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                items.map((p) => {
                  const amt = Number(
                    p.amount > 0 ? p.amount : p.amountPaise ? p.amountPaise / 100 : 0,
                  );
                  const isVerified = ["VERIFIED", "PAID", "SUCCESS", "CAPTURED"].includes(p.status);
                  return (
                    <tr
                      key={p.id}
                      className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      <td className="p-4 text-xs text-slate-600 dark:text-slate-400">
                        {new Date(p.paidAt || p.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        ₹{amt.toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            isVerified
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {p.user?.name || "Student"}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {p.user?.email || "—"} {p.user?.phone ? `• ${p.user.phone}` : ""}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="max-w-xs truncate font-medium text-slate-900 dark:text-slate-100 sm:max-w-sm">
                          {p.exam?.title || p.subscription?.plan?.name || "Exam Checkout Access"}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {p.organization?.name || "Direct Platform"}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                        <div>
                          <span className="text-[10px] font-semibold uppercase text-slate-400">
                            Pay:{" "}
                          </span>
                          {p.razorpayPaymentId || p.paymentId || "—"}
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold uppercase text-slate-400">
                            Order:{" "}
                          </span>
                          {p.razorpayOrderId || p.orderId || "—"}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
