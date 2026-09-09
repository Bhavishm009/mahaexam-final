"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Sparkles,
  Save,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Tag,
  Globe,
  Loader2,
} from "lucide-react";
import RichTextEditor from "@/components/rich-text-editor";

const PRESET_CATEGORIES = [
  "Police Bharti",
  "Talathi Bharti",
  "MPSC Special",
  "Zilla Parishad",
  "Preparation Tips",
  "Syllabus & Pattern",
  "Current Affairs",
  "Exam Notifications",
];

export default function AddBlogPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    titleMr: "",
    slug: "",
    content: "",
    contentMr: "",
    excerpt: "",
    imageUrl: "",
    category: "Police Bharti",
    published: true,
    authorName: "MahaExam Editorial Team",
  });

  function generateSlug(text) {
    return (text || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleTitleChange(val, isMarathi = false) {
    if (isMarathi) {
      setFormData((prev) => ({
        ...prev,
        titleMr: val,
        title: prev.title || val,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        title: val,
        slug: prev.slug || generateSlug(val),
      }));
    }
  }

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
      toast.success("Cover image uploaded successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.title?.trim()) {
      toast.error("Blog title is required.");
      return;
    }

    if (!formData.content?.trim() && !formData.contentMr?.trim()) {
      toast.error("Blog content is required in at least one language.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        content: formData.content || formData.contentMr,
        contentMr: formData.contentMr || formData.content,
        titleMr: formData.titleMr || formData.title,
      };

      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create blog post");

      toast.success("Blog post published successfully!");
      router.push("/admin/blogs");
    } catch (err) {
      toast.error(err.message || "Failed to create blog post");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/admin/blogs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Blog Posts
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Create New Blog Post
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Publish an informative study article, exam preparation strategy, or vacancy
            notification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/blogs"
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
                <Save className="h-4 w-4" /> Publish Blog Post
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Content Card */}
        <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/60 sm:p-8">
          {/* Post Metadata Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Title EN */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Blog Title (English) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value, false)}
                placeholder="e.g. Maharashtra Police Bharti 2026: Complete Preparation Guide"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Title MR */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Blog Title (मराठी) <span className="font-normal text-slate-400">(पर्यायी)</span>
              </label>
              <input
                type="text"
                value={formData.titleMr}
                onChange={(e) => handleTitleChange(e.target.value, true)}
                placeholder="उदा. महाराष्ट्र पोलीस भरती २०२६: संपूर्ण तयारी मार्गदर्शक"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* URL Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                URL Slug / Permalink
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 dark:border-slate-800 dark:bg-slate-950">
                <span className="text-xs text-slate-400">/blogs/</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      slug: generateSlug(e.target.value),
                    }))
                  }
                  placeholder="police-bharti-2026-guide"
                  className="w-full bg-transparent px-1 py-1 font-mono text-xs text-slate-900 outline-none dark:text-slate-100"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Category
              </label>
              <div className="relative">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  {PRESET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <Tag className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Author */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Author Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.authorName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, authorName: e.target.value }))}
                  placeholder="MahaExam Editorial Team"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Publishing Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Publishing Status
              </label>
              <div className="flex items-center gap-4 pt-1.5">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="published"
                    checked={formData.published === true}
                    onChange={() => setFormData((prev) => ({ ...prev, published: true }))}
                    className="text-sky-600 focus:ring-sky-500"
                  />
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /> Published (Live)
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="published"
                    checked={formData.published === false}
                    onChange={() => setFormData((prev) => ({ ...prev, published: false }))}
                    className="text-sky-600 focus:ring-sky-500"
                  />
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <XCircle className="h-4 w-4" /> Draft (Unpublished)
                  </span>
                </label>
              </div>
            </div>

            {/* Excerpt / Short Summary */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Excerpt / Short Summary
              </label>
              <textarea
                rows={2}
                value={formData.excerpt}
                onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Brief 1-2 sentence preview for search results and social cards..."
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Cover Image */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Featured Cover Image
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/cover-image.jpg"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-mono text-xs text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                  <ImageIcon className="h-4 w-4" />
                  {uploadingImage ? "Uploading..." : "Upload Cover Image"}
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
                    alt="Cover preview"
                    className="h-14 w-24 rounded-lg object-cover shadow-sm"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Preview of current cover image
                  </span>
                </div>
              )}
            </div>
          </div>

          <hr className="border-slate-200/80 dark:border-slate-800/80" />

          {/* Bilingual Rich Text Editors */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Article Body Content
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Use the rich formatting toolbar to craft headings, bullet points, quotes, links, and
                bold text.
              </p>
            </div>

            {/* English Content */}
            <RichTextEditor
              label="Article Content (English)"
              value={formData.content}
              onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
              placeholder="Write the comprehensive blog post in English here..."
              minHeight="280px"
              helperText="You can toggle between Visual WYSIWYG and HTML Source mode anytime using the button in the toolbar."
            />

            {/* Marathi Content */}
            <RichTextEditor
              label="Article Content (मराठी) - Optional"
              value={formData.contentMr}
              onChange={(val) => setFormData((prev) => ({ ...prev, contentMr: val }))}
              placeholder="येथे मराठीत सविस्तर माहिती लिहा..."
              minHeight="260px"
              helperText="If left empty, the English content will be displayed to Marathi language visitors."
            />
          </div>
        </div>

        {/* Bottom Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/blogs"
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
                <Save className="h-4 w-4" /> Publish Blog Post
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
