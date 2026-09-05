"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Eye,
  Tag,
  User,
  Calendar,
  Sparkles,
} from "lucide-react";
import ConfirmModal from "@/components/confirm-modal";

export default function AdminBlogsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    title: "",
    titleMr: "",
    category: "Exam News",
    excerpt: "",
    content: "",
    contentMr: "",
    imageUrl: "",
    published: true,
    authorName: "MahaExam Team",
  });

  // 1. Fetch Blogs with TanStack Query
  const { data: blogsData, isLoading: loading } = useQuery({
    queryKey: ["admin-blogs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/blogs");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load blog posts");
      return data.blogs || [];
    },
  });

  const blogs = blogsData || [];

  function handleOpenCreateModal() {
    setEditingId(null);
    setFormData({
      title: "",
      titleMr: "",
      category: "Exam News",
      excerpt: "",
      content: "",
      contentMr: "",
      imageUrl: "",
      published: true,
      authorName: "MahaExam Team",
    });
    setShowModal(true);
  }

  function handleOpenEditModal(blog) {
    setEditingId(blog.id);
    setFormData({
      title: blog.title || "",
      titleMr: blog.titleMr || "",
      category: blog.category || "Exam News",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      contentMr: blog.contentMr || "",
      imageUrl: blog.imageUrl || "",
      published: blog.published !== false,
      authorName: blog.authorName || "MahaExam Team",
    });
    setShowModal(true);
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
        toast.success("Blog feature image uploaded successfully!");
      } else {
        toast.error(result.error || "Failed to upload image.");
      }
    } catch (err) {
      toast.error("Upload error: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  }

  // 2. Save Blog Post Mutation (Create / Edit) with Optimistic Update
  const saveBlogMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save blog post.");
      }
      return data;
    },
    onMutate: async (newBlogPayload) => {
      await queryClient.cancelQueries({ queryKey: ["admin-blogs"] });
      const previousBlogs = queryClient.getQueryData(["admin-blogs"]) || [];

      if (newBlogPayload.id) {
        // Edit optimistic update
        queryClient.setQueryData(
          ["admin-blogs"],
          previousBlogs.map((b) => (b.id === newBlogPayload.id ? { ...b, ...newBlogPayload } : b)),
        );
      } else {
        // Create optimistic update
        const optimisticBlog = {
          id: "temp-" + Date.now(),
          slug: (newBlogPayload.title || "blog").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          createdAt: new Date().toISOString(),
          ...newBlogPayload,
        };
        queryClient.setQueryData(["admin-blogs"], [optimisticBlog, ...previousBlogs]);
      }

      return { previousBlogs };
    },
    onError: (err, newBlogPayload, context) => {
      if (context?.previousBlogs) {
        queryClient.setQueryData(["admin-blogs"], context.previousBlogs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
    },
  });

  // 3. Delete Blog Post Mutation with Optimistic Update
  const deleteBlogMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/admin/blogs?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete blog post.");
      }
      return data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["admin-blogs"] });
      const previousBlogs = queryClient.getQueryData(["admin-blogs"]) || [];

      queryClient.setQueryData(
        ["admin-blogs"],
        previousBlogs.filter((b) => b.id !== id),
      );

      return { previousBlogs };
    },
    onError: (err, id, context) => {
      if (context?.previousBlogs) {
        queryClient.setQueryData(["admin-blogs"], context.previousBlogs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
    },
  });

  function handleSubmit(e) {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a Blog Title.");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Please enter the Blog Content.");
      return;
    }

    const payload = {
      id: editingId,
      ...formData,
    };

    setShowModal(false);

    toast.promise(saveBlogMutation.mutateAsync(payload), {
      loading: editingId ? "Updating blog post..." : "Publishing new blog post...",
      success: (data) => data.message || "Blog post saved successfully!",
      error: (err) => `Failed to save blog post: ${err.message}`,
    });
  }

  function handleDelete(id, title) {
    setDeleteTarget({ id, title });
  }

  function confirmDeleteBlog() {
    if (!deleteTarget) return;
    const { id, title } = deleteTarget;
    setDeleteTarget(null);

    toast.promise(deleteBlogMutation.mutateAsync(id), {
      loading: `Deleting "${title}"...`,
      success: "Blog post deleted successfully!",
      error: (err) => `Failed to delete blog post: ${err.message}`,
    });
  }

  const submitting = saveBlogMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            <FileText className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            Blog Posts Management
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Create, edit, and publish articles, exam updates, and study guides for students.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500/20"
        >
          <Plus className="h-5 w-5" />
          Create Blog Post
        </button>
      </div>

      {/* Blog Listing Grid */}
      {loading ? (
        <div className="rounded-2xl border border-zinc-200 bg-white py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm text-zinc-500">Loading blog posts...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <FileText className="mx-auto mb-3 h-12 w-12 text-zinc-400" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            No Blog Posts Yet
          </h3>
          <p className="mx-auto mb-6 mt-1 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
            Get started by publishing your first article or notification post for MahaExam
            aspirants.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Create First Blog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                {/* Feature Image or Placeholder */}
                {blog.imageUrl ? (
                  <div className="relative h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <img
                      src={blog.imageUrl}
                      alt={blog.title}
                      className="h-full w-full object-cover"
                    />
                    <span
                      className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        blog.published
                          ? "bg-emerald-500/90 text-white"
                          : "bg-amber-500/90 text-white"
                      }`}
                    >
                      {blog.published ? "Published" : "Draft"}
                    </span>
                  </div>
                ) : (
                  <div className="relative flex h-36 w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                    <FileText className="h-10 w-10 text-white/70" />
                    <span
                      className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        blog.published
                          ? "bg-emerald-500/90 text-white"
                          : "bg-amber-500/90 text-white"
                      }`}
                    >
                      {blog.published ? "Published" : "Draft"}
                    </span>
                  </div>
                )}

                <div className="p-5">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <Tag className="h-3.5 w-3.5" />
                    <span>{blog.category}</span>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <span className="font-normal text-zinc-500">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="mb-2 line-clamp-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {blog.title}
                  </h3>

                  {blog.excerpt && (
                    <p className="mb-4 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {blog.excerpt}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-zinc-100 p-5 pt-0 dark:border-zinc-800/60">
                <a
                  href={`/blogs/${blog.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Blog
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(blog)}
                    className="rounded-lg p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-indigo-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-indigo-400"
                    title="Edit Blog"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id, blog.title)}
                    className="rounded-lg p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-rose-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-rose-400"
                    title="Delete Blog"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Blog Modal */}
      {showModal &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/75 p-4 backdrop-blur-md sm:p-6">
            <div className="animate-in fade-in zoom-in-95 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl duration-150 dark:border-zinc-800 dark:bg-zinc-900">
              {/* Fixed Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 bg-zinc-50/80 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/80">
                <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  {editingId ? "Edit Blog Post" : "Create New Blog Post"}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form
                id="blog-form"
                onSubmit={handleSubmit}
                className="flex-1 space-y-5 overflow-y-auto p-6"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Blog Title (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. How to Crack Maharashtra Police Bharti 2026"
                      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Blog Title (Marathi)
                    </label>
                    <input
                      type="text"
                      value={formData.titleMr}
                      onChange={(e) => setFormData({ ...formData, titleMr: e.target.value })}
                      placeholder="e.g. महाराष्ट्र पोलीस भरती २०२६ तयारी मार्गदर्शक"
                      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                      <option value="Exam News">Exam News</option>
                      <option value="Preparation Tips">Preparation Tips</option>
                      <option value="Syllabus & Pattern">Syllabus & Pattern</option>
                      <option value="Cut Off & Results">Cut Off & Results</option>
                      <option value="General Updates">General Updates</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={formData.authorName}
                      onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                      placeholder="MahaExam Team"
                      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {/* Feature Image Upload */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Feature Image
                  </label>
                  <div className="flex flex-col items-center gap-4 sm:flex-row">
                    {formData.imageUrl ? (
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: "" })}
                          className="absolute right-1 top-1 rounded-full bg-rose-600 p-1 text-white shadow"
                          title="Remove Image"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex h-24 w-24 flex-shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 text-zinc-400 dark:border-zinc-700">
                        <ImageIcon className="mb-1 h-8 w-8" />
                        <span className="text-[10px]">No Image</span>
                      </div>
                    )}

                    <div className="w-full flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="block w-full cursor-pointer text-sm text-zinc-500 file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-zinc-800 dark:file:text-zinc-300"
                      />
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {uploadingImage
                          ? "Uploading image to Supabase storage..."
                          : "Upload a banner/thumbnail image for this blog post."}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Short Excerpt / Summary
                  </label>
                  <textarea
                    rows={2}
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="A short 1-2 sentence overview of the article..."
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Full Blog Article Content *
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write the full blog post content here..."
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 font-sans text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-700"
                  />
                  <label
                    htmlFor="published"
                    className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Publish this post immediately for all users
                  </label>
                </div>
              </form>

              {/* Fixed Footer */}
              <div className="flex shrink-0 items-center justify-end gap-3 border-t border-zinc-200 bg-zinc-50/80 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/80">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="blog-form"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  {editingId ? "Update Blog Post" : "Publish Blog Post"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Delete Blog Post Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Blog Post"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete Post"
        isLoading={deleteBlogMutation.isPending}
        onConfirm={confirmDeleteBlog}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
