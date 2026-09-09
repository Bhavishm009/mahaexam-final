"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Search,
  Building2,
  Calendar,
  GraduationCap,
  Sparkles,
  Layers,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
} from "lucide-react";
import ConfirmModal from "@/components/confirm-modal";

export default function AdminJobsManagementPage() {
  const queryClient = useQueryClient();

  // Search, Filter, Pagination & Bulk Selection State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  // 1. Fetch Jobs with TanStack Query
  const {
    data: jobsData,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/jobs");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch jobs");
      return data.jobs || data.jobAlerts || [];
    },
  });

  const jobs = jobsData || [];

  // 2. Delete Single Job Mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/admin/jobs?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete job alert.");
      }
      return data;
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["admin-jobs"] });
      const previousJobs = queryClient.getQueryData(["admin-jobs"]) || [];
      queryClient.setQueryData(
        ["admin-jobs"],
        previousJobs.filter((j) => j.id !== deletedId),
      );
      return { previousJobs };
    },
    onError: (err, deletedId, context) => {
      if (context?.previousJobs) {
        queryClient.setQueryData(["admin-jobs"], context.previousJobs);
      }
      toast.error(err.message || "Failed to delete job alert.");
    },
    onSuccess: () => {
      toast.success("Job alert deleted successfully!");
      setDeleteTarget(null);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget?.id));
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    },
  });

  // 3. Bulk Delete Mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      const res = await fetch("/api/admin/jobs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete selected jobs.");
      }
      return data;
    },
    onMutate: async (deletedIds) => {
      await queryClient.cancelQueries({ queryKey: ["admin-jobs"] });
      const previousJobs = queryClient.getQueryData(["admin-jobs"]) || [];
      queryClient.setQueryData(
        ["admin-jobs"],
        previousJobs.filter((j) => !deletedIds.includes(j.id)),
      );
      return { previousJobs };
    },
    onError: (err, deletedIds, context) => {
      if (context?.previousJobs) {
        queryClient.setQueryData(["admin-jobs"], context.previousJobs);
      }
      toast.error(err.message || "Failed to delete selected jobs.");
    },
    onSuccess: (data) => {
      toast.success(data.message || `Successfully deleted ${selectedIds.length} job alerts.`);
      setSelectedIds([]);
      setShowBulkConfirm(false);
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    },
  });

  // Filtered & Searched Data
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchSearch =
        !search ||
        job.title?.toLowerCase().includes(search.toLowerCase()) ||
        job.titleMr?.toLowerCase().includes(search.toLowerCase()) ||
        job.department?.toLowerCase().includes(search.toLowerCase()) ||
        job.departmentMr?.toLowerCase().includes(search.toLowerCase()) ||
        job.qualification?.toLowerCase().includes(search.toLowerCase()) ||
        job.examSlug?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "ALL" || job.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [jobs, search, statusFilter]);

  // Paginated Slices
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, currentPage, pageSize]);

  // Bulk Selection Handlers
  const allCurrentPageSelected =
    paginatedJobs.length > 0 && paginatedJobs.every((j) => selectedIds.includes(j.id));

  const someCurrentPageSelected =
    paginatedJobs.some((j) => selectedIds.includes(j.id)) && !allCurrentPageSelected;

  function toggleSelectAllCurrentPage() {
    if (allCurrentPageSelected) {
      const pageIds = paginatedJobs.map((j) => j.id);
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      const pageIds = paginatedJobs.map((j) => j.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  }

  function toggleSelectRow(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  // Metric counts
  const totalCount = jobs.length;
  const activeCount = jobs.filter((j) => j.status === "ACTIVE").length;
  const upcomingCount = jobs.filter((j) => j.status === "UPCOMING").length;
  const expiredCount = jobs.filter((j) => j.status === "EXPIRED").length;

  return (
    <div className="w-full min-w-0 max-w-full space-y-6 font-sans">
      {/* Top Banner Header Card */}
      <div className="glass-card flex flex-col justify-between gap-4 rounded-3xl p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
            <Briefcase className="h-4 w-4 shrink-0" />
            <span>Recruitment & Vacancies Master</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Job Alerts & Notifications Directory
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            Publish government jobs, police recruitment, MPSC, and Zilla Parishad alerts with rich
            syllabus details.
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
            href="/admin/jobs/new"
            className="glass-btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black text-white shadow-md transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>+ Post Job Alert</span>
          </Link>
        </div>
      </div>

      {/* Metric Tiles Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="glass-card flex items-center justify-between rounded-2xl p-4 shadow-sm">
          <div>
            <div className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400">
              Total Alerts
            </div>
            <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
              {totalCount}
            </div>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-100/90 text-sky-600 dark:bg-sky-950/80 dark:text-sky-400">
            <Briefcase className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card flex items-center justify-between rounded-2xl p-4 shadow-sm">
          <div>
            <div className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400">
              Active Jobs
            </div>
            <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {activeCount}
            </div>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100/90 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card flex items-center justify-between rounded-2xl p-4 shadow-sm">
          <div>
            <div className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400">
              Upcoming
            </div>
            <div className="mt-1 text-2xl font-black text-blue-600 dark:text-blue-400">
              {upcomingCount}
            </div>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100/90 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card flex items-center justify-between rounded-2xl p-4 shadow-sm">
          <div>
            <div className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400">
              Expired
            </div>
            <div className="mt-1 text-2xl font-black text-slate-500 dark:text-slate-400">
              {expiredCount}
            </div>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <XCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Table Container Card */}
      <div className="glass-card w-full min-w-0 max-w-full space-y-4 rounded-3xl p-4 shadow-sm sm:p-6">
        {/* Filter Controls Row */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[220px] flex-1 sm:w-72 sm:flex-none">
              <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search job title, department, exam..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-slate-200/80 bg-white/90 py-1.5 pl-9 pr-3 text-xs font-semibold text-slate-900 outline-none transition focus:border-sky-500 dark:border-slate-800/80 dark:bg-slate-950/80 dark:text-white"
              />
            </div>

            {/* Status Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200/80 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-sky-500 dark:border-slate-800/80 dark:bg-slate-950/80 dark:text-slate-200"
            >
              <option value="ALL">All Statuses ({jobs.length})</option>
              <option value="ACTIVE">Active ({activeCount})</option>
              <option value="UPCOMING">Upcoming ({upcomingCount})</option>
              <option value="EXPIRED">Expired ({expiredCount})</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>
              Showing {filteredJobs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filteredJobs.length)} of {filteredJobs.length}
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
              <span>job alert{selectedIds.length > 1 ? "s" : ""} selected</span>
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
          <table className="w-full min-w-[900px] border-collapse text-left text-xs">
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
                <th className="px-4 py-3.5">Job Title & Department</th>
                <th className="px-4 py-3.5">Vacancies</th>
                <th className="px-4 py-3.5">Qualification</th>
                <th className="px-4 py-3.5">Deadline</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-sky-500" />
                    <span className="mt-2 block text-xs font-semibold">
                      Loading job notifications...
                    </span>
                  </td>
                </tr>
              ) : paginatedJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Briefcase className="mx-auto h-8 w-8 opacity-40" />
                    <span className="mt-2 block text-xs font-semibold">
                      No job notifications match your search or filter criteria.
                    </span>
                  </td>
                </tr>
              ) : (
                paginatedJobs.map((job) => {
                  const isChecked = selectedIds.includes(job.id);
                  return (
                    <tr
                      key={job.id}
                      className={`transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40 ${
                        isChecked ? "bg-sky-50/50 dark:bg-sky-950/30" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(job.id)}
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                      </td>

                      {/* Job Title & Department */}
                      <td className="max-w-md px-4 py-3.5">
                        <div className="flex items-start gap-3">
                          {job.imageUrl ? (
                            <img
                              src={job.imageUrl}
                              alt={job.title}
                              className="h-10 w-14 shrink-0 rounded-lg border border-slate-200 object-cover dark:border-slate-800"
                            />
                          ) : (
                            <div className="grid h-10 w-14 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800">
                              <Briefcase className="h-5 w-5" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="line-clamp-1 font-bold text-slate-900 dark:text-white">
                              {job.title}
                            </div>
                            {job.titleMr && job.titleMr !== job.title && (
                              <div className="line-clamp-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                {job.titleMr}
                              </div>
                            )}
                            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                              <Building2 className="h-3 w-3 shrink-0" />
                              <span className="line-clamp-1">{job.department || "General"}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Vacancies */}
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className="font-black text-sky-700 dark:text-sky-400">
                          {job.vacancies || "Not Specified"}
                        </span>
                      </td>

                      {/* Qualification */}
                      <td className="max-w-xs px-4 py-3.5">
                        <div className="line-clamp-2 flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          <GraduationCap className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span>{job.qualification || job.qualificationMr || "Any Degree"}</span>
                        </div>
                      </td>

                      {/* Deadline */}
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>{job.lastDate || "TBA"}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-4 py-3.5 text-center">
                        {job.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100/90 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </span>
                        ) : job.status === "UPCOMING" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-blue-300 bg-blue-100/90 px-2.5 py-0.5 text-[10px] font-black text-blue-800 dark:border-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
                            <Clock className="h-3 w-3" />
                            Upcoming
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-[10px] font-black text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                            <XCircle className="h-3 w-3" />
                            Expired
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {job.officialUrl && (
                            <a
                              href={job.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                              title="Visit Official Portal"
                            >
                              <ExternalLink className="h-3 w-3 text-sky-600 dark:text-sky-400" />
                              <span>Link</span>
                            </a>
                          )}

                          <Link
                            href={`/admin/jobs/${job.id}/edit`}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          >
                            <Edit2 className="h-3 w-3 text-sky-600 dark:text-sky-400" />
                            <span>Edit</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(job)}
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

        {/* Pagination Bar */}
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

      {/* Delete Single Item Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Job Alert"
        message={`Are you sure you want to delete "${deleteTarget?.title || deleteTarget?.titleMr}"? This action cannot be undone.`}
        confirmText="Yes, Delete Job Alert"
        cancelText="Cancel"
        isDanger={true}
        isLoading={deleteJobMutation.isPending}
        onConfirm={() => deleteJobMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Bulk Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showBulkConfirm}
        title={`Delete ${selectedIds.length} Job Alerts`}
        message={`Are you sure you want to permanently delete all ${selectedIds.length} selected job alerts?`}
        confirmText={`Delete ${selectedIds.length} Jobs`}
        cancelText="Cancel"
        isDanger={true}
        isLoading={bulkDeleteMutation.isPending}
        onConfirm={() => bulkDeleteMutation.mutate(selectedIds)}
        onCancel={() => setShowBulkConfirm(false)}
      />
    </div>
  );
}
