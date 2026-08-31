"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Search, Terminal, Activity, ArrowLeft } from "lucide-react";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [errorCount, setErrorCount] = useState(0);

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

      const r = await fetch(`/api/admin/logs?${params.toString()}`);
      if (r.ok) {
        const d = await r.json();
        setLogs(d.logs || []);
        setErrorCount(d.errorCount || 0);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [filter, query]);

  useEffect(() => {
    loadLogs();
  }, [filter, loadLogs]);

  return (
    <main className="min-h-screen space-y-6 font-sans text-slate-900 transition-colors dark:text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-300 backdrop-blur-md">
                  <Activity className="h-3.5 w-3.5" />
                  Live Diagnostics & Error Monitor
                </span>
                {errorCount > 0 && (
                  <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-black text-white">
                    {errorCount} {errorCount === 1 ? "Error" : "Errors"}
                  </span>
                )}
              </div>
              <h1 className="mt-3 text-2xl font-black sm:text-3xl">System & Error Logs</h1>
              <p className="mt-1 text-xs text-slate-300 sm:text-sm">
                Monitor user runtime exceptions, API errors, test activity, and security audit logs
                in real time.
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
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-2xl bg-white/20 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/30"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Admin Dashboard</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "ALL", label: "All Logs" },
              { id: "ERRORS", label: "Errors Only 🚨" },
              { id: "AUTH_LOGIN", label: "Logins" },
              { id: "EXAM_SUBMIT", label: "Exam Submissions" },
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
                placeholder="Search action, user, route..."
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
                const isError = log.action === "APP_ERROR";
                return (
                  <div
                    key={log.id}
                    className={`p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/40 sm:p-5 ${
                      isError ? "bg-rose-50/50 dark:bg-rose-950/20" : ""
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-black ${
                              isError
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                            }`}
                          >
                            {isError ? (
                              <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                            ) : (
                              <Terminal className="h-3.5 w-3.5 text-blue-500" />
                            )}
                            {log.action}
                          </span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {log.resourceType}
                          </span>
                          {log.resourceId && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              {log.resourceId}
                            </span>
                          )}
                        </div>

                        {/* Error or Activity description */}
                        {isError ? (
                          <div className="text-sm font-bold text-rose-900 dark:text-rose-200">
                            {log.metadata?.message || "Unknown Application Error"}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-700 dark:text-slate-300">
                            {log.user
                              ? `${log.user.name} (${log.user.email} - ${log.user.role})`
                              : "System/Anonymous"}
                            {log.organization ? ` • ${log.organization.name}` : ""}
                          </div>
                        )}

                        {/* Stack trace preview if present */}
                        {log.metadata?.stack && (
                          <pre className="mt-2 max-h-32 overflow-x-auto rounded-xl bg-slate-900 p-3 font-mono text-[11px] text-rose-300">
                            {log.metadata.stack}
                          </pre>
                        )}
                      </div>

                      <div className="shrink-0 text-right text-[11px] text-slate-400">
                        <div>{new Date(log.createdAt).toLocaleString()}</div>
                        {log.ipAddress && (
                          <div className="font-mono text-[10px]">IP: {log.ipAddress}</div>
                        )}
                      </div>
                    </div>

                    {/* Expandable JSON Metadata */}
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
    </main>
  );
}
