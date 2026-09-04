"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Plus,
  Send,
  Building2,
  Calendar,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  FileText,
  DollarSign,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function AdminJobsManagementPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notifyStudents, setNotifyStudents] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    titleMr: "",
    department: "",
    departmentMr: "",
    vacancies: "",
    qualification: "",
    qualificationMr: "",
    lastDate: "",
    status: "ACTIVE",
    officialUrl: "",
    notificationPdf: "",
    description: "",
    descriptionMr: "",
    examSlug: "police-bharti-mock-01",
    salaryRange: "₹२१,७०० - ₹६९,१०० (S-6 Level)",
    ageLimit: "१८ ते २८ वर्षे (मागासवर्गीय उमेदवारांसाठी ५ वर्षे सूट)",
    selectionProcess: "१) CBT लेखी परीक्षा  २) शारीरिक चाचणी / कागदपत्र पडताळणी",
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/jobs");
      const data = await res.json();
      if (res.ok && data.success) {
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateJob(e) {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          notifyStudents,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(
          notifyStudents
            ? "🚀 भरती जाहिरात प्रसिद्ध झाली व सर्व विद्यार्थ्यांना सूचना (Web Push & In-app) पाठवण्यात आल्या!"
            : "✅ भरती जाहिरात यशस्वीरीत्या सेव्ह झाली!"
        );
        setShowCreateModal(false);
        fetchJobs();
      } else {
        setErrorMsg(data.error || "जाहिरात जोडताना त्रुटी झाली.");
      }
    } catch (err) {
      setErrorMsg("नेटवर्क त्रुटी: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            <Bell className="h-4 w-4" />
            Recruitment Job Alerts & Broadcasts
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            सरकारी भरती जाहिराती व नोटिफिकेशन्स
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            नवीन भरती जाहिराती पोस्ट करा व एकाच वेळी सर्व विद्यार्थ्यांना इन-ॲप व Web Push नोटिफिकेशन्स ब्रॉडकास्ट करा.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-xs font-black text-white shadow-lg transition hover:bg-blue-500 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>नवीन जाहिरात पोस्ट करा</span>
        </button>
      </div>

      {/* Status Alerts */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Jobs List Data Grid */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          <h2 className="text-base font-black text-slate-900 dark:text-white">
            प्रसिद्ध झालेल्या भरती जाहिराती ({jobs.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-semibold text-slate-400">
            लोड होत आहे...
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            कोणतीही जाहिरात आढळली नाही.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {job.status}
                    </span>
                    <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400">
                      {job.vacancies}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {job.titleMr || job.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {job.departmentMr || job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {job.qualificationMr || job.qualification}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {job.lastDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/jobs/${job.slug || job.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                  >
                    पेज पहा ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Creating New Job */}
      {showCreateModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  नवीन सरकारी भरती जाहिरात जोडा
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    जाहिरात शीर्षक (मराठी) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा: महाराष्ट्र पोलीस शिपाई भरती २०२६"
                    value={formData.titleMr}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        titleMr: e.target.value,
                        title: formData.title || e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Title in English
                  </label>
                  <input
                    type="text"
                    placeholder="Maharashtra Police Constable Recruitment 2026"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    विभाग (Department) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="महाराष्ट्र पोलीस विभाग"
                    value={formData.departmentMr}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        departmentMr: e.target.value,
                        department: formData.department || e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    एकूण पदे (Vacancies) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="१७,४७१+ पदे"
                    value={formData.vacancies}
                    onChange={(e) => setFormData({ ...formData, vacancies: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    शैक्षणिक पात्रता (Qualification) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="१२ वी उत्तीर्ण (HSC) व शारीरिक पात्रता"
                    value={formData.qualificationMr}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        qualificationMr: e.target.value,
                        qualification: formData.qualification || e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    अंतिम तारीख / स्टेटस *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="३१ मार्च २०२६ / लवकरच"
                    value={formData.lastDate}
                    onChange={(e) => setFormData({ ...formData, lastDate: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  जाहिरात संक्षिप्त माहिती (Description) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="महाराष्ट्र पोलीस शिपाई व चालक भरतीबाबत संपूर्ण माहिती, वयोमर्यादा व शारीरिक निकष..."
                  value={formData.descriptionMr}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      descriptionMr: e.target.value,
                      description: formData.description || e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    अधिकृत वेबसाईट लिंक (Official URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://policeshipai2024.mahait.org"
                    value={formData.officialUrl}
                    onChange={(e) => setFormData({ ...formData, officialUrl: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    अधिकृत PDF लिंक (Notification PDF)
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/notice.pdf"
                    value={formData.notificationPdf}
                    onChange={(e) => setFormData({ ...formData, notificationPdf: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    वेतनश्रेणी (Salary Range)
                  </label>
                  <input
                    type="text"
                    placeholder="₹२१,७०० - ₹६९,१०० (S-6 Level)"
                    value={formData.salaryRange}
                    onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    संबंधित सराव परीक्षा (Mock Exam Slug)
                  </label>
                  <input
                    type="text"
                    placeholder="police-bharti-mock-01"
                    value={formData.examSlug}
                    onChange={(e) => setFormData({ ...formData, examSlug: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              {/* Broadcast Checkbox */}
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-blue-50 p-4 dark:bg-blue-950/50">
                <input
                  type="checkbox"
                  id="notifyCheck"
                  checked={notifyStudents}
                  onChange={(e) => setNotifyStudents(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="notifyCheck" className="text-xs font-bold text-blue-950 dark:text-blue-200 cursor-pointer">
                  🔔 सर्व विद्यार्थ्यांना इन-ॲप व Web Push नोटिफिकेशन्स ब्रॉडकास्ट करा
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  रद्द करा
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white shadow-md transition hover:bg-blue-500 active:scale-95 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{submitting ? "पोस्ट होत आहे..." : "प्रसिद्ध करा & पाठवा"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
