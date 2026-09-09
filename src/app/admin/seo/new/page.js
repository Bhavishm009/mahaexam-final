"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Globe,
  Search,
  Sparkles,
  Link as LinkIcon,
  Tag,
  ImageIcon,
  Loader2,
  FileText,
} from "lucide-react";
import { getBaseUrl } from "@/lib/base-url";

const SUGGESTED_ROUTES = [
  "/",
  "/exams",
  "/jobs",
  "/blogs",
  "/pricing",
  "/about-us",
  "/contact",
  "/privacy",
  "/terms",
  "/faq",
];

export default function AddSeoPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    route: "",
    title: "",
    titleMr: "",
    description: "",
    descriptionMr: "",
    keywords: "",
    canonicalUrl: "",
    ogImage: "/og-image.png",
  });

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.route?.trim()) {
      toast.error("Route path is required (e.g. /exams or /jobs).");
      return;
    }

    if (!formData.title?.trim() && !formData.titleMr?.trim()) {
      toast.error("SEO Page Title is required.");
      return;
    }

    let cleanRoute = formData.route.trim().toLowerCase();
    if (!cleanRoute.startsWith("/")) {
      cleanRoute = "/" + cleanRoute;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          route: cleanRoute,
          title: formData.title || formData.titleMr,
          titleMr: formData.titleMr || formData.title,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save SEO configuration");

      toast.success("SEO route configuration created successfully!");
      router.push("/admin/seo");
    } catch (err) {
      toast.error(err.message || "Failed to create SEO configuration");
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
            href="/admin/seo"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to SEO Settings
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Configure New SEO Route
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Define canonical URLs, bilingual search metadata, keywords, and Google snippets for any
            portal route.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/seo"
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
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Configuration
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Google SERP Preview Card */}
        <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/60 sm:p-8">
          <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 dark:border-slate-800/80">
            <Search className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Live Google Search Snippet Preview
            </h2>
          </div>

          <div className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-inner dark:border-slate-800/70 dark:bg-slate-950">
            <div className="flex items-center gap-2">
              <div className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                G
              </div>
              <div>
                <div className="truncate text-[11px] text-slate-600 dark:text-slate-400">
                  {getBaseUrl().replace(/^https?:\/\//, "")}
                  {formData.route || "/"}
                </div>
                <div className="truncate text-[10px] text-slate-400">
                  {formData.canonicalUrl || `${getBaseUrl()}${formData.route || "/"}`}
                </div>
              </div>
            </div>
            <div className="mt-2 line-clamp-1 text-base font-medium text-blue-800 hover:underline dark:text-blue-400">
              {formData.title || "MahaExam — महाराष्ट्र स्पर्धा परीक्षा पोर्टल २०२६"}
            </div>
            <div className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
              {formData.description ||
                "पोलीस भरती, तलाठी, MPSC व जिल्हा परिषद परीक्षांच्या दर्जेदार ऑनलाइन मॉक टेस्ट व चालू घडामोडी सराव."}
            </div>
          </div>
        </div>

        {/* Route Details Card */}
        <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/60 sm:p-8">
          <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 dark:border-slate-800/80">
            <Globe className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Route Path & Bilingual Titles
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Route Path */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Target Route Path <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    required
                    value={formData.route}
                    onChange={(e) => setFormData((prev) => ({ ...prev, route: e.target.value }))}
                    placeholder="/exams किंवा /jobs/police-bharti"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-mono text-xs font-bold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-500">Quick presets:</span>
                {SUGGESTED_ROUTES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, route: r }))}
                    className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-sky-950/60 dark:hover:text-sky-300"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Page Title EN */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                SEO Meta Title (English) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Maharashtra Police Bharti 2026 Free Mock Tests | MahaExam"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
              <div className="text-right text-[10px] text-slate-400">
                {formData.title.length} / 60 recommended characters
              </div>
            </div>

            {/* Page Title MR */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                SEO Meta Title (मराठी)
              </label>
              <input
                type="text"
                value={formData.titleMr}
                onChange={(e) => setFormData((prev) => ({ ...prev, titleMr: e.target.value }))}
                placeholder="उदा. महाराष्ट्र पोलीस भरती २०२६ मोफत ऑनलाईन सराव चाचण्या"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Meta Description EN */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Meta Description (English)
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="A compelling, keyword-rich summary of this page (around 150-160 characters)..."
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
              <div className="text-right text-[10px] text-slate-400">
                {formData.description.length} / 160 recommended characters
              </div>
            </div>

            {/* Meta Description MR */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Meta Description (मराठी)
              </label>
              <textarea
                rows={3}
                value={formData.descriptionMr}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, descriptionMr: e.target.value }))
                }
                placeholder="या पानाविषयी मराठीत संक्षिप्त आणि आकर्षक वर्णन..."
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Indexing, Canonical & OG Image Card */}
        <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/60 sm:p-8">
          <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 dark:border-slate-800/80">
            <LinkIcon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Keywords, Canonical URL & Social Image
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Meta Keywords */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Target Meta Keywords (Comma Separated)
              </label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => setFormData((prev) => ({ ...prev, keywords: e.target.value }))}
                placeholder="Police Bharti 2026, Mock Test, MPSC Test Series, Online CBT"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Canonical URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Canonical URL
              </label>
              <input
                type="url"
                value={formData.canonicalUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, canonicalUrl: e.target.value }))}
                placeholder="https://example.com/exams"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-mono text-xs text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* OG Image */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Social Share Image (og:image)
              </label>
              <input
                type="text"
                value={formData.ogImage}
                onChange={(e) => setFormData((prev) => ({ ...prev, ogImage: e.target.value }))}
                placeholder="/og-image.png किंवा https://example.com/banner.png"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-mono text-xs text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Bottom Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/seo"
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
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save SEO Route
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
