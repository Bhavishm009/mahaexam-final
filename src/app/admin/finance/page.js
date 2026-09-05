"use client";

import { useEffect, useState } from "react";

export default function Finance() {
  const [d, setD] = useState(null);
  const [msg, setMsg] = useState("");

  async function load() {
    const r = await fetch("/api/admin/coaching-payouts");
    setD(await r.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function process(id) {
    setMsg("Processing...");
    const r = await fetch(`/api/admin/coaching-payouts/${id}/process`, {
      method: "POST",
    });
    const x = await r.json();
    setMsg(r.ok ? "Transfer submitted" : x.error);
    load();
  }

  if (!d) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Financial Control Center
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Marketplace sales, platform earnings and coaching transfers.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["Gross Sales", d.totals?.gross || 0],
            ["Platform Earnings", d.totals?.platform || 0],
            ["Coaching Share", d.totals?.coaching || 0],
          ].map(([label, val]) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</div>
              <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                ₹{Number(val).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Payout Accounts</h2>
          <div className="mt-4 space-y-2">
            {d.accounts?.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 py-3 dark:border-slate-800"
              >
                <div>
                  <b className="text-slate-900 dark:text-slate-100">{a.organization?.name}</b>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {a.status} · KYC {a.kycStatus}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Marketplace Transfers
          </h2>
          {msg && <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">{msg}</div>}
          <div className="mt-4 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-400">
                  <th className="p-3">Coaching</th>
                  <th>Gross</th>
                  <th>Platform</th>
                  <th>Coaching</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {d.transfers?.map((x) => (
                  <tr
                    key={x.id}
                    className="border-b border-slate-200 text-slate-800 dark:border-slate-800 dark:text-slate-200"
                  >
                    <td className="p-3 font-medium text-slate-900 dark:text-white">
                      {x.organization?.name}
                    </td>
                    <td>₹{Number(x.grossAmount || 0).toFixed(2)}</td>
                    <td>₹{Number(x.platformFee || 0).toFixed(2)}</td>
                    <td>₹{Number(x.coachingShare || 0).toFixed(2)}</td>
                    <td>
                      <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {x.status}
                      </span>
                    </td>
                    <td>
                      {x.status === "PENDING" && (
                        <button
                          onClick={() => process(x.id)}
                          className="rounded-lg bg-blue-600 px-3 py-2 font-bold text-white hover:bg-blue-500"
                        >
                          Transfer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
