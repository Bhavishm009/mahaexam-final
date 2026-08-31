"use client";

import { useEffect, useState } from "react";
import { Plus, Copy, Check, Sparkles } from "lucide-react";

export default function CoachingInvitesPage() {
  const [invites, setInvites] = useState([]);
  const [batches, setBatches] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    batchId: "",
  });
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState("");

  function load() {
    fetch("/api/coaching/invites")
      .then((r) => r.json())
      .then((d) => {
        setInvites(d.invites || []);
        setBatches(d.batches || []);
        if (d.batches?.length > 0 && !form.batchId) {
          setForm((f) => ({ ...f, batchId: d.batches[0].id }));
        }
      })
      .catch(() => {});
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createInvite(e) {
    e.preventDefault();
    setCreating(true);
    setMsg("");

    try {
      const r = await fetch("/api/coaching/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) {
        setMsg(d.error || "Failed to create invite link");
      } else {
        setMsg("Invite link generated successfully!");
        setForm({ name: "", batchId: batches[0]?.id || "" });
        load();
      }
    } catch {
      setMsg("Network error. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  function copyLink(code, id) {
    const link = `${window.location.origin}/join/${code}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-amber-100 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Shareable Student Onboarding</span>
            </div>
            <h1 className="mt-3 text-2xl font-black sm:text-3xl">
              Invite Links & Codes (नोंदणी लिंक्स)
            </h1>
            <p className="mt-1 text-xs text-amber-100 sm:text-sm">
              Share WhatsApp/Telegram invite links. Students registering or logging in from your
              link will automatically attach to your academy.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-md">
            <div className="text-xs font-semibold text-amber-200">Active Links</div>
            <div className="text-2xl font-black text-white">{invites.length} Codes</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Create Link Card */}
        <div className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
            <Plus className="h-5 w-5 text-amber-500" />
            <span>Generate New Invite Link</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Create an invite link targeted for a specific batch or general admission.
          </p>

          {msg && (
            <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-bold text-amber-700 dark:text-amber-400">
              {msg}
            </div>
          )}

          <form onSubmit={createInvite} className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Link Description / Campaign Name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="उदा. Police Bharti 2025 WhatsApp Batch"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Target Batch (जोडायची बॅच)
              </label>
              <select
                value={form.batchId}
                onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="">General Batch (सर्व बॅचेससाठी)</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-white dark:bg-slate-900">
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-600 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-amber-500 active:scale-95 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>{creating ? "Generating..." : "Generate Invite Link"}</span>
            </button>
          </form>
        </div>

        {/* Existing Links List */}
        <div className="space-y-4">
          <h2 className="text-base font-black text-slate-900 dark:text-white">
            Active Invite Links & Usage Stats ({invites.length})
          </h2>

          <div className="space-y-3">
            {invites.map((inv) => {
              const url =
                typeof window !== "undefined"
                  ? `${window.location.origin}/join/${inv.code}`
                  : `/join/${inv.code}`;
              const isCopied = copiedId === inv.id;

              return (
                <div
                  key={inv.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400">
                          {inv.code}
                        </span>
                        {inv.batch && (
                          <span className="rounded-lg bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                            Batch: {inv.batch.name}
                          </span>
                        )}
                      </div>
                      <h4 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                        {inv.name || "Student Invite Link"}
                      </h4>
                      <p className="mt-0.5 font-mono text-xs text-slate-400">{url}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="mr-2 text-right">
                        <div className="text-sm font-black text-slate-900 dark:text-white">
                          {inv.usedCount}
                        </div>
                        <div className="text-[10px] text-slate-400">Students Joined</div>
                      </div>

                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                          `🎯 महाराष्ट्र स्पर्धा परीक्षा सराव चाचणीसाठी आमच्या अकॅडेमीत सामील व्हा!\n\nसराव चाचण्या, रँक आणि विश्लेषणासाठी खालील लिंकवर क्लिक करा:\n${url}\n\nकिंवा संस्थेचा कोड वापरा: ${inv.code}`,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 active:scale-95"
                      >
                        <span>WhatsApp वर शेअर करा</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => copyLink(inv.code, inv.id)}
                        className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 active:scale-95 dark:bg-blue-600 dark:hover:bg-blue-500"
                      >
                        {isCopied ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        <span>{isCopied ? "Copied!" : "Copy Link"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {invites.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900">
                No invite links created yet. Use the form on the left to create your first link.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
