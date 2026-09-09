"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Tag,
  Search,
  RefreshCw,
  Sparkles,
  Layers,
} from "lucide-react";
import ConfirmModal from "@/components/confirm-modal";

export default function AdminBlogsPage() {
  const queryClient = useQueryClient();

  // Search, Filter, Pagination & Bulk Selection State
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  // 1. Fetch Blogs with TanStack Query
  const {
    data: blogsData,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["admin-blogs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/blogs");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch blogs");
      return data.blogs || [];
    },
  });

  const blogs = blogsData || [];

  // Extract dynamic categories
  const categories = useMemo(() => {
    const set = new Set(blogs.map((b) => b.category).filter(Boolean));
    return Array.from(set);
  }, [blogs]);

  // 2. Delete Blog Post Mutation
  const deleteBlogMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/admin/blogs?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete blog post.");
      }
      return data;
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["admin-blogs"] });
      const previousBlogs = queryClient.getQueryData(["admin-blogs"]) || [];
      queryClient.setQueryData(
        ["admin-blogs"],
        previousBlogs.filter((b) => b.id !== deletedId),
      );
      return { previousBlogs };
    },
    onError: (err, deletedId, context) => {
      if (context?.previousBlogs) {
        queryClient.setQueryData(["admin-blogs"], context.previousBlogs);
      }
      toast.error(err.message || "Failed to delete blog post.");
    },
    onSuccess: () => {
      toast.success("Blog post deleted successfully!");
      setDeleteTarget(null);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget?.id));
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
    },
  });

  // 3. Bulk Delete Mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      const res = await fetch("/api/admin/blogs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete selected blog posts.");
      }
      return data;
    },
    onMutate: async (deletedIds) => {
      await queryClient.cancelQueries({ queryKey: ["admin-blogs"] });
      const previousBlogs = queryClient.getQueryData(["admin-blogs"]) || [];
      queryClient.setQueryData(
        ["admin-blogs"],
        previousBlogs.filter((b) => !deletedIds.includes(b.id)),
      );
      return { previousBlogs };
    },
    onError: (err, deletedIds, context) => {
      if (context?.previousBlogs) {
        queryClient.setQueryData(["admin-blogs"], context.previousBlogs);
      }
      toast.error(err.message || "Failed to delete selected posts.");
    },
    onSuccess: (data) => {
      toast.success(data.message || `Successfully deleted ${selectedIds.length} blog posts.`);
      setSelectedIds([]);
      setShowBulkConfirm(false);
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
    },
  });

  // Filtered & Searched Data
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchSearch =
        !search ||
        blog.title?.toLowerCase().includes(search.toLowerCase()) ||
        blog.titleMr?.toLowerCase().includes(search.toLowerCase()) ||
        blog.excerpt?.toLowerCase().includes(search.toLowerCase()) ||
        blog.authorName?.toLowerCase().includes(search.toLowerCase()) ||
        blog.slug?.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        categoryFilter === "ALL" || blog.category?.toLowerCase() === categoryFilter.toLowerCase();

      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PUBLISHED" && blog.published) ||
        (statusFilter === "DRAFT" && !blog.published);

      return matchSearch && matchCategory && matchStatus;
    });
  }, [blogs, search, categoryFilter, statusFilter]);

  // Paginated Slices
  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / pageSize));
  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBlogs.slice(start, start + pageSize);
  }, [filteredBlogs, currentPage, pageSize]);

  // Bulk Selection Handlers
  const allCurrentPageSelected =
    paginatedBlogs.length > 0 && paginatedBlogs.every((b) => selectedIds.includes(b.id));

  const someCurrentPageSelected =
    paginatedBlogs.some((b) => selectedIds.includes(b.id)) && !allCurrentPageSelected;

  function toggleSelectAllCurrentPage() {
    if (allCurrentPageSelected) {
      const pageIds = paginatedBlogs.map((b) => b.id);
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      const pageIds = paginatedBlogs.map((b) => b.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  }

  function toggleSelectRow(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  // Metric counts
  const totalCount = blogs.length;
  const publishedCount = blogs.filter((b) => b.published).length;
  const draftCount = totalCount - publishedCount;

  return (
    <div className="w-full min-w-0 max-w-full space-y-6 font-sans">
      {/* Top Banner Header Card */}
      <div className="glass-card flex flex-col justify-between gap-4 rounded-3xl p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
            <FileText className="h-4 w-4 shrink-0" />
            <span>Content Publishing & Editorial</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Blog Posts & Updates Directory
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            Publish educational articles, syllabus updates, exam tips, and topper guidance with rich
            text editor.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-800/80 dark:bg-slate-900/80 dark:text-slate-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-sky-600" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/blogs/new"
            className="glass-btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black text-white shadow-md transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>+ Create Blog Post</span>
          </Link>
        </div>
      </div>

      {/* Metric Tiles Bar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="glass-card flex items-center justify-between rounded-2xl p-4 shadow-sm">
          <div>
            <div className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400">
              Total Articles
            </div>
            <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
              {totalCount}
            </div>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-100/90 text-sky-600 dark:bg-sky-950/80 dark:text-sky-400">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card flex items-center justify-between rounded-2xl p-4 shadow-sm">
          <div>
            <div className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400">
              Published Live
            </div>
            <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {publishedCount}
            </div>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100/90 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card flex items-center justify-between rounded-2xl p-4 shadow-sm">
          <div>
            <div className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400">
              Drafts & Hidden
            </div>
            <div className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">
              {draftCount}
            </div>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100/90 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400">
            <Layers className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Table Container Card */}
      <div className="glass-card w-full min-w-0 max-w-full space-y-4 rounded-3xl p-4 shadow-sm sm:p-6">
        {/* Filter Controls Row */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[220px] flex-1 sm:w-64 sm:flex-none">
              <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles, topics, keywords..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-slate-200/80 bg-white/90 py-1.5 pl-9 pr-3 text-xs font-semibold text-slate-900 outline-none transition focus:border-sky-500 dark:border-slate-800/80 dark:bg-slate-950/80 dark:text-white"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200/80 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-sky-500 dark:border-slate-800/80 dark:bg-slate-950/80 dark:text-slate-200"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200/80 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-sky-500 dark:border-slate-800/80 dark:bg-slate-950/80 dark:text-slate-200"
            >
              <option value="ALL">All Statuses ({blogs.length})</option>
              <option value="PUBLISHED">Published ({publishedCount})</option>
              <option value="DRAFT">Drafts ({draftCount})</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>
              Showing {filteredBlogs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filteredBlogs.length)} of {filteredBlogs.length}
            </span>
          </div>
        </div>

        {/* Floating Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-300/80 bg-sky-50/90 px-4 py-3 shadow-sm dark:border-sky-800/80 dark:bg-sky-950/70">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-900 dark:text-sky-200">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-sky-600 text-[11px] font-black text-white">
                {selectedIds.length}
              </span>
              <span>post{selectedIds.length > 1 ? "s" : ""} selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Deselect All
              </button>
              <button
                type="button"
                onClick={() => setShowBulkConfirm(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* Responsive Table Listing */}
        <div className="w-full min-w-0 max-w-full overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/40 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40">
          <table className="w-full min-w-[850px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-100/75 text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:border-slate-800/80 dark:bg-slate-800/60 dark:text-slate-300">
                <th className="w-12 px-4 py-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={allCurrentPageSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someCurrentPageSelected;
                    }}
                    onChange={toggleSelectAllCurrentPage}
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    title="Select all on current page"
                  />
                </th>
                <th className="px-4 py-3.5">Article Title</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Author & Date</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-sky-500" />
                    <span className="mt-2 block text-xs font-semibold">
                      Loading blog articles...
                    </span>
                  </td>
                </tr>
              ) : paginatedBlogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <FileText className="mx-auto h-8 w-8 opacity-40" />
                    <span className="mt-2 block text-xs font-semibold">
                      No blog posts match your search or filter criteria.
                    </span>
                  </td>
                </tr>
              ) : (
                paginatedBlogs.map((blog) => {
                  const isChecked = selectedIds.includes(blog.id);
                  return (
                    <tr
                      key={blog.id}
                      className={`transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40 ${
                        isChecked ? "bg-sky-50/50 dark:bg-sky-950/30" : ""
                      }`}
                    >
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(blog.id)}
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                      </td>

                      <td className="max-w-md px-4 py-3.5">
                        <div className="flex items-start gap-3">
                          {blog.imageUrl ? (
                            <img
                              src={blog.imageUrl}
                              alt={blog.title}
                              className="h-10 w-14 shrink-0 rounded-lg border border-slate-200 object-cover dark:border-slate-800"
                            />
                          ) : (
                            <div className="grid h-10 w-14 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800">
                              <FileText className="h-5 w-5" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="line-clamp-1 font-bold text-slate-900 dark:text-white">
                              {blog.title}
                            </div>
                            {blog.titleMr && blog.titleMr !== blog.title && (
                              <div className="line-clamp-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                {blog.titleMr}
                              </div>
                            )}
                            {blog.excerpt && (
                              <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-500 dark:text-slate-400">
                                {blog.excerpt}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                          <Tag className="h-3 w-3" />
                          {blog.category || "Exam News"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {blog.authorName || "MahaExam Team"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(blog.createdAt).toLocaleDateString("en-IN", {
                            dateStyle: "medium",
                          })}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-center">
                        {blog.published ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100/90 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                            <CheckCircle className="h-3 w-3" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100/90 px-2.5 py-0.5 text-[10px] font-black text-amber-800 dark:border-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                            <XCircle className="h-3 w-3" />
                            Draft
                          </span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/blogs/${blog.slug || blog.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            title="View Live Article"
                          >
                            <Eye className="h-3 w-3 text-sky-600 dark:text-sky-400" />
                            <span>View</span>
                          </a>

                          <Link
                            href={`/admin/blogs/${blog.id}/edit`}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          >
                            <Edit2 className="h-3 w-3 text-sky-600 dark:text-sky-400" />
                            <span>Edit</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(blog)}
                            className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/50"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col items-center justify-between gap-3 pt-2 sm:flex-row">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              Previous
            </button>
            <span className="px-3 text-xs font-bold text-slate-700 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Blog Post"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Yes, Delete Post"
        cancelText="Cancel"
        isDanger={true}
        isLoading={deleteBlogMutation.isPending}
        onConfirm={() => deleteBlogMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Bulk Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showBulkConfirm}
        title={`Delete ${selectedIds.length} Blog Posts`}
        message={`Are you sure you want to permanently delete all ${selectedIds.length} selected blog posts?`}
        confirmText={`Delete ${selectedIds.length} Posts`}
        cancelText="Cancel"
        isDanger={true}
        isLoading={bulkDeleteMutation.isPending}
        onConfirm={() => bulkDeleteMutation.mutate(selectedIds)}
        onCancel={() => setShowBulkConfirm(false)}
      />
    </div>
  );
}
