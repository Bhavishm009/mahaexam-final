"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  UserPlus,
  Copy,
  Check,
  Sparkles,
  Search,
  Share2,
  AlertCircle,
  CheckCircle2,
  Info,
  UserX,
  UserCheck,
  Trash2,
  X,
  Phone,
  Mail,
  BookOpen,
} from "lucide-react";

export default function CoachingStudentsPage() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [invites, setInvites] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    batchId: "",
  });
  const [adding, setAdding] = useState(false);
  const [alert, setAlert] = useState({ text: "", type: "" });
  const [copied, setCopied] = useState(false);

  // Student management state
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

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
      } else if (d.alreadyRegistered) {
        setAlert({
          text: d.messageMr || d.message || `हा विद्यार्थी आधीच MahaExam वर नोंदणीकृत आहे! त्याला यशस्वीरित्या ${d.batch?.name || "बॅच"} मध्ये जोडले गेले आहे.`,
          type: "info",
        });
        setForm({ name: "", email: "", phone: "", batchId: batches[0]?.id || "" });
        load();
      } else {
        setAlert({
          text: d.messageMr || d.message || `नवीन विद्यार्थी ${d.user?.name} यशस्वीरित्या जोडला गेला! लॉगिन माहिती विद्यार्थ्याला ईमेलवर पाठवली आहे.`,
          type: "success",
        });
        setForm({ name: "", email: "", phone: "", batchId: batches[0]?.id || "" });
        load();
      }
    } catch {
      setAlert({ text: "नेटवर्क त्रुटी आली. कृपया पुन्हा प्रयत्न करा.", type: "error" });
    } finally {
      setAdding(false);
    }
  }

  async function toggleStatus(student) {
    const newStatus = student.academyStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setActionLoadingId(student.id);
    try {
      const res = await fetch(`/api/coaching/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ academyStatus: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setAlert({
          text: newStatus === "INACTIVE"
            ? `${student.name} या विद्यार्थ्याला अकॅडेमीसाठी निष्क्रिय (Deactivated) केले आहे. त्याचा MahaExam प्लॅटफॉर्म ॲक्सेस चालू राहील पण खाजगी परीक्षा बंद होतील.`
            : `${student.name} या विद्यार्थ्याला अकॅडेमीसाठी पुन्हा सक्रिय (Activated) केले आहे.`,
          type: "info",
        });
        load();
      } else {
        setAlert({ text: data.error || "Failed to update status", type: "error" });
      }
    } catch {
      setAlert({ text: "नेटवर्क त्रुटी आली.", type: "error" });
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleConfirmRemove() {
    if (!studentToRemove) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/coaching/students/${studentToRemove.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setAlert({
          text: `${studentToRemove.name} या विद्यार्थ्याला तुमच्या अकॅडेमीतून काढून टाकण्यात आले आहे. (टीप: त्याचे MahaExam खाते चालू राहील).`,
          type: "success",
        });
        setStudentToRemove(null);
        load();
      } else {
        setAlert({ text: data.error || "Failed to remove student", type: "error" });
      }
    } catch {
      setAlert({ text: "नेटवर्क त्रुटी आली.", type: "error" });
    } finally {
      setRemoving(false);
    }
  }

  const defaultInvite = invites[0];
  const inviteLink = defaultInvite
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/join/${defaultInvite.code}`
    : "";

  function copyInvite() {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    if (!inviteLink) return;
    const msg = `नमस्कार, आमच्या कोचिंग अकॅडेमीच्या ऑनलाइन बॅच व सराव परीक्षांसाठी खालील लिंकवर जाऊन आपली नोंदणी पूर्ण करा:\n${inviteLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  }

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.phone?.includes(search) ||
      s.batchName?.toLowerCase().includes(search.toLowerCase()),
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
              Add students directly, share invite links, and manage student enrollments securely.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-md text-center">
            <div className="text-xs font-semibold text-amber-200">Enrolled Students</div>
            <div className="text-2xl font-black text-white">{students.length} Students</div>
          </div>
        </div>
      </div>

      {/* Global Alert Notification */}
      {alert.text && (
        <div
          className={`flex items-start gap-3 rounded-2xl p-4 text-xs font-bold transition ${
            alert.type === "error"
              ? "border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400"
              : alert.type === "info"
              ? "border border-blue-500/30 bg-blue-500/10 text-blue-800 dark:text-blue-300"
              : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {alert.type === "error" ? (
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          ) : alert.type === "info" ? (
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          )}
          <div className="flex-1">{alert.text}</div>
          <button
            onClick={() => setAlert({ text: "", type: "" })}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Section: Invite Link Box & Fast Add Student Form */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Fast Add Student Box */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white sm:text-base">
                Add Student (विद्यार्थी जोडा)
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Directly add by name and email
              </p>
            </div>
          </div>

          <form onSubmit={addStudent} className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Student Name (विद्यार्थ्याचे नाव) *
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
                Email Address (ईमेल आयडी) *
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
                placeholder="98XXXXXXXX"
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

        {/* Right Section: Invite Link Box & Student Directory Table */}
        <div className="space-y-6 lg:col-span-2">
          {/* Invite Link Card */}
          <div className="rounded-3xl border border-amber-200/80 bg-amber-50/50 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Batch Self-Registration Link (विद्यार्थी नोंदणी लिंक)
                </h3>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                  Share this link with students. They will fill their own name, email, password, and details.
                </p>
              </div>

              {defaultInvite && (
                <span className="rounded-xl border border-amber-300 bg-amber-100/80 px-2.5 py-1 text-xs font-black uppercase text-amber-800 dark:border-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                  Code: {defaultInvite.code}
                </span>
              )}
            </div>

            <div className="mt-3.5 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                readOnly
                value={inviteLink || "No active invite link"}
                className="flex-1 truncate rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-mono text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyInvite}
                  disabled={!inviteLink}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-500 active:scale-95 disabled:opacity-50"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Link"}</span>
                </button>
                <button
                  type="button"
                  onClick={shareWhatsApp}
                  disabled={!inviteLink}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
                  title="Share on WhatsApp"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

          {/* Students Directory Table */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Enrolled Students Directory (विद्यार्थी यादी)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {students.length} total students enrolled
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search students or batch..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-amber-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Batch</th>
                    <th className="p-4">Target Exam</th>
                    <th className="p-4">Academy Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((s) => (
                    <tr
                      key={s.id}
                      className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                    >
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                          {s.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-slate-400" />
                              {s.email}
                            </span>
                          )}
                          {s.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-slate-400" />
                              {s.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/60 dark:text-blue-300">
                          {s.batchName || "General Batch"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {s.targetExam || "Police Bharti"}
                        </span>
                      </td>
                      <td className="p-4">
                        {s.academyStatus === "INACTIVE" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Inactive
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Active / Inactive Button */}
                          <button
                            type="button"
                            disabled={actionLoadingId === s.id}
                            onClick={() => toggleStatus(s)}
                            className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-bold transition disabled:opacity-50 ${
                              s.academyStatus === "INACTIVE"
                                ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/60 dark:text-amber-300"
                            }`}
                            title={s.academyStatus === "INACTIVE" ? "Activate student" : "Deactivate student"}
                          >
                            {s.academyStatus === "INACTIVE" ? (
                              <>
                                <UserCheck className="h-3 w-3" />
                                <span>Activate</span>
                              </>
                            ) : (
                              <>
                                <UserX className="h-3 w-3" />
                                <span>Deactivate</span>
                              </>
                            )}
                          </button>

                          {/* Remove Student from Academy Button */}
                          <button
                            type="button"
                            onClick={() => setStudentToRemove(s)}
                            className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/60 dark:text-rose-300"
                            title="Remove from Academy"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-xs text-slate-400">
                        No students found. Use the form on the left or share your invite link.
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

      {/* Confirmation Modal: Remove Student from Academy */}
      {studentToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <Trash2 className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">
              अकॅडेमीतून विद्यार्थी काढायचा आहे का?
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Remove <strong>{studentToRemove.name}</strong> from your academy?
            </p>

            <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50/80 p-3.5 text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300">
              <div className="font-bold">महत्त्वाची नोंद (Platform Policy):</div>
              <p className="mt-1 text-[11px] leading-relaxed">
                हा विद्यार्थी फक्त <strong>तुमच्या अकॅडेमीमधून</strong> काढला जाईल आणि त्याचे अकॅडेमीचे खाजगी पेपर्स बंद होतील. त्याचे <strong>MahaExam वरील खाते चालूच राहील</strong> व तो सर्व मोफत व ग्लोबल सराव परीक्षा देऊ शकेल.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                disabled={removing}
                onClick={() => setStudentToRemove(null)}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel (रद्द करा)
              </button>
              <button
                type="button"
                disabled={removing}
                onClick={handleConfirmRemove}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-rose-500 active:scale-95 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                <span>{removing ? "काढत आहे..." : "होय, अकॅडेमीतून काढा"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
