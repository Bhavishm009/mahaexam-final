"use client";

import { useEffect, useState } from "react";
import { UserPlus, Sparkles, Search } from "lucide-react";

export default function CoachingTeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [adding, setAdding] = useState(false);
  const [alert, setAlert] = useState({ text: "", type: "" });

  function load() {
    fetch("/api/coaching/teachers")
      .then((r) => r.json())
      .then((d) => {
        setTeachers(d.teachers || []);
      })
      .catch(() => {});
  }

  useEffect(() => {
    load();
  }, []);

  async function addTeacher(e) {
    e.preventDefault();
    setAdding(true);
    setAlert({ text: "", type: "" });

    try {
      const r = await fetch("/api/coaching/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) {
        setAlert({ text: d.error || "Failed to add teacher", type: "error" });
      } else {
        setAlert({
          text: `Teacher ${d.teacher?.name} added! Login credentials sent to ${d.teacher?.email}`,
          type: "success",
        });
        setForm({ name: "", email: "", phone: "" });
        load();
      }
    } catch {
      setAlert({ text: "Network error. Please try again.", type: "error" });
    } finally {
      setAdding(false);
    }
  }

  const filtered = teachers.filter(
    (t) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase()) ||
      t.phone?.includes(search),
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-amber-100 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Faculty & Teacher Management</span>
            </div>
            <h1 className="mt-3 text-2xl font-black sm:text-3xl">
              Coaching Teachers (शिक्षक / प्राध्यापक)
            </h1>
            <p className="mt-1 text-xs text-amber-100 sm:text-sm">
              Add faculty members to your academy. They can create questions, manage batches, and
              review test results.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-md">
            <div className="text-xs font-semibold text-amber-200">Total Teachers</div>
            <div className="text-2xl font-black text-white">{teachers.length} Faculty</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Add Teacher Card */}
        <div className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
            <UserPlus className="h-5 w-5 text-amber-500" />
            <span>Add Faculty Teacher (शिक्षक जोडा)</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Auto-generates credentials and emails login details to the teacher.
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

          <form onSubmit={addTeacher} className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Teacher Full Name (शिक्षकाचे नाव) *
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="उदा. प्रा. किरण माने"
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
                placeholder="teacher@example.com"
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

            <button
              type="submit"
              disabled={adding}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-600 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-amber-500 active:scale-95 disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              <span>{adding ? "Adding..." : "Add Teacher & Send Email"}</span>
            </button>
          </form>
        </div>

        {/* Teachers Directory Table */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Faculty Directory (शिक्षक यादी)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {teachers.length} total teachers registered
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search teachers..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-amber-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <tr>
                  <th className="p-4">Teacher Name</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Assigned Batches</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((t) => (
                  <tr
                    key={t.id}
                    className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                  >
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{t.name}</div>
                      <div className="text-[11px] text-slate-400">Faculty Role</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-700 dark:text-slate-300">{t.email}</div>
                      <div className="text-[11px] text-slate-400">{t.phone || "—"}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {t.batchesTaught?.map((b) => (
                          <span
                            key={b.id}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {b.name}
                          </span>
                        ))}
                        {(!t.batchesTaught || t.batchesTaught.length === 0) && (
                          <span className="text-slate-400">All Batches</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-bold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active Faculty
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-xs text-slate-400">
                      No faculty teachers found. Use the form on the left to add a teacher.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filtered.length > pageSize && (
            <div className="flex items-center justify-between border-t border-slate-100 p-4 text-xs dark:border-slate-800">
              <span className="text-slate-500">
                Page {currentPage} of {Math.ceil(filtered.length / pageSize)} ({filtered.length}{" "}
                total)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 font-bold disabled:opacity-40 dark:border-slate-800"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={currentPage >= Math.ceil(filtered.length / pageSize)}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 font-bold disabled:opacity-40 dark:border-slate-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
