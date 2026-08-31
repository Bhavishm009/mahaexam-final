"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus, Copy, Check, Sparkles, Search } from "lucide-react";

export default function CoachingStudentsPage() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [invites, setInvites] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    batchId: "",
  });
  const [adding, setAdding] = useState(false);
  const [alert, setAlert] = useState({ text: "", type: "" });
  const [copied, setCopied] = useState(false);

  function load() {
    Promise.all([
      fetch("/api/coaching/students").then((r) => r.json()),
      fetch("/api/coaching/invites").then((r) => r.json()),
    ])
      .then(([stData, invData]) => {
        setStudents(stData.students || []);
        setBatches(invData.batches || []);
        setInvites(invData.invites || []);
        if (invData.batches?.length > 0 && !form.batchId) {
          setForm((f) => ({ ...f, batchId: invData.batches[0].id }));
        }
      })
      .catch(() => {});
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addStudent(e) {
    e.preventDefault();
    setAdding(true);
    setAlert({ text: "", type: "" });

    try {
      const r = await fetch("/api/coaching/students/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) {
        setAlert({ text: d.error || "Failed to add student", type: "error" });
      } else {
        setAlert({
          text: `Student ${d.user?.name} added! Login credentials sent to ${d.user?.email || "student"}`,
          type: "success",
        });
        setForm({ name: "", email: "", phone: "", batchId: batches[0]?.id || "" });
        load();
      }
    } catch {
      setAlert({ text: "Network error. Please try again.", type: "error" });
    } finally {
      setAdding(false);
    }
  }

  const defaultInvite = invites[0];
  const inviteLink = defaultInvite
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/join/${defaultInvite.code}`
    : "";

  function copyInvite() {
    if (!inviteLink) {
      return;
    }
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.phone?.includes(search),
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-amber-100 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Student & Batch Management</span>
            </div>
            <h1 className="mt-3 text-2xl font-black sm:text-3xl">
              Coaching Students (विद्यार्थी व्यवस्थापन)
            </h1>
            <p className="mt-1 text-xs text-amber-100 sm:text-sm">
              Add students directly with auto-generated credentials or share batch invite links.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-md">
            <div className="text-xs font-semibold text-amber-200">Enrolled Students</div>
            <div className="text-2xl font-black text-white">{students.length} Students</div>
          </div>
        </div>
      </div>

      {/* Invite Link Quick Bar */}
      {defaultInvite && (
        <div className="flex flex-col justify-between gap-3 rounded-3xl border border-amber-200 bg-amber-50/80 p-5 dark:border-amber-900/40 dark:bg-amber-950/30 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Shareable Student Invite Link (नोंदणी लिंक):</span>
            </div>
            <div className="mt-1 font-mono text-xs text-slate-600 dark:text-slate-400">
              {inviteLink}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyInvite}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-amber-500 active:scale-95"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Link Copied!" : "Copy Invite Link"}</span>
            </button>
            <Link
              href="/coaching/invites"
              className="rounded-2xl border border-amber-300 bg-white px-3.5 py-2 text-xs font-bold text-amber-900 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-300"
            >
              Manage Links
            </Link>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Add Student Card */}
        <div className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
            <UserPlus className="h-5 w-5 text-amber-500" />
            <span>Add Student (थेट विद्यार्थी जोडा)</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Auto-generates credentials and dispatches welcome email to student.
          </p>

          {alert.text && (
            <div
              className={`mt-4 rounded-2xl p-3.5 text-xs font-bold ${
                alert.type === "error"
                  ? "border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              }`}
            >
              {alert.text}
            </div>
          )}

          <form onSubmit={addStudent} className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Full Name (विद्यार्थ्याचे नाव) *
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="उदा. राहुल शिंदे"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Email Address (ईमेल) *
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="rahul@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Mobile Number (मोबाईल क्र.)
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="9876543210"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Batch (बॅच निवडा)
              </label>
              <select
                value={form.batchId}
                onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-white dark:bg-slate-900">
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={adding}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-600 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-amber-500 active:scale-95 disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              <span>{adding ? "Adding..." : "Add Student & Send Email"}</span>
            </button>
          </form>
        </div>

        {/* Students Directory Table */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Student Directory (विद्यार्थी यादी)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {students.length} total students enrolled
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-amber-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <tr>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Target Exam</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                  >
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                      <div className="text-[11px] text-slate-400">
                        ID: {s.id.substring(0, 10)}...
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-700 dark:text-slate-300">{s.email || "—"}</div>
                      <div className="text-[11px] text-slate-400">{s.phone || "—"}</div>
                    </td>
                    <td className="p-4">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {s.studentProfile?.targetExam || "Police Bharti"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-bold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-xs text-slate-400">
                      No students found. Use the form on the left or share your invite link.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
