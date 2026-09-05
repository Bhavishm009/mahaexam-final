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
} from "lucide-react";
import { fetchJson } from "@/lib/api-client";
import ConfirmModal from "@/components/confirm-modal";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [stats, setStats] = useState({
    totalCount: 0,
    errorCount: 0,
    apiCallCount: 0,
    avgLatencyMs: 0,
  });

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== "ALL") {
        params.set("filter", filter);
      }
      if (query) {
        params.set("q", query);
      }

      const { ok, data } = await fetchJson(`/api/admin/logs?${params.toString()}`);
      if (ok && data.success) {
        setLogs(data.logs || []);
        setStats({
          totalCount: data.totalCount || 0,
          errorCount: data.errorCount || 0,
          apiCallCount: data.apiCallCount || 0,
          avgLatencyMs: data.avgLatencyMs || 0,
        });
      } else {
        toast.error(data.error || "Failed to load logs");
      }
    } catch (err) {
      toast.error(err.message || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }, [filter, query]);

  useEffect(() => {
    loadLogs();
  }, [filter, loadLogs]);

  function handleClearLogs() {
    setShowClearModal(true);
  }

  async function confirmClearLogs() {
    setClearing(true);

    try {
      const { ok, data } = await fetchJson("/api/admin/logs", { method: "DELETE" });
      if (ok && data.success) {
        toast.success(data.message || "Logs cleared successfully.");
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
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800";
      case "POST":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800";
      case "PATCH":
      case "PUT":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800";
      case "DELETE":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
    }
  }

  function getStatusBadge(status) {
    if (!status) {return null;}
    if (status >= 200 && status < 300) {
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50";
    }
    if (status >= 400 && status < 500) {
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50";
    }
    return "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50";
  }

  return (
    <main className="min-h-screen space-y-6 font-sans text-slate-900 transition-colors dark:text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300 backdrop-blur-md">
                  <Activity className="h-3.5 w-3.5" />
                  Super Admin API & Diagnostics Dashboard
                </span>
                {stats.errorCount > 0 && (
                  <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-black text-white">
                    {stats.errorCount} {stats.errorCount === 1 ? "Error" : "Errors"}
                  </span>
                )}
              </div>
              <h1 className="mt-3 text-2xl font-black sm:text-3xl">API & System Logs</h1>
              <p className="mt-1 text-xs text-slate-300 sm:text-sm">
                Monitor all API endpoint calls, status codes, response latencies, server errors, and
                security audit logs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={loadLogs}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
              <button
                type="button"
                onClick={handleClearLogs}
                disabled={clearing || stats.totalCount === 0}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-600/80 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-rose-600 active:scale-95 disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear Logs</span>
              </button>
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-2xl bg-white/20 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/30"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
            </div>
          </div>

          {/* Metric Stats Grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-200">
                <Layers className="h-4 w-4 text-blue-400" />
                <span>Total Recorded Logs</span>
              </div>
              <div className="mt-2 text-xl font-black text-white">{stats.totalCount}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-200">
                <Server className="h-4 w-4 text-emerald-400" />
                <span>API Calls Recorded</span>
              </div>
              <div className="mt-2 text-xl font-black text-white">{stats.apiCallCount}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-200">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                <span>Total Errors Logged</span>
              </div>
              <div className="mt-2 text-xl font-black text-white">{stats.errorCount}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-200">
                <Zap className="h-4 w-4 text-amber-400" />
                <span>Avg API Latency</span>
              </div>
              <div className="mt-2 text-xl font-black text-white">{stats.avgLatencyMs} ms</div>
            </div>
          </div>
        </div>



        {/* Filters & Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "ALL", label: "All Logs" },
              { id: "API_CALL", label: "API Calls ⚡" },
              { id: "ERRORS", label: "Errors Only 🚨" },
              { id: "APP_ERROR", label: "App Exceptions" },
              { id: "AUTH_LOGIN", label: "Logins" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  filter === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadLogs();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search route, user, error..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 w-64 rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="h-10 rounded-2xl bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-500 active:scale-95"
            >
              Search
            </button>
          </form>
        </div>

        {/* Logs Table / Stream */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <div className="grid min-h-[40vh] place-items-center">
              <div className="flex items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                <span>Loading application logs...</span>
              </div>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-16 text-center text-sm font-semibold text-slate-400">
              No logs found matching your criteria.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log) => {
                const isError = log.action === "APP_ERROR" || log.action === "API_ERROR";
                const meta = log.metadata || {};
                const method = meta.method;
                const statusCode = meta.statusCode;
                const durationMs = meta.durationMs;

                return (
                  <div
                    key={log.id}
                    className={`p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/40 sm:p-5 ${
                      isError ? "bg-rose-50/40 dark:bg-rose-950/20" : ""
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-black ${
                              isError
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            }`}
                          >
                            {isError ? (
                              <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                            ) : (
                              <Terminal className="h-3.5 w-3.5 text-blue-500" />
                            )}
                            {log.action}
                          </span>

                          {method && (
                            <span
                              className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-extrabold ${getMethodBadge(method)}`}
                            >
                              {method}
                            </span>
                          )}

                          {statusCode && (
                            <span
                              className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-extrabold ${getStatusBadge(statusCode)}`}
                            >
                              {statusCode}
                            </span>
                          )}

                          {typeof durationMs === "number" && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              <Clock className="h-3 w-3 text-slate-400" />
                              {durationMs}ms
                            </span>
                          )}

                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {log.resourceId || log.resourceType}
                          </span>
                        </div>

                        {/* Description / User details */}
                        <div className="text-xs text-slate-700 dark:text-slate-300">
                          {log.user ? (
                            <span>
                              User:{" "}
                              <strong className="text-slate-900 dark:text-white">
                                {log.user.name}
                              </strong>{" "}
                              ({log.user.email} · {log.user.role})
                            </span>
                          ) : (
                            <span className="text-slate-400">System / Anonymous</span>
                          )}
                          {log.organization ? ` • ${log.organization.name}` : ""}
                        </div>

                        {/* Error Message if present */}
                        {(meta.message || meta.error) && (
                          <div className="mt-1 text-xs font-bold text-rose-800 dark:text-rose-300">
                            Error: {meta.message || meta.error}
                          </div>
                        )}

                        {/* Stack trace preview */}
                        {meta.stack && (
                          <pre className="mt-2 max-h-32 overflow-x-auto rounded-xl bg-slate-900 p-3 font-mono text-[11px] text-rose-300">
                            {meta.stack}
                          </pre>
                        )}
                      </div>

                      <div className="shrink-0 text-right text-[11px] text-slate-400">
                        <div>{new Date(log.createdAt).toLocaleString()}</div>
                        {log.ipAddress && (
                          <div className="font-mono text-[10px] text-slate-400">
                            IP: {log.ipAddress}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expandable JSON Metadata Payload */}
                    {log.metadata &&
                      Object.keys(log.metadata).length > 0 &&
                      !log.metadata.stack && (
                        <details className="mt-2 text-[11px]">
                          <summary className="cursor-pointer font-bold text-blue-600 hover:underline dark:text-blue-400">
                            View details payload
                          </summary>
                          <pre className="mt-1 overflow-x-auto rounded-xl bg-slate-100 p-2.5 font-mono text-[10px] text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
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
        title="Clear System Logs"
        description="Are you sure you want to clear ALL application and API audit logs? This action cannot be undone."
        confirmText="Clear All Logs"
        isLoading={clearing}
        onConfirm={confirmClearLogs}
        onClose={() => setShowClearModal(false)}
      />
    </main>
  );
}
