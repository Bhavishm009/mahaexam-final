"use client";

import { useEffect, useState } from "react";

export default function CoachingFinance() {
  const [d, setD] = useState(null);
  const [form, setForm] = useState({
    accountName: "",
    accountEmail: "",
    contact: "",
  });
  const [msg, setMsg] = useState("");

  async function load() {
    const r = await fetch("/api/coaching/payout-account");
    setD(await r.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    const r = await fetch("/api/coaching/payout-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const x = await r.json();
    setMsg(r.ok ? "Submitted for KYC/approval" : x.error);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Coaching Payout Account</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Configure the account used for marketplace earnings.</p>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
            Live payouts require Razorpay Route Linked Account approval and KYC.
          </div>
          <div className="grid gap-3">
            <input
              placeholder="Account / business name"
              value={form.accountName}
              onChange={(e) => setForm({ ...form, accountName: e.target.value })}
              className="rounded-xl border border-slate-300 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
            />
            <input
              placeholder="Email"
              value={form.accountEmail}
              onChange={(e) => setForm({ ...form, accountEmail: e.target.value })}
              className="rounded-xl border border-slate-300 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
            />
            <input
              placeholder="Contact"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              className="rounded-xl border border-slate-300 bg-white p-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
            />
            <button onClick={save} className="rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-500 transition-colors">
              Submit
            </button>
          </div>
          {msg && <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{msg}</p>}
        </div>
        {d?.account && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <b className="text-slate-900 dark:text-white">Status: {d.account.status}</b>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">KYC: {d.account.kycStatus}</div>
          </div>
        )}
      </div>
    </main>
  );
}
