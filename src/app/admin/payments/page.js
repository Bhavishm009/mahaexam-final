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
        <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white">Payments</h1>
        <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
              <tr>
                <th className="p-4 font-semibold">Date</th>
                <th className="font-semibold">Amount</th>
                <th className="font-semibold">Status</th>
                <th className="font-semibold">Institute / User</th>
                <th className="font-semibold">Razorpay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 dark:divide-slate-800 dark:text-slate-200">
              {items.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-slate-100 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {new Date(p.createdAt).toLocaleString()}
                  </td>
                  <td className="font-semibold text-slate-900 dark:text-white">₹{p.amount}</td>
                  <td>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        p.status === "SUCCESS" || p.status === "CAPTURED"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="text-slate-700 dark:text-slate-300">
                    {p.organization?.name || p.user?.email || "—"}
                  </td>
                  <td className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {p.razorpayPaymentId || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
