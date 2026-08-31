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
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-black">Coaching Payout Account</h1>
        <p className="mt-1 text-slate-500">Configure the account used for marketplace earnings.</p>
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
            Live payouts require Razorpay Route Linked Account approval and KYC.
          </div>
          <div className="grid gap-3">
            <input
              placeholder="Account / business name"
              value={form.accountName}
              onChange={(e) => setForm({ ...form, accountName: e.target.value })}
              className="rounded-xl border p-3"
            />
            <input
              placeholder="Email"
              value={form.accountEmail}
              onChange={(e) => setForm({ ...form, accountEmail: e.target.value })}
              className="rounded-xl border p-3"
            />
            <input
              placeholder="Contact"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              className="rounded-xl border p-3"
            />
            <button onClick={save} className="rounded-xl bg-blue-600 py-3 font-bold text-white">
              Submit
            </button>
          </div>
          {msg && <p className="mt-3 text-sm">{msg}</p>}
        </div>
        {d?.account && (
          <div className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
            <b>Status: {d.account.status}</b>
            <div className="mt-1 text-sm text-slate-500">KYC: {d.account.kycStatus}</div>
          </div>
        )}
      </div>
    </main>
  );
}
