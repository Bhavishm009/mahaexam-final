"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Globe,
  Search,
  Link as LinkIcon,
  Loader2,
  Trash2,
  RotateCcw,
} from "lucide-react";
import ConfirmModal from "@/components/confirm-modal";
import { getBaseUrl } from "@/lib/base-url";

function EditSeoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetRoute = searchParams.get("route") || "/";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    route: targetRoute,
    title: "",
    titleMr: "",
    description: "",
    descriptionMr: "",
    keywords: "",
    canonicalUrl: "",
    ogImage: "/og-image.png",
    isCustomized: false,
    isDefaultRoute: false,
  });

  useEffect(() => {
    async function fetchSeo() {
      if (!targetRoute) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/seo?route=${encodeURIComponent(targetRoute)}`);
        const data = await res.json();
        if (!res.ok || !data.setting) {
          throw new Error(data.error || "SEO configuration not found");
        }
        const s = data.setting;
        setFormData({
          route: s.route || targetRoute,
          title: s.title || "",
          titleMr: s.titleMr || "",
          description: s.description || "",
          descriptionMr: s.descriptionMr || "",
          keywords: s.keywords || "",
          canonicalUrl: s.canonicalUrl || "",
          ogImage: s.ogImage || "/og-image.png",
          isCustomized: !!s.isCustomized,
          isDefaultRoute: !!s.isDefaultRoute,
        });
      } catch (err) {
        toast.error(err.message || "Failed to load SEO configuration");
      } finally {
        setLoading(false);
      }
    }
    fetchSeo();
  }, [targetRoute]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.title?.trim() && !formData.titleMr?.trim()) {
      toast.error("SEO Page Title is required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          route: formData.route,
          title: formData.title || formData.titleMr,
          titleMr: formData.titleMr || formData.title,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update SEO configuration");

      toast.success("SEO route configuration updated successfully!");
      router.push("/admin/seo");
    } catch (err) {
      toast.error(err.message || "Failed to update SEO configuration");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/seo?route=${encodeURIComponent(formData.route)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset/delete SEO override");

      toast.success("SEO configuration reset to default successfully!");
      router.push("/admin/seo");
    } catch (err) {
      toast.error(err.message || "Failed to reset SEO configuration");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        <p className="text-sm font-medium text-slate-500">Loading SEO settings...</p>
      </div>
    );
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
            Edit SEO Configuration
          </h1>
          <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
            Route: {formData.route}{" "}
            {formData.isCustomized ? "· [Custom DB Override]" : "· [Platform Default]"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {formData.isCustomized && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 shadow-sm transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset to Default
            </button>
          )}
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
                <Save className="h-4 w-4" /> Save Changes
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
                  {formData.route}
                </div>
                <div className="truncate text-[10px] text-slate-400">
                  {formData.canonicalUrl || `${getBaseUrl()}${formData.route}`}
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
            {/* Route Path (Read Only) */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Route Path
              </label>
              <input
                type="text"
                readOnly
                value={formData.route}
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 font-mono text-xs font-bold text-slate-600 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
              />
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
                placeholder="A compelling, keyword-rich summary of this page..."
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
                placeholder="Police Bharti 2026, Mock Test, MPSC Test Series"
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
                <Save className="h-4 w-4" /> Save SEO Configuration
              </>
            )}
          </button>
        </div>
      </form>

      {/* Delete / Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Reset Custom SEO Settings"
        message={`Are you sure you want to reset custom SEO overrides for "${formData.route}"? It will revert to the platform default configuration.`}
        confirmText="Yes, Reset to Default"
        cancelText="Cancel"
        isDanger={true}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}

export default function EditSeoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
          <p className="text-sm font-medium text-slate-500">Loading SEO editor...</p>
        </div>
      }
    >
      <EditSeoForm />
    </Suspense>
  );
}
