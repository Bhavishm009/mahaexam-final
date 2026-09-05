"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertTriangle,
  RefreshCw,
  Search,
  Terminal,
  Activity,
  ArrowLeft,
  Trash2,
  Clock,
  Zap,
  CheckCircle2,
  ShieldAlert,
  Server,
  Layers,
  ChevronDown,
  ChevronRight,
  Filter,
  X,
  Copy,
  Check,
  UserCheck,
  Globe,
  Gauge,
  Sparkles,
} from "lucide-react";
import { fetchJson } from "@/lib/api-client";
import ConfirmModal from "@/components/confirm-modal";

const API_FAMILIES = [
  { id: "ALL", label: "All API Endpoints" },
  { id: "/api/student", label: "/api/student/* (Student Portal)" },
  { id: "/api/coaching", label: "/api/coaching/* (Academies & Batches)" },
  { id: "/api/auth", label: "/api/auth/* (Authentication & Passkeys)" },
  { id: "/api/exams", label: "/api/exams/* (Exams & Attempts)" },
  { id: "/api/questions", label: "/api/questions/* (Question Bank)" },
  { id: "/api/admin", label: "/api/admin/* (Admin Management)" },
];

const ROLES = [
  { id: "ALL", label: "All Roles" },
  { id: "STUDENT", label: "Student" },
  { id: "TEACHER", label: "Teacher" },
  { id: "COACHING_ADMIN", label: "Coaching Admin" },
  { id: "ADMIN", label: "Admin" },
  { id: "SUPER_ADMIN", label: "Super Admin" },
  { id: "ANONYMOUS", label: "Anonymous / Guest" },
];

const METHODS = ["ALL", "GET", "POST", "PUT", "PATCH", "DELETE"];

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [pruning, setPruning] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Filter States
  const [statusTab, setStatusTab] = useState("ALL"); // ALL, ERRORS, SUCCESS, SLOW
  const [selectedMethod, setSelectedMethod] = useState("ALL");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedApiFamily, setSelectedApiFamily] = useState("ALL");
  const [query, setQuery] = useState("");

  const [stats, setStats] = useState({
    totalCount: 0,
    errorCount: 0,
    apiCallCount: 0,
    successCount: 0,
    avgLatencyMs: 0,
    retentionHours: 6,
  });

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (statusTab === "ERRORS") {
        params.set("filter", "ERRORS");
      } else if (statusTab === "SUCCESS") {
        params.set("statusGroup", "SUCCESS");
      } else if (statusTab === "SLOW") {
        params.set("filter", "ALL");
      } else {
        params.set("filter", "ALL");
      }

      if (selectedMethod !== "ALL") params.set("method", selectedMethod);
      if (selectedRole !== "ALL") params.set("role", selectedRole);
      if (selectedApiFamily !== "ALL") params.set("apiRoute", selectedApiFamily);
      if (query.trim()) params.set("q", query.trim());

      const { ok, data } = await fetchJson(`/api/admin/logs?${params.toString()}`);
      if (ok && data.success) {
        let fetchedLogs = data.logs || [];
        if (statusTab === "SLOW") {
          fetchedLogs = fetchedLogs.filter(
            (l) => l.metadata?.durationMs && l.metadata.durationMs > 300,
          );
        }
        setLogs(fetchedLogs);
        setStats({
          totalCount: data.totalCount || 0,
          errorCount: data.errorCount || 0,
          apiCallCount: data.apiCallCount || 0,
          successCount: data.successCount || 0,
          avgLatencyMs: data.avgLatencyMs || 0,
          retentionHours: data.retentionHours || 6,
        });
      } else {
        toast.error(data.error || "Failed to load logs");
      }
    } catch (err) {
      toast.error(err.message || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }, [statusTab, selectedMethod, selectedRole, selectedApiFamily, query]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  function toggleRow(id) {
    setExpandedRowId((prev) => (prev === id ? null : id));
  }

  function handleCopy(text, id) {
    navigator.clipboard.writeText(typeof text === "string" ? text : JSON.stringify(text, null, 2));
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  }

  function resetFilters() {
    setStatusTab("ALL");
    setSelectedMethod("ALL");
    setSelectedRole("ALL");
    setSelectedApiFamily("ALL");
    setQuery("");
  }

  const isFiltered =
    statusTab !== "ALL" ||
    selectedMethod !== "ALL" ||
    selectedRole !== "ALL" ||
    selectedApiFamily !== "ALL" ||
    query.trim().length > 0;

  async function handlePruneExpired() {
    setPruning(true);
    try {
      const { ok, data } = await fetchJson("/api/admin/logs?mode=prune", { method: "DELETE" });
      if (ok && data.success) {
        toast.success(data.message || `Pruned logs older than ${stats.retentionHours} hours.`);
        await loadLogs();
      } else {
        toast.error(data.error || "Failed to prune logs.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to prune logs.");
    } finally {
      setPruning(false);
    }
  }

  async function confirmClearLogs() {
    setClearing(true);
    try {
      const { ok, data } = await fetchJson("/api/admin/logs?mode=all", { method: "DELETE" });
      if (ok && data.success) {
        toast.success(data.message || "All logs cleared successfully.");
        setShowClearModal(false);
        await loadLogs();
      } else {
        toast.error(data.error || "Failed to clear logs.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to clear logs.");
    } finally {
      setClearing(false);
    }
  }

  function getMethodBadge(method) {
    switch (method?.toUpperCase()) {
      case "GET":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-900";
      case "POST":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900";
      case "PATCH":
      case "PUT":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-900";
      case "DELETE":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
    }
  }

  function getStatusBadge(status) {
    const code = Number(status) || 200;
    if (code >= 200 && code < 300) {
      return {
        cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
        dot: "bg-emerald-500",
      };
    }
    if (code >= 400 && code < 500) {
      return {
        cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
        dot: "bg-amber-500",
      };
    }
    return {
      cls: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800",
      dot: "bg-rose-500",
    };
  }

  function getLatencyBadge(durationMs) {
    if (typeof durationMs !== "number") return null;
    if (durationMs < 200) {
      return "text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800";
    }
    if (durationMs < 600) {
      return "text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/50 font-bold";
    }
    return "text-rose-700 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-950/50 font-black";
  }

  return (
    <main className="min-h-screen space-y-6 font-sans text-slate-900 transition-colors dark:text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Hero */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300 backdrop-blur-md">
                  <Activity className="h-3.5 w-3.5 text-blue-400" />
                  Live 100% Universal API Diagnostics
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-md">
                  <Clock className="h-3 w-3 text-amber-400" />
                  Auto-Retained for {stats.retentionHours} Hours
                </span>
                {stats.errorCount > 0 && (
                  <span className="inline-flex animate-pulse items-center gap-1 rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-black text-white">
                    <AlertTriangle className="h-3 w-3" />
                    {stats.errorCount} {stats.errorCount === 1 ? "Error" : "Errors"}
                  </span>
                )}
              </div>
              <h1 className="mt-3 text-2xl font-black sm:text-3xl">API & System Logs ⚡</h1>
              <p className="mt-1 text-xs text-slate-300 sm:text-sm">
                Real-time tracking of all 138+ application API routes • Status codes, execution
                latencies, user roles, error diagnostics & stack traces.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={loadLogs}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95 disabled:opacity-50"
                title="Refresh log stream"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
              <button
                type="button"
                onClick={handlePruneExpired}
                disabled={pruning}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-white/10 px-4 py-2.5 text-xs font-bold text-amber-300 backdrop-blur-md transition hover:bg-amber-500/20 active:scale-95 disabled:opacity-50"
                title={`Purge logs older than ${stats.retentionHours}h`}
              >
                <Clock className={`h-4 w-4 ${pruning ? "animate-spin" : ""}`} />
                <span>Prune &gt;{stats.retentionHours}h</span>
              </button>
              <button
                type="button"
                onClick={() => setShowClearModal(true)}
                disabled={clearing || stats.totalCount === 0}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-600/80 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-rose-600 active:scale-95 disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All</span>
              </button>
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-2xl bg-white/20 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/30"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            </div>
          </div>

          {/* Metric Stats Grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-200">
                <Layers className="h-4 w-4 text-blue-400" />
                <span>Total Calls ({stats.retentionHours}h)</span>
              </div>
              <div className="mt-2 text-xl font-black text-white">{stats.totalCount}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Successful Calls</span>
              </div>
              <div className="mt-2 text-xl font-black text-white">{stats.successCount}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-200">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                <span>Errors Logged</span>
              </div>
              <div className="mt-2 text-xl font-black text-white">{stats.errorCount}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-200">
                <Zap className="h-4 w-4 text-amber-400" />
                <span>Avg Latency</span>
              </div>
              <div className="mt-2 text-xl font-black text-white">{stats.avgLatencyMs} ms</div>
            </div>
          </div>
        </div>

        {/* Filter Control Bar */}
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Quick Status Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "ALL", label: "All Logs" },
                { id: "ERRORS", label: "Errors Only 🚨" },
                { id: "SUCCESS", label: "Success 2xx 🟢" },
                { id: "SLOW", label: "Slow APIs (>300ms) ⏱️" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusTab(tab.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    statusTab === tab.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Clear Filters Button */}
            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline dark:text-rose-400"
              >
                <X className="h-3.5 w-3.5" />
                Reset Filters
              </button>
            )}
          </div>

          {/* Granular Selectors: Method, Role, API Family, Search */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            {/* Method Filter */}
            <div>
              <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Request Method
              </label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m === "ALL" ? "All Methods (GET, POST, etc.)" : `${m} Requests`}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            <div>
              <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                User Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* API Endpoint Family Filter */}
            <div>
              <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                API Endpoint Group
              </label>
              <select
                value={selectedApiFamily}
                onChange={(e) => setSelectedApiFamily(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                {API_FAMILIES.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Free-Text Search Input */}
            <div>
              <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Search Logs
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Route, user, email, error, IP..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs font-medium text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Accordion Table Stream */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                API Activity Stream ({logs.length} entries shown)
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Click any row to toggle full diagnostic details
            </span>
          </div>

          {loading ? (
            <div className="grid min-h-[35vh] place-items-center">
              <div className="flex items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                <span>Loading application logs...</span>
              </div>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-16 text-center text-sm font-semibold text-slate-400">
              No API calls or logs found matching your criteria.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log) => {
                const isError = log.action === "APP_ERROR" || log.action === "API_ERROR";
                const meta = log.metadata || {};
                const method = meta.method || log.resourceId?.split(" ")[0] || "GET";
                const route = meta.route || log.resourceId?.split(" ")[1] || log.resourceId || "/";
                const statusCode = meta.statusCode || (isError ? 500 : 200);
                const durationMs = meta.durationMs;
                const role = log.user?.role || meta.role || (log.userId ? "STUDENT" : "ANONYMOUS");
                const userName = log.user?.name || meta.userName || (log.userId ? "User" : "Guest");
                const userEmail = log.user?.email || meta.userEmail || null;
                const isExpanded = expandedRowId === log.id;
                const statusBadge = getStatusBadge(statusCode);

                return (
                  <div
                    key={log.id}
                    className={`transition ${
                      isError
                        ? "bg-rose-50/40 dark:bg-rose-950/20"
                        : isExpanded
                          ? "bg-slate-50/80 dark:bg-slate-800/40"
                          : "hover:bg-slate-50/60 dark:hover:bg-slate-800/30"
                    }`}
                  >
                    {/* Collapsed Scannable Row Header */}
                    <div
                      onClick={() => toggleRow(log.id)}
                      className="flex cursor-pointer select-none items-center justify-between gap-3 p-4 sm:px-6"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        {/* Accordion Chevron */}
                        <div className="shrink-0 text-slate-400">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-blue-600" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>

                        {/* Status Code Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 font-mono text-xs font-black ${statusBadge.cls}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`} />
                          {statusCode}
                        </span>

                        {/* HTTP Method Badge */}
                        <span
                          className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-black ${getMethodBadge(
                            method,
                          )}`}
                        >
                          {method}
                        </span>

                        {/* Endpoint Path */}
                        <span
                          className="truncate font-mono text-xs font-bold text-slate-900 dark:text-white"
                          title={route}
                        >
                          {route}
                        </span>

                        {/* Latency Badge */}
                        {typeof durationMs === "number" && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] ${getLatencyBadge(
                              durationMs,
                            )}`}
                          >
                            <Clock className="h-2.5 w-2.5" />
                            {durationMs}ms
                          </span>
                        )}
                      </div>

                      {/* Right Side Info: User & Timestamp */}
                      <div className="flex shrink-0 items-center gap-3 text-right text-xs">
                        {/* User / Role Pill */}
                        <span className="hidden items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:inline-flex">
                          <UserCheck className="h-3 w-3 text-slate-400" />
                          <span className="max-w-[120px] truncate">{userName}</span>
                          <span className="font-mono text-[9px] uppercase text-slate-400">
                            ({role})
                          </span>
                        </span>

                        {/* Relative / Formatted Time */}
                        <span className="text-[11px] font-medium text-slate-400">
                          {new Date(log.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Accordion Body */}
                    {isExpanded && (
                      <div className="space-y-4 border-t border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                        {/* Section 1: Error Diagnostics if Present */}
                        {(isError || meta.error || meta.message) && (
                          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs dark:border-rose-900/50 dark:bg-rose-950/30">
                            <div className="flex items-center justify-between font-black text-rose-900 dark:text-rose-200">
                              <span className="inline-flex items-center gap-1.5">
                                <AlertTriangle className="h-4 w-4 text-rose-600" />
                                Error Diagnostics
                              </span>
                              {meta.stack && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(meta.stack, `stack-${log.id}`);
                                  }}
                                  className="inline-flex items-center gap-1 rounded bg-rose-200/70 px-2 py-0.5 text-[10px] font-bold text-rose-800 hover:bg-rose-300 dark:bg-rose-900/60 dark:text-rose-200"
                                >
                                  {copiedId === `stack-${log.id}` ? (
                                    <Check className="h-3 w-3" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                  Copy Stack
                                </button>
                              )}
                            </div>
                            <p className="mt-1 font-mono font-bold text-rose-700 dark:text-rose-300">
                              {meta.error || meta.message || "Unknown error encountered"}
                            </p>
                            {meta.stack && (
                              <pre className="mt-2 max-h-48 overflow-x-auto rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-rose-300">
                                {meta.stack}
                              </pre>
                            )}
                          </div>
                        )}

                        {/* Section 2: Request & User Details Grid */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {/* Request Details */}
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs dark:border-slate-800 dark:bg-slate-950">
                            <h4 className="mb-2 flex items-center gap-1.5 font-extrabold text-slate-900 dark:text-white">
                              <Globe className="h-3.5 w-3.5 text-blue-500" />
                              HTTP Request Details
                            </h4>
                            <div className="space-y-1.5 text-[11px]">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Endpoint:</span>
                                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                  {method} {route}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Status:</span>
                                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                  {statusCode}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Execution Latency:</span>
                                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                  {durationMs ?? 0} ms
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Client IP:</span>
                                <span className="font-mono text-slate-600 dark:text-slate-400">
                                  {log.ipAddress || "Unknown"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Exact Timestamp:</span>
                                <span className="text-slate-600 dark:text-slate-400">
                                  {new Date(log.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* User & Authentication Details */}
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs dark:border-slate-800 dark:bg-slate-950">
                            <h4 className="mb-2 flex items-center gap-1.5 font-extrabold text-slate-900 dark:text-white">
                              <UserCheck className="h-3.5 w-3.5 text-indigo-500" />
                              User & Authentication
                            </h4>
                            <div className="space-y-1.5 text-[11px]">
                              <div className="flex justify-between">
                                <span className="text-slate-400">User Name:</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {userName}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Email:</span>
                                <span className="font-mono text-slate-600 dark:text-slate-400">
                                  {userEmail || "None (Unauthenticated)"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Role:</span>
                                <span className="font-mono font-extrabold text-blue-600 dark:text-blue-400">
                                  {role}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">User ID:</span>
                                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                                  {log.userId || "N/A"}
                                </span>
                              </div>
                              {log.organization && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Academy / Org:</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {log.organization.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Section 3: Raw JSON Metadata Payload */}
                        {meta && Object.keys(meta).length > 0 && (
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                                Metadata & Request Payload
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(meta, `meta-${log.id}`);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline dark:text-blue-400"
                              >
                                {copiedId === `meta-${log.id}` ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                                Copy JSON
                              </button>
                            </div>
                            <pre className="max-h-40 overflow-x-auto rounded-xl bg-slate-900 p-3 font-mono text-[10px] text-slate-200">
                              {JSON.stringify(meta, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Clear Logs Modal */}
      <ConfirmModal
        isOpen={showClearModal}
        title="Clear All API & System Logs"
        description="Are you sure you want to permanently clear all application logs? This cannot be undone."
        confirmText="Clear All Logs"
        isLoading={clearing}
        onConfirm={confirmClearLogs}
        onClose={() => setShowClearModal(false)}
      />
    </main>
  );
}
