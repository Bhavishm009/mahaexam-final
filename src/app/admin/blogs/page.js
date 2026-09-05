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

export default function AdminBlogsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
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
          previousBlogs.map((b) =>
            b.id === newBlogPayload.id ? { ...b, ...newBlogPayload } : b
          )
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
        previousBlogs.filter((b) => b.id !== id)
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
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Blog Posts Management
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Create, edit, and publish articles, exam updates, and study guides for students.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
        >
          <Plus className="w-5 h-5" />
          Create Blog Post
        </button>
      </div>

      {/* Blog Listing Grid */}
      {loading ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm text-zinc-500">Loading blog posts...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8">
          <FileText className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No Blog Posts Yet</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mt-1 mb-6">
            Get started by publishing your first article or notification post for MahaExam aspirants.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" />
            Create First Blog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Feature Image or Placeholder */}
                {blog.imageUrl ? (
                  <div className="h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
                    <img
                      src={blog.imageUrl}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold rounded-full ${blog.published
                        ? "bg-emerald-500/90 text-white"
                        : "bg-amber-500/90 text-white"
                        }`}
                    >
                      {blog.published ? "Published" : "Draft"}
                    </span>
                  </div>
                ) : (
                  <div className="h-36 w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative">
                    <FileText className="w-10 h-10 text-white/70" />
                    <span
                      className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold rounded-full ${blog.published
                        ? "bg-emerald-500/90 text-white"
                        : "bg-amber-500/90 text-white"
                        }`}
                    >
                      {blog.published ? "Published" : "Draft"}
                    </span>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-2">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{blog.category}</span>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <span className="text-zinc-500 font-normal">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 line-clamp-2 mb-2">
                    {blog.title}
                  </h3>

                  {blog.excerpt && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 mb-4">
                      {blog.excerpt}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-zinc-100 dark:border-zinc-800/60 mt-auto flex items-center justify-between">
                <a
                  href={`/blogs/${blog.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline inline-flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Blog
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(blog)}
                    className="p-2 text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
                    title="Edit Blog"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id, blog.title)}
                    className="p-2 text-zinc-600 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
                    title="Delete Blog"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Blog Modal */}
      {showModal && mounted && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 shrink-0">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {editingId ? "Edit Blog Post" : "Create New Blog Post"}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="blog-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Blog Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. How to Crack Maharashtra Police Bharti 2026"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Blog Title (Marathi)
                  </label>
                  <input
                    type="text"
                    value={formData.titleMr}
                    onChange={(e) => setFormData({ ...formData, titleMr: e.target.value })}
                    placeholder="e.g. महाराष्ट्र पोलीस भरती २०२६ तयारी मार्गदर्शक"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                  >
                    <option value="Exam News">Exam News</option>
                    <option value="Preparation Tips">Preparation Tips</option>
                    <option value="Syllabus & Pattern">Syllabus & Pattern</option>
                    <option value="Cut Off & Results">Cut Off & Results</option>
                    <option value="General Updates">General Updates</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    placeholder="MahaExam Team"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Feature Image Upload */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Feature Image
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {formData.imageUrl ? (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: "" })}
                        className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 shadow"
                        title="Remove Image"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center text-zinc-400 flex-shrink-0">
                      <ImageIcon className="w-8 h-8 mb-1" />
                      <span className="text-[10px]">No Image</span>
                    </div>
                  )}

                  <div className="flex-1 w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-zinc-800 dark:file:text-zinc-300 cursor-pointer"
                    />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {uploadingImage
                        ? "Uploading image to Supabase storage..."
                        : "Upload a banner/thumbnail image for this blog post."}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Short Excerpt / Summary
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="A short 1-2 sentence overview of the article..."
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Blog Article Content *
                </label>
                <textarea
                  rows={6}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write the full blog post content here..."
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-sans"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-zinc-300 dark:border-zinc-700"
                />
                <label htmlFor="published" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Publish this post immediately for all users
                </label>
              </div>
            </form>

            {/* Fixed Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="blog-form"
                disabled={submitting}
                className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
                {editingId ? "Update Blog Post" : "Publish Blog Post"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
