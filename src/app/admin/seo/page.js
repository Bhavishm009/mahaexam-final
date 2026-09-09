"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Globe,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
  Layers,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import ConfirmModal from "@/components/confirm-modal";

export default function AdminSeoPage() {
  const queryClient = useQueryClient();

  // Filter, Search, Pagination & Bulk Selection State
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL | CUSTOMIZED | DEFAULT
  const [selectedRoutes, setSelectedRoutes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  // 1. Fetch SEO Settings with TanStack Query
  const {
    data: seoData,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["admin-seo-settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/seo");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch SEO settings");
      return data.settings || [];
    },
  });

  const settings = seoData || [];

  // 2. Reset / Delete Single Route SEO Mutation
  const deleteSeoMutation = useMutation({
    mutationFn: async (route) => {
      const res = await fetch(`/api/admin/seo?route=${encodeURIComponent(route)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reset SEO setting.");
      }
      return data;
    },
    onMutate: async (deletedRoute) => {
      await queryClient.cancelQueries({ queryKey: ["admin-seo-settings"] });
      const previous = queryClient.getQueryData(["admin-seo-settings"]) || [];
      queryClient.setQueryData(
        ["admin-seo-settings"],
        previous.map((s) => (s.route === deletedRoute ? { ...s, isCustomized: false } : s)),
      );
      return { previous };
    },
    onError: (err, deletedRoute, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["admin-seo-settings"], context.previous);
      }
      toast.error(err.message || "Failed to reset SEO setting.");
    },
    onSuccess: () => {
      toast.success("SEO route override reset to default successfully!");
      setDeleteTarget(null);
      setSelectedRoutes((prev) => prev.filter((r) => r !== deleteTarget?.route));
      queryClient.invalidateQueries({ queryKey: ["admin-seo-settings"] });
    },
  });

  // 3. Bulk Delete / Reset Mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (routes) => {
      const res = await fetch("/api/admin/seo", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routes }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reset selected SEO settings.");
      }
      return data;
    },
    onMutate: async (deletedRoutes) => {
      await queryClient.cancelQueries({ queryKey: ["admin-seo-settings"] });
      const previous = queryClient.getQueryData(["admin-seo-settings"]) || [];
      queryClient.setQueryData(
        ["admin-seo-settings"],
        previous.map((s) => (deletedRoutes.includes(s.route) ? { ...s, isCustomized: false } : s)),
      );
      return { previous };
    },
    onError: (err, deletedRoutes, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["admin-seo-settings"], context.previous);
      }
      toast.error(err.message || "Failed to reset selected SEO settings.");
    },
    onSuccess: (data) => {
      toast.success(data.message || `Successfully reset ${selectedRoutes.length} SEO routes.`);
      setSelectedRoutes([]);
      setShowBulkConfirm(false);
      queryClient.invalidateQueries({ queryKey: ["admin-seo-settings"] });
    },
  });

  // Filtered & Searched Data
  const filteredSettings = useMemo(() => {
    return settings.filter((item) => {
      const matchSearch =
        !search ||
        item.route?.toLowerCase().includes(search.toLowerCase()) ||
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.titleMr?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase()) ||
        item.keywords?.toLowerCase().includes(search.toLowerCase());

      const matchFilter =
        filterType === "ALL" ||
        (filterType === "CUSTOMIZED" && item.isCustomized) ||
        (filterType === "DEFAULT" && !item.isCustomized);

      return matchSearch && matchFilter;
    });
  }, [settings, search, filterType]);

  // Paginated Slices
  const totalPages = Math.max(1, Math.ceil(filteredSettings.length / pageSize));
  const paginatedSettings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSettings.slice(start, start + pageSize);
  }, [filteredSettings, currentPage, pageSize]);

  // Bulk Selection Handlers
  const allCurrentPageSelected =
    paginatedSettings.length > 0 &&
    paginatedSettings.every((item) => selectedRoutes.includes(item.route));

  const someCurrentPageSelected =
    paginatedSettings.some((item) => selectedRoutes.includes(item.route)) &&
    !allCurrentPageSelected;

  function toggleSelectAllCurrentPage() {
    if (allCurrentPageSelected) {
      const pageRoutes = paginatedSettings.map((item) => item.route);
      setSelectedRoutes((prev) => prev.filter((r) => !pageRoutes.includes(r)));
    } else {
      const pageRoutes = paginatedSettings.map((item) => item.route);
      setSelectedRoutes((prev) => Array.from(new Set([...prev, ...pageRoutes])));
    }
  }

  function toggleSelectRow(route) {
    setSelectedRoutes((prev) =>
      prev.includes(route) ? prev.filter((item) => item !== route) : [...prev, route],
    );
  }

  // Metric counts
  const totalCount = settings.length;
  const customizedCount = settings.filter((s) => s.isCustomized).length;
  const defaultCount = totalCount - customizedCount;

  return (
    <div className="w-full min-w-0 max-w-full space-y-6 font-sans">
      {/* Top Banner Header Card */}
      <div className="glass-card flex flex-col justify-between gap-4 rounded-3xl p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
            <Globe className="h-4 w-4 shrink-0" />
            <span>Search Engine Optimization</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Route SEO & Metadata Directory
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            Manage meta titles, descriptions, canonical URLs, and Google SERP snippets for all
            portal routes.
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
            href="/admin/seo/new"
            className="glass-btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black text-white shadow-md transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add SEO Route</span>
          </Link>
        </div>
      </div>

      {/* Metric Tiles Bar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="glass-card flex items-center justify-between rounded-2xl p-4 shadow-sm">
          <div>
            <div className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400">
              Total Managed Routes
            </div>
            <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
              {totalCount}
            </div>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-100/90 text-sky-600 dark:bg-sky-950/80 dark:text-sky-400">
            <Globe className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card flex items-center justify-between rounded-2xl p-4 shadow-sm">
          <div>
            <div className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400">
              Custom DB Overrides
            </div>
            <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {customizedCount}
            </div>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100/90 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card flex items-center justify-between rounded-2xl p-4 shadow-sm">
          <div>
            <div className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400">
              Default Configured
            </div>
            <div className="mt-1 text-2xl font-black text-slate-600 dark:text-slate-300">
              {defaultCount}
            </div>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
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
            <div className="relative min-w-[220px] flex-1 sm:w-72 sm:flex-none">
              <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search route path, title, keywords..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-slate-200/80 bg-white/90 py-1.5 pl-9 pr-3 text-xs font-semibold text-slate-900 outline-none transition focus:border-sky-500 dark:border-slate-800/80 dark:bg-slate-950/80 dark:text-white"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center rounded-xl border border-slate-200/80 bg-white/90 p-1 text-xs dark:border-slate-800/80 dark:bg-slate-950/80">
              <button
                type="button"
                onClick={() => {
                  setFilterType("ALL");
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-3 py-1 font-bold transition ${
                  filterType === "ALL"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                All ({settings.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterType("CUSTOMIZED");
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-3 py-1 font-bold transition ${
                  filterType === "CUSTOMIZED"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                Customized ({customizedCount})
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterType("DEFAULT");
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-3 py-1 font-bold transition ${
                  filterType === "DEFAULT"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                Default ({defaultCount})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>
              Showing {filteredSettings.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filteredSettings.length)} of{" "}
              {filteredSettings.length}
            </span>
          </div>
        </div>

        {/* Floating Bulk Action Bar */}
        {selectedRoutes.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-300/80 bg-sky-50/90 px-4 py-3 shadow-sm dark:border-sky-800/80 dark:bg-sky-950/70">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-900 dark:text-sky-200">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-sky-600 text-[11px] font-black text-white">
                {selectedRoutes.length}
              </span>
              <span>route{selectedRoutes.length > 1 ? "s" : ""} selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedRoutes([])}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Deselect All
              </button>
              <button
                type="button"
                onClick={() => setShowBulkConfirm(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Selected ({selectedRoutes.length})</span>
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
                <th className="px-4 py-3.5">Route Path</th>
                <th className="px-4 py-3.5">SEO Title & Snippet</th>
                <th className="px-4 py-3.5">Keywords & OG</th>
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
                      Loading SEO settings...
                    </span>
                  </td>
                </tr>
              ) : paginatedSettings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Globe className="mx-auto h-8 w-8 opacity-40" />
                    <span className="mt-2 block text-xs font-semibold">
                      No SEO route configurations match your search or filter.
                    </span>
                  </td>
                </tr>
              ) : (
                paginatedSettings.map((item) => {
                  const isChecked = selectedRoutes.includes(item.route);
                  return (
                    <tr
                      key={item.route}
                      className={`transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40 ${
                        isChecked ? "bg-sky-50/50 dark:bg-sky-950/30" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(item.route)}
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                      </td>

                      {/* Route Path */}
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-300">
                            {item.route}
                          </span>
                          <a
                            href={item.route}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 transition hover:text-sky-600"
                            title="Open live route in new tab"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </td>

                      {/* SEO Title & Description Snippet */}
                      <td className="max-w-md px-4 py-3.5">
                        <div className="line-clamp-1 font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </div>
                        {item.titleMr && item.titleMr !== item.title && (
                          <div className="line-clamp-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {item.titleMr}
                          </div>
                        )}
                        {item.description && (
                          <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-500 dark:text-slate-400">
                            {item.description}
                          </p>
                        )}
                      </td>

                      {/* Keywords & OG */}
                      <td className="max-w-xs px-4 py-3.5">
                        <div className="line-clamp-1 font-mono text-[10px] text-slate-600 dark:text-slate-300">
                          {item.keywords || "No custom keywords"}
                        </div>
                        <div className="line-clamp-1 text-[10px] text-slate-400">
                          OG: {item.ogImage || "/og-image.png"}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-4 py-3.5 text-center">
                        {item.isCustomized ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100/90 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                            <Sparkles className="h-3 w-3" />
                            Custom Override
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-[10px] font-black text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                            Platform Default
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/seo/edit?route=${encodeURIComponent(item.route)}`}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          >
                            <Edit2 className="h-3 w-3 text-sky-600 dark:text-sky-400" />
                            <span>Edit</span>
                          </Link>

                          {item.isCustomized && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/50"
                              title="Reset to default settings"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Reset</span>
                            </button>
                          )}
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

      {/* Reset Single Route Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Reset Custom SEO Override"
        message={`Are you sure you want to reset custom SEO settings for "${deleteTarget?.route}"? It will revert to the platform default configuration.`}
        confirmText="Yes, Reset to Default"
        cancelText="Cancel"
        isDanger={true}
        isLoading={deleteSeoMutation.isPending}
        onConfirm={() => deleteSeoMutation.mutate(deleteTarget.route)}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Bulk Reset Confirm Modal */}
      <ConfirmModal
        isOpen={showBulkConfirm}
        title={`Reset ${selectedRoutes.length} SEO Routes`}
        message={`Are you sure you want to revert all ${selectedRoutes.length} selected routes back to their platform defaults?`}
        confirmText={`Reset ${selectedRoutes.length} Routes`}
        cancelText="Cancel"
        isDanger={true}
        isLoading={bulkDeleteMutation.isPending}
        onConfirm={() => bulkDeleteMutation.mutate(selectedRoutes)}
        onCancel={() => setShowBulkConfirm(false)}
      />
    </div>
  );
}
