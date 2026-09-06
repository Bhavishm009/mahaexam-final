"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  Clock,
  UserX,
  Send,
  RotateCcw,
  ArrowLeft,
  Search,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function ExamResults({ params }) {
  const [examId, setExamId] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("roster"); // "roster" | "rankings"
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadData = async (id) => {
    try {
      const res = await fetch(`/api/coaching/results/exam/${id}`);
      const d = await res.json();
      if (res.ok) {
        setData(d);
      } else {
        toast.error(d.error || "निकाल लोड करण्यात अडचण आली.");
      }
    } catch {
      toast.error("सर्व्हरशी संपर्क होऊ शकला नाही.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve(params).then((p) => {
      setExamId(p.id);
      loadData(p.id);
    });
  }, [params]);

  const handlePublishNow = async () => {
    if (
      !confirm(
        "तुम्हाला या परीक्षेचा निकाल आणि उत्तरतालिका सर्व विद्यार्थ्यांसाठी त्वरित प्रसिद्ध करायची आहे का?",
      )
    ) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/coaching/results/exam/${examId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "PUBLISH_RESULTS" }),
      });
      const d = await res.json();
      if (res.ok) {
        toast.success(
          "🎉 निकाल आणि उत्तरतालिका यशस्वीरीत्या प्रसिद्ध केली! सर्व विद्यार्थ्यांना उत्तरे खुली झाली आहेत.",
        );
        await loadData(examId);
      } else {
        toast.error(d.error || "प्रसिद्ध करता आले नाही.");
      }
    } catch {
      toast.error("प्रक्रिया अयशस्वी झाली.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetAttempt = async (studentId, studentName) => {
    if (
      !confirm(
        `तुम्ही ${studentName} यांचा परीक्षा प्रयत्न रीसेट करू इच्छिता का? यामुळे विद्यार्थी पुन्हा परीक्षा देऊ शकेल.`,
      )
    ) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/coaching/results/exam/${examId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET_ATTEMPT", studentId }),
      });
      const d = await res.json();
      if (res.ok) {
        toast.success(
          `✓ ${studentName} यांचा प्रयत्न रीसेट केला. ते आता पुन्हा परीक्षा देऊ शकतात.`,
        );
        await loadData(examId);
      } else {
        toast.error(d.error || "रीसेट करता आले नाही.");
      }
    } catch {
      toast.error("रीसेट प्रक्रिया अयशस्वी झाली.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-sm font-semibold">निकाल व हजेरी माहिती लोड होत आहे...</span>
        </div>
      </main>
    );
  }

  const { exam, stats, students = [], results = [] } = data;

  const filteredStudents = students.filter((st) => {
    const matchesSearch =
      st.name?.toLowerCase().includes(filterText.toLowerCase()) ||
      st.email?.toLowerCase().includes(filterText.toLowerCase()) ||
      st.phone?.includes(filterText);
    const matchesStatus = statusFilter === "ALL" || st.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <main className="min-h-screen bg-slate-50 p-4 font-sans text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm dark:border dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:p-8">
          <div>
            <Link
              href="/coaching/exams"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
            >
              <ArrowLeft className="h-4 w-4" />
              सर्व परीक्षांकडे परत जा
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
                {exam.title}
              </h1>
              <span
                className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                  exam.isPublished
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                }`}
              >
                {exam.isPublished ? "✓ निकाल प्रसिद्ध झाले" : "⏳ परीक्षा सुरू / निकाल प्रलंबित"}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              विद्यार्थी हजेरी, थेट प्रगती, मेरिट लिस्ट आणि निकाल व्यवस्थापन
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!exam.isPublished && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={handlePublishNow}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-black text-white shadow-md transition hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>निकाल व उत्तरे त्वरित प्रसिद्ध करा (Publish Now)</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => loadData(examId)}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <RotateCcw className="h-4 w-4" />
              रिफ्रेश
            </button>
          </div>
        </div>

        {/* 4 Attendance & Progress Metric Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">
                एकूण नियुक्त विद्यार्थी
              </span>
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
              {stats.totalAssigned || 0}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">Total Enrolled / Assigned</div>
          </div>

          <div className="rounded-3xl border border-emerald-200/80 bg-emerald-50/50 p-5 shadow-sm dark:border-emerald-950/60 dark:bg-emerald-950/20">
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
              <span className="text-xs font-bold uppercase tracking-wider">
                परीक्षा पूर्ण (Submitted)
              </span>
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="mt-3 text-3xl font-black text-emerald-700 dark:text-emerald-300">
              {stats.submittedCount || 0}
            </div>
            <div className="mt-1 text-[11px] text-emerald-600/80 dark:text-emerald-400/80">
              {stats.totalAssigned
                ? `${Math.round(((stats.submittedCount || 0) / stats.totalAssigned) * 100)}% पूर्णता दर`
                : "0% पूर्णता दर"}
            </div>
          </div>

          <div className="rounded-3xl border border-amber-200/80 bg-amber-50/50 p-5 shadow-sm dark:border-amber-950/60 dark:bg-amber-950/20">
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
              <span className="text-xs font-bold uppercase tracking-wider">
                सध्या सुरू (In-Progress)
              </span>
              <Clock className="h-4 w-4" />
            </div>
            <div className="mt-3 text-3xl font-black text-amber-700 dark:text-amber-300">
              {stats.inProgressCount || 0}
            </div>
            <div className="mt-1 text-[11px] text-amber-600/80 dark:text-amber-400/80">
              कदाचित ड्रॉप किंवा चालू सत्र
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">अनुपस्थित (Absent)</span>
              <UserX className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-3 text-3xl font-black text-slate-600 dark:text-slate-300">
              {stats.absentCount || 0}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">चाचणी सुरू केली नाही</div>
          </div>
        </div>

        {/* Tabs & Filters */}
        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTab("roster")}
                className={`rounded-2xl px-4 py-2 text-xs font-bold transition active:scale-95 sm:text-sm ${
                  tab === "roster"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                विद्यार्थी हजेरी व स्थिती ({students.length})
              </button>
              <button
                type="button"
                onClick={() => setTab("rankings")}
                className={`rounded-2xl px-4 py-2 text-xs font-bold transition active:scale-95 sm:text-sm ${
                  tab === "rankings"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                गुणतालिका व रँक ({results.length})
              </button>
            </div>

            {tab === "roster" && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder="नाव किंवा ईमेल शोधा..."
                    className="rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                  <option value="ALL">सर्व स्थिती</option>
                  <option value="SUBMITTED">पूर्ण केलेले (Submitted)</option>
                  <option value="IN_PROGRESS">सुरू असलेले (In-Progress)</option>
                  <option value="NOT_STARTED">अनुपस्थित (Absent)</option>
                </select>
              </div>
            )}
          </div>

          {/* Roster View */}
          {tab === "roster" && (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                    <tr>
                      <th className="p-4 font-bold">विद्यार्थी नाव</th>
                      <th className="p-4 font-bold">संपर्क</th>
                      <th className="p-4 font-bold">परीक्षा स्थिती</th>
                      <th className="p-4 font-bold">सोडवलेले प्रश्न</th>
                      <th className="p-4 font-bold">गुण व टक्केवारी</th>
                      <th className="p-4 text-right font-bold">कृती (Action)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredStudents.map((st) => (
                      <tr
                        key={st.id}
                        className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                      >
                        <td className="p-4 font-bold text-slate-900 dark:text-white">
                          <div>{st.name}</div>
                          <div className="text-[11px] font-normal text-slate-400">ID: {st.id}</div>
                        </td>
                        <td className="p-4 text-xs text-slate-600 dark:text-slate-300">
                          <div>{st.email}</div>
                          {st.phone && <div className="text-slate-400">{st.phone}</div>}
                        </td>
                        <td className="p-4">
                          {st.status === "SUBMITTED" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                              <CheckCircle2 className="h-3 w-3" />
                              पूर्ण (Submitted)
                            </span>
                          ) : st.status === "IN_PROGRESS" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                              <Clock className="h-3 w-3 animate-pulse" />
                              सुरू / अडकले (In Progress)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              <UserX className="h-3 w-3" />
                              अनुपस्थित (Not Started)
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {st.answeredCount > 0 ? `${st.answeredCount} प्रश्न` : "—"}
                        </td>
                        <td className="p-4">
                          {st.score !== null ? (
                            <div>
                              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                {st.score} गुण
                              </span>
                              <span className="ml-1.5 text-xs text-slate-400">
                                ({st.percentage}%)
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {(st.status === "IN_PROGRESS" || st.status === "SUBMITTED") && (
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleResetAttempt(st.id, st.name)}
                              className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 transition hover:bg-amber-100 active:scale-95 disabled:opacity-50 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              title="विद्यार्थ्याला पुन्हा परीक्षा देण्याची मुभा द्या (Reset Attempt)"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>रीसेट / Retake</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!filteredStudents.length && (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-8 text-center text-xs text-slate-500 dark:text-slate-400"
                        >
                          कोणताही विद्यार्थी आढळला नाही.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rankings / Merit View */}
          {tab === "rankings" && (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                    <tr>
                      <th className="p-4 font-bold">रँक (Rank)</th>
                      <th className="p-4 font-bold">विद्यार्थी</th>
                      <th className="p-4 font-bold">प्राप्त गुण</th>
                      <th className="p-4 font-bold">टक्केवारी (%)</th>
                      <th className="p-4 font-bold">बरोबर (Correct)</th>
                      <th className="p-4 font-bold">चूक (Wrong)</th>
                      <th className="p-4 font-bold">अनुत्तरित (Unanswered)</th>
                      <th className="p-4 font-bold">निकाल (Result)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {results.map((r) => (
                      <tr
                        key={r.id}
                        className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                      >
                        <td className="p-4 font-black text-slate-900 dark:text-white">#{r.rank}</td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {r.student?.name || "Student"}
                          </div>
                          <div className="text-xs text-slate-400">{r.student?.email}</div>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                          {r.obtainedMarks} / {r.totalMarks}
                        </td>
                        <td className="p-4 font-bold text-blue-600 dark:text-blue-400">
                          {r.percentage}%
                        </td>
                        <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                          {r.correct}
                        </td>
                        <td className="p-4 font-bold text-rose-600 dark:text-rose-400">
                          {r.wrong}
                        </td>
                        <td className="p-4 text-slate-400">{r.unanswered}</td>
                        <td className="p-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              r.passed
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
                            }`}
                          >
                            {r.passed ? "PASS" : "FAIL"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!results.length && (
                      <tr>
                        <td
                          colSpan={8}
                          className="p-8 text-center text-xs text-slate-500 dark:text-slate-400"
                        >
                          अद्याप कोणत्याही विद्यार्थ्याने परीक्षा पूर्ण केलेली नाही.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
