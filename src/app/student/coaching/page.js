"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Users, Plus, ArrowRight, MapPin, Sparkles } from "lucide-react";

export default function StudentCoachingPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [msg, setMsg] = useState({ text: "", error: false });

  function load() {
    setLoading(true);
    fetch("/api/student/coaching")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleJoin(e) {
    e.preventDefault();
    if (!inviteCode.trim()) {
      return;
    }

    setJoining(true);
    setMsg({ text: "", error: false });

    try {
      const r = await fetch("/api/student/coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inviteCode.trim() }),
      });
      const res = await r.json();
      if (!r.ok) {
        setMsg({ text: res.error || "Failed to join academy", error: true });
      } else {
        setMsg({ text: res.message || "Successfully joined academy!", error: false });
        setInviteCode("");
        load();
      }
    } catch {
      setMsg({ text: "Network error. Please try again.", error: true });
    } finally {
      setJoining(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="animate-shimmer h-32 w-full rounded-3xl" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="animate-shimmer h-64 rounded-3xl" />
          <div className="animate-shimmer h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  const orgs = data?.organizations || [];

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-blue-100 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Multi-Coaching Management</span>
            </div>
            <h1 className="mt-3 text-2xl font-black sm:text-3xl">
              My Coaching Institutes (माझ्या अकॅडेमी)
            </h1>
            <p className="mt-1 text-xs text-blue-100 sm:text-sm">
              View all coaching institutes you are currently enrolled in, their batches, and private
              mock exams.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-md">
            <div className="text-xs font-semibold text-blue-200">Total Enrolled</div>
            <div className="text-2xl font-black text-white">{orgs.length} Academies</div>
          </div>
        </div>
      </div>

      {/* Join Another Institute Box */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-black text-slate-900 dark:text-white sm:text-base">
          Join Another Coaching Academy (दुसऱ्या अकॅडेमीत सामील व्हा)
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Enter the invite code or institute code given by your teacher or academy:
        </p>

        {msg.text && (
          <div
            className={`mt-3 rounded-2xl p-3 text-xs font-bold ${
              msg.error
                ? "border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {msg.text}
          </div>
        )}

        <form onSubmit={handleJoin} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="उदा. PUNE2025 किंवा अकॅडेमी कोड"
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
          <button
            type="submit"
            disabled={joining || !inviteCode.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500 active:scale-95 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span>{joining ? "Joining..." : "Join Academy (सामील व्हा)"}</span>
          </button>
        </form>
      </div>

      {/* Enrolled Academies List */}
      <div className="space-y-6">
        <h2 className="text-lg font-black text-slate-900 dark:text-white">
          Enrolled Coaching Academies ({orgs.length})
        </h2>

        {orgs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <Building2 className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
              No Coaching Institutes Connected
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              You are currently practicing with MahaExam platform mock tests. If you join a coaching
              academy, enter their invite code above to get their private test series.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {orgs.map((org) => (
              <div
                key={org.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        {org.district && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-rose-500" />
                            {org.district}
                          </span>
                        )}
                        <span>•</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          Active Enrollment
                        </span>
                      </div>
                      <h3 className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                        {org.name}
                      </h3>
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
                      <Building2 className="h-6 w-6" />
                    </div>
                  </div>

                  {/* Batches enrolled */}
                  <div className="mt-4">
                    <div className="text-[11px] font-bold text-slate-400">My Enrolled Batches:</div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {org.batches.map((b) => (
                        <span
                          key={b.id}
                          className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-300"
                        >
                          {b.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Assigned Mock Exams */}
                  <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>Academy Mock Exams ({org.exams.length})</span>
                    </div>

                    <div className="mt-2.5 space-y-2">
                      {org.exams.slice(0, 3).map((e) => (
                        <div
                          key={e.id}
                          className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60"
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              {e.title}
                            </div>
                            <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                              {e.totalQuestions} Qs · {e.durationMinutes} mins
                            </div>
                          </div>
                          <Link
                            href={`/exam/${e.slug || e.id}/attempt`}
                            className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-500"
                          >
                            <span>Start</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      ))}
                      {org.exams.length === 0 && (
                        <div className="py-2 text-xs text-slate-400">
                          No private mock tests scheduled right now.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    <span>{org.teachers?.length || 1} Faculty Teacher(s)</span>
                  </div>
                  <Link
                    href={`/student/exams`}
                    className="font-bold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    All Exams →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
