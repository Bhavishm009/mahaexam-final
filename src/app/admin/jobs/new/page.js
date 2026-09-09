"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Briefcase,
  Building2,
  Calendar,
  GraduationCap,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Send,
  IndianRupee,
  FileText,
} from "lucide-react";
import RichTextEditor from "@/components/rich-text-editor";

export default function AddJobPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [notifyStudents, setNotifyStudents] = useState(true);

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
    salaryRange: "₹२१,७०० - ₹६९,१०० (S-6 Level) + भत्ते",
    ageLimit: "१८ ते २८ वर्षे (मागासवर्गीय उमेदवारांसाठी ५ वर्षे सूट)",
    selectionProcess: "१) मैदानी चाचणी (५० गुण)  २) संगणकीय लेखी परीक्षा (१०० गुण)",
  });

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setFormData((prev) => ({ ...prev, imageUrl: data.url }));
      toast.success("Job banner uploaded successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to upload banner image");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.title?.trim() && !formData.titleMr?.trim()) {
      toast.error("Job alert title is required.");
      return;
    }

    if (!formData.department?.trim() && !formData.departmentMr?.trim()) {
      toast.error("Department name is required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        title: formData.title || formData.titleMr,
        titleMr: formData.titleMr || formData.title,
        department: formData.department || formData.departmentMr,
        departmentMr: formData.departmentMr || formData.department,
        qualification: formData.qualification || formData.qualificationMr,
        qualificationMr: formData.qualificationMr || formData.qualification,
        description: formData.description || formData.descriptionMr,
        descriptionMr: formData.descriptionMr || formData.description,
        notifyStudents,
      };

      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create job alert");

      toast.success("Job alert created and published successfully!");
      router.push("/admin/jobs");
    } catch (err) {
      toast.error(err.message || "Failed to create job alert");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      {/* Header & Back */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/admin/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Job Alerts
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Post New Job Notification
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Publish government recruitment updates, vacancy details, eligibility, and links for
            aspirants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/jobs"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/20 transition hover:from-sky-600 hover:to-blue-700 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Publishing...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Publish Job Alert
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/60 sm:p-8">
          <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 dark:border-slate-800/80">
            <Briefcase className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Recruitment Overview & Titles
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Title EN */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Job Title (English) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Maharashtra Police Constable & Driver Bharti 2026"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Title MR */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Job Title (मराठी) <span className="font-normal text-slate-400">(पर्यायी)</span>
              </label>
              <input
                type="text"
                value={formData.titleMr}
                onChange={(e) => setFormData((prev) => ({ ...prev, titleMr: e.target.value }))}
                placeholder="उदा. महाराष्ट्र पोलीस शिपाई व चालक भरती २०२६"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Department EN */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Department Name (English) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                placeholder="e.g. Maharashtra Police Department"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Department MR */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Department Name (मराठी)
              </label>
              <input
                type="text"
                value={formData.departmentMr}
                onChange={(e) => setFormData((prev) => ({ ...prev, departmentMr: e.target.value }))}
                placeholder="उदा. महाराष्ट्र राज्य पोलीस विभाग"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Total Vacancies */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Total Vacancies / पदे
              </label>
              <input
                type="text"
                value={formData.vacancies}
                onChange={(e) => setFormData((prev) => ({ ...prev, vacancies: e.target.value }))}
                placeholder="e.g. १७,४७१+ पदे किंवा 524 Posts"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Last Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Last Date / अर्ज करण्याची शेवटची तारीख
              </label>
              <input
                type="text"
                value={formData.lastDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, lastDate: e.target.value }))}
                placeholder="e.g. ३१ मार्च २०२६ किंवा 15 Oct 2026"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Recruitment Status
              </label>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex cursor-pointer items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <input
                    type="radio"
                    name="status"
                    checked={formData.status === "ACTIVE"}
                    onChange={() => setFormData((prev) => ({ ...prev, status: "ACTIVE" }))}
                    className="text-sky-600 focus:ring-sky-500"
                  />
                  <CheckCircle2 className="h-4 w-4" /> Active (चालू)
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400">
                  <input
                    type="radio"
                    name="status"
                    checked={formData.status === "UPCOMING"}
                    onChange={() => setFormData((prev) => ({ ...prev, status: "UPCOMING" }))}
                    className="text-sky-600 focus:ring-sky-500"
                  />
                  <Clock className="h-4 w-4" /> Upcoming (लवकरच)
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <input
                    type="radio"
                    name="status"
                    checked={formData.status === "EXPIRED"}
                    onChange={() => setFormData((prev) => ({ ...prev, status: "EXPIRED" }))}
                    className="text-sky-600 focus:ring-sky-500"
                  />
                  <XCircle className="h-4 w-4" /> Expired (मुदत संपली)
                </label>
              </div>
            </div>

            {/* Qualification */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Educational Qualification / शैक्षणिक पात्रता
              </label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    qualification: e.target.value,
                    qualificationMr: prev.qualificationMr || e.target.value,
                  }))
                }
                placeholder="e.g. १२ वी उत्तीर्ण (HSC) किंवा कोणत्याही शाखेची पदवी (Graduate)"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Salary, Age Limit & Links Card */}
        <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/60 sm:p-8">
          <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 dark:border-slate-800/80">
            <IndianRupee className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Remuneration, Eligibility & Official Portals
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Salary Range */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Salary Scale / वेतनश्रेणी
              </label>
              <input
                type="text"
                value={formData.salaryRange}
                onChange={(e) => setFormData((prev) => ({ ...prev, salaryRange: e.target.value }))}
                placeholder="e.g. ₹२१,७०० - ₹६९,१०० (S-6 Level) + भत्ते"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Age Limit */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Age Limit / वयोमर्यादा
              </label>
              <input
                type="text"
                value={formData.ageLimit}
                onChange={(e) => setFormData((prev) => ({ ...prev, ageLimit: e.target.value }))}
                placeholder="e.g. १८ ते २८ वर्षे (मागासवर्गीय उमेदवारांसाठी ५ वर्षे सूट)"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Selection Process */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Selection Process / निवड प्रक्रिया
              </label>
              <input
                type="text"
                value={formData.selectionProcess}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, selectionProcess: e.target.value }))
                }
                placeholder="e.g. १) CBT ऑनलाईन परीक्षा  २) कागदपत्र पडताळणी / मुलाखत"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Official Website URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Official Online Application Link
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.officialUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, officialUrl: e.target.value }))
                  }
                  placeholder="https://mahapolice.gov.in"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pl-10 font-mono text-xs text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
                <ExternalLink className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Notification PDF Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Official Notification PDF Link
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.notificationPdf}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notificationPdf: e.target.value }))
                  }
                  placeholder="https://mpsc.gov.in/advt-2026.pdf"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pl-10 font-mono text-xs text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
                <FileText className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Banner Image */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Notification Banner Image
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/banner.png"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-mono text-xs text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                  <ImageIcon className="h-4 w-4" />
                  {uploadingImage ? "Uploading..." : "Upload Banner"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>
              {formData.imageUrl && (
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50 p-2 dark:border-slate-800/80 dark:bg-slate-950">
                  <img
                    src={formData.imageUrl}
                    alt="Job banner preview"
                    className="h-14 w-28 rounded-lg object-cover shadow-sm"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Banner Preview</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rich Text Editor for Job Details Card */}
        <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/60 sm:p-8">
          <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 dark:border-slate-800/80">
            <FileText className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Detailed Job Description & Syllabus (Rich Text)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Format stages, exam patterns, subject weightage, physical criteria, and guidelines
                with the rich text editor.
              </p>
            </div>
          </div>

          {/* Description (Marathi) */}
          <RichTextEditor
            label="Job Details & Syllabus (मराठी)"
            value={formData.descriptionMr}
            onChange={(val) => setFormData((prev) => ({ ...prev, descriptionMr: val }))}
            placeholder="भरतीची सविस्तर माहिती, परीक्षा पद्धती, पात्रता व इतर अटी येथे लिहा..."
            minHeight="280px"
            helperText="Formatted details will be shown to aspirants on the job alert details view."
          />

          {/* Description (English) */}
          <RichTextEditor
            label="Job Details & Syllabus (English) - Optional"
            value={formData.description}
            onChange={(val) => setFormData((prev) => ({ ...prev, description: val }))}
            placeholder="Write English description and recruitment rules here..."
            minHeight="240px"
          />

          {/* Push Notification Toggle */}
          <div className="rounded-xl border border-sky-200/80 bg-sky-50/60 p-4 dark:border-sky-900/40 dark:bg-sky-950/30">
            <label className="flex cursor-pointer items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-500 text-white shadow-sm">
                  <Send className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Broadcast Instant Web Push Notification
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    Immediately alert all subscribed students on their mobile devices and browsers.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyStudents}
                onChange={(e) => setNotifyStudents(e.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
            </label>
          </div>
        </div>

        {/* Bottom Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/jobs"
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-500/20 transition hover:from-sky-600 hover:to-blue-700 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Publishing...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Publish Job Alert
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
