"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Building2,
  Wallet,
  ArrowUpRight,
} from "lucide-react";

export default function Finance() {
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  async function load() {
    try {
      setLoading(true);
      const r = await fetch("/api/admin/coaching-payouts");
      if (r.ok) {
        setD(await r.json());
      }
    } catch (err) {
      console.error("Failed to load finance data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function process(id) {
    setMsg("Processing transfer...");
    try {
      const r = await fetch(`/api/admin/coaching-payouts/${id}/process`, {
        method: "POST",
      });
      const x = await r.json();
      setMsg(r.ok ? "Transfer submitted successfully" : x.error || "Failed to process transfer");
      load();
    } catch {
      setMsg("Failed to connect to server");
    }
  }

  if (loading && !d) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-sm font-semibold">Loading Financial Records...</p>
        </div>
      </main>
    );
  }

  const payments = d?.payments || [];
  const transfers = d?.transfers || [];
  const accounts = d?.accounts || [];
  const totals = d?.totals || { gross: 0, platform: 0, coaching: 0, paidCount: 0 };

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Admin Dashboard</span>
            </Link>
            <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
              Financial Control Center
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Real-time platform gross sales, Razorpay student transactions, platform net revenue,
              and coaching payouts.
            </p>
          </div>

          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
            <span>Refresh Financials</span>
          </button>
        </div>

        {/* Financial KPI Cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="glass-card rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Gross Platform Sales
              </span>
              <div className="grid h-9 w-9 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
              ₹
              {Number(totals.gross || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Total volume across all paid checkouts
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Platform Earnings
              </span>
              <div className="grid h-9 w-9 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-blue-600 dark:text-blue-400">
              ₹
              {Number(totals.platform || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Platform net income (direct + fees)
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Coaching Partner Share
              </span>
              <div className="grid h-9 w-9 place-items-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
              ₹
              {Number(totals.coaching || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Disbursable to partner academies
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Successful Orders
              </span>
              <div className="grid h-9 w-9 place-items-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
              {totals.paidCount || payments.length}
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Verified Razorpay transactions
            </p>
          </div>
        </div>

        {/* Section 1: Recent Real Student Payments (Razorpay Verified) */}
        <div className="glass-card mt-8 overflow-hidden rounded-3xl shadow-sm">
          <div className="border-b border-slate-200/80 p-6 dark:border-slate-800/80">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Recent Verified Student Payments
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Direct student payments completed via Razorpay checkout.
                </p>
              </div>
              <Link
                href="/admin/payments"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
              >
                <span>View Full Payments Log</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Exam / Product</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Razorpay Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 dark:divide-slate-800 dark:text-slate-200">
                {payments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      No verified student payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => {
                    const amt = Number(
                      p.amount > 0 ? p.amount : p.amountPaise ? p.amountPaise / 100 : 0,
                    );
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
                            {p.exam?.title || "Exam Checkout Access"}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {p.organization?.name || "Direct Platform Exam"}
                          </div>
                        </td>
                        <td className="p-4 font-bold text-slate-900 dark:text-white">
                          ₹{amt.toFixed(2)}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{p.status}</span>
                          </span>
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

        {/* Section 2: Marketplace Transfers */}
        <div className="glass-card mt-8 overflow-hidden rounded-3xl shadow-sm">
          <div className="border-b border-slate-200/80 p-6 dark:border-slate-800/80">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Coaching Partner Marketplace Transfers
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Automated revenue share splits for partner academies hosting paid tests.
            </p>
            {msg && (
              <div className="mt-3 rounded-xl bg-blue-50 p-3 text-xs font-bold text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
                {msg}
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="p-4">Coaching Academy</th>
                  <th className="p-4">Gross Amount</th>
                  <th className="p-4">Platform Fee</th>
                  <th className="p-4">Coaching Share</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 dark:divide-slate-800 dark:text-slate-200">
                {transfers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      No coaching marketplace transfers pending.
                    </td>
                  </tr>
                ) : (
                  transfers.map((x) => (
                    <tr
                      key={x.id}
                      className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        {x.organization?.name || "Academy"}
                      </td>
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">
                        ₹{Number(x.grossAmount || 0).toFixed(2)}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        ₹{Number(x.platformFee || 0).toFixed(2)}
                      </td>
                      <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{Number(x.coachingShare || 0).toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {x.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {x.status === "PENDING" && (
                          <button
                            onClick={() => process(x.id)}
                            className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500 active:scale-95"
                          >
                            Process Transfer
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Coaching Payout Accounts */}
        <div className="glass-card mt-8 rounded-3xl p-6 shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Connected Partner Payout Accounts
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Academy bank and payout configurations for automated Razorpay Route settlements.
            </p>
            <div className="mt-4 space-y-3">
              {accounts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  No partner payout accounts configured yet.
                </div>
              ) : (
                accounts.map((a) => (
                  <div
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 p-4 transition hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700"
                  >
                    <div>
                      <b className="text-sm text-slate-900 dark:text-slate-100">
                        {a.organization?.name}
                      </b>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Account Status:{" "}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {a.status}
                        </span>{" "}
                        · KYC:{" "}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {a.kycStatus}
                        </span>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {a.status === "ACTIVE" ? "🟢 Verified" : "⏳ Pending Setup"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
