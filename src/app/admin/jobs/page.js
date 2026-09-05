"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bell,
  Plus,
  Send,
  Building2,
  Calendar,
  GraduationCap,
  Briefcase,
  Link as LinkIcon,
  FileText,
  DollarSign,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function AdminJobsManagementPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notifyStudents, setNotifyStudents] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    examSlug: "",
    imageUrl: "",
    salaryRange: "₹21,700 - ₹69,100 (S-6 Level)",
    ageLimit: "18 to 28 Years (5 Years relaxation for reserved categories)",
    selectionProcess: "1) CBT Written Test  2) Physical Test / Document Verification",
  });

  // 1. Fetch Jobs with TanStack Query
  const { data: jobsData, isLoading: loading } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/jobs");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch jobs");
      return data.jobs || data.jobAlerts || [];
    },
  });

  const jobs = jobsData || [];

  function generateSlug(text) {
    if (!text) return "";
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleTitleChange(val, isMarathi = false) {
    const updated = isMarathi
      ? { ...formData, titleMr: val, title: formData.title || val }
      : { ...formData, title: val };

    const baseTitle = isMarathi ? formData.title || val : val;
    if (!formData.examSlug || formData.examSlug === generateSlug(formData.title || formData.titleMr) + "-mock-test") {
      updated.examSlug = generateSlug(baseTitle) ? `${generateSlug(baseTitle)}-mock-test` : "";
    }

    setFormData(updated);
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (res.ok && result.url) {
        setFormData((prev) => ({ ...prev, imageUrl: result.url }));
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(result.error || "Failed to upload image.");
      }
    } catch (err) {
      toast.error("Upload error: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  }

  // 2. Create Job Mutation with Optimistic Update
  const createJobMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to publish job notification.");
      }
      return data;
    },
    onMutate: async (newJobPayload) => {
      await queryClient.cancelQueries({ queryKey: ["admin-jobs"] });
      const previousJobs = queryClient.getQueryData(["admin-jobs"]) || [];

      // Optimistically insert draft job alert into UI
      const optimisticJob = {
        id: "temp-" + Date.now(),
        ...newJobPayload,
        publishedAt: new Date().toISOString(),
      };

      queryClient.setQueryData(["admin-jobs"], [optimisticJob, ...previousJobs]);
      return { previousJobs };
    },
    onError: (err, newJobPayload, context) => {
      if (context?.previousJobs) {
        queryClient.setQueryData(["admin-jobs"], context.previousJobs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    },
  });

  function handleCreateJob(e) {
    e.preventDefault();

    if (!formData.title.trim() && !formData.titleMr.trim()) {
      toast.error("Please enter a Job Title.");
      return;
    }
    if (!formData.department.trim()) {
      toast.error("Please enter the Department name.");
      return;
    }

    const payload = {
      ...formData,
      examSlug: formData.examSlug || generateSlug(formData.title || formData.titleMr) + "-mock-test",
      notifyStudents,
    };

    setShowCreateModal(false);

    toast.promise(createJobMutation.mutateAsync(payload), {
      loading: "Publishing job recruitment alert & broadcasting to students...",
      success: () =>
        notifyStudents
          ? "Recruitment notification published & broadcast sent to all students!"
          : "Recruitment job notification saved successfully!",
      error: (err) => `Failed to save job alert: ${err.message}`,
    });
  }

  const submitting = createJobMutation.isPending;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            <Bell className="h-4 w-4" />
            Recruitment Job Alerts & Broadcasts
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Government Job Recruitment Alerts
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Post new recruitment alerts and broadcast in-app & web push notifications to candidates simultaneously.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-xs font-black text-white shadow-lg transition hover:bg-blue-500 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>+ Post New Job Alert</span>
        </button>
      </div>

      {/* Jobs List Data Grid */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          <h2 className="text-base font-black text-slate-900 dark:text-white">
            Published Job Notifications ({jobs.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-semibold text-slate-400">
            Loading job alerts...
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No job notifications found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
              >
                <div className="flex items-start gap-4">
                  {job.imageUrl && (
                    <img
                      src={job.imageUrl}
                      alt={job.title}
                      className="h-14 w-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                    />
                  )}
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
                      {job.title || job.titleMr}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {job.department || job.departmentMr}
                      </span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" />
                        {job.qualification || job.qualificationMr}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {job.lastDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/jobs/${job.slug || job.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                  >
                    View Page ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Creating New Job */}
      {showCreateModal && mounted && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false);
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md overflow-hidden"
        >
          <div className="max-h-[90vh] w-full max-w-2xl flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
            {/* Fixed Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800 shrink-0 bg-slate-50/80 dark:bg-slate-900/80">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Add New Job Recruitment Alert
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="job-form" onSubmit={handleCreateJob} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Job Image Upload Section */}
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Job / Banner Image (Supabase Storage / Upload)
                </label>
                <div className="flex items-center gap-4">
                  {formData.imageUrl ? (
                    <div className="relative h-16 w-20 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                      <img src={formData.imageUrl} alt="Uploaded Banner" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: "" })}
                        className="absolute right-1 top-1 rounded-full bg-rose-600 p-0.5 text-white"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="grid h-16 w-20 place-items-center rounded-xl bg-slate-200/60 text-xs font-bold text-slate-400 dark:bg-slate-800">
                      No Image
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-blue-500"
                    />
                    <input
                      type="url"
                      placeholder="Or paste Image URL (e.g. https://...)"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Job Title (Marathi) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maharashtra Police Bharti 2026"
                    value={formData.titleMr}
                    onChange={(e) => handleTitleChange(e.target.value, true)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Title in English
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra Police Constable Recruitment 2026"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value, false)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maharashtra Police Department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Vacancies *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 17,471+ Posts"
                    value={formData.vacancies}
                    onChange={(e) => setFormData({ ...formData, vacancies: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Qualification *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 12th Pass (HSC) & Physical Qualification"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Last Date / Status *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 31st March 2026 / Opening Soon"
                    value={formData.lastDate}
                    onChange={(e) => setFormData({ ...formData, lastDate: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Job Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Complete details, age limits, and physical requirements for Police Constable recruitment..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Official Website URL
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
                    Notification PDF Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/notice.pdf"
                    value={formData.pdfUrl}
                    onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    placeholder="₹21,700 - ₹69,100 (S-6 Level)"
                    value={formData.salaryRange}
                    onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Related Mock Exam Slug
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          examSlug: `${generateSlug(formData.title || formData.titleMr || "mock-exam")}-mock-test`,
                        })
                      }
                      className="text-[10px] font-bold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      ⚡ Auto-Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. police-bharti-mock-01 (Autogenerated)"
                    value={formData.examSlug}
                    onChange={(e) => setFormData({ ...formData, examSlug: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
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
                  🔔 Broadcast In-App & Web Push notifications to all students
                </label>
              </div>
            </form>

            {/* Fixed Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800 shrink-0 bg-slate-50/80 dark:bg-slate-900/80">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="job-form"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white shadow-md transition hover:bg-blue-500 active:scale-95 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>{submitting ? "Publishing..." : "Publish & Broadcast"}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
