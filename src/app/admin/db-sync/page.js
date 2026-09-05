"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  Layers,
  Radio,
  ArrowLeftRight,
  XCircle,
  Activity,
} from "lucide-react";

export default function DatabaseSyncPage() {
  const queryClient = useQueryClient();
  const [realtimeStatus, setRealtimeStatus] = useState("Connecting...");

  // 1. Fetch DB Status using TanStack React Query (Loads INSTANTLY from hourly cache)
  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["db-sync-status"],
    queryFn: async () => {
      const res = await fetch("/api/admin/db-sync");
      if (!res.ok) throw new Error("Failed to fetch database health status");
      return await res.json();
    },
    staleTime: 60 * 60 * 1000, // 1 hour stale time for instant loads
    refetchOnWindowFocus: false,
  });

  // Force a fresh live re-check from Primary & Secondary DBs
  const [rechecking, setRechecking] = useState(false);
  async function handleForceRecheck() {
    setRechecking(true);
    try {
      const res = await fetch("/api/admin/db-sync?refresh=true");
      if (!res.ok) throw new Error("Re-check failed");
      const json = await res.json();
      queryClient.setQueryData(["db-sync-status"], json);
      toast.success("Database status re-checked & cache updated!");
    } catch (err) {
      toast.error(`Re-check failed: ${err.message}`);
    } finally {
      setRechecking(false);
    }
  }

  // 2. Setup Realtime SSE Listener
  useEffect(() => {
    let eventSource;
    try {
      eventSource = new EventSource("/api/realtime");
      eventSource.addEventListener("connected", () => {
        setRealtimeStatus("Live SSE Active 🟢");
      });

      eventSource.addEventListener("heartbeat", (e) => {
        setRealtimeStatus("Live SSE Active 🟢");
      });

      eventSource.onerror = () => {
        setRealtimeStatus("Polling Mode 🔄");
        eventSource?.close();
      };
    } catch (err) {
      setRealtimeStatus("Polling Mode 🔄");
    }

    return () => {
      eventSource?.close();
    };
  }, []);

  // 3. Database Sync Mutation with Promise Toast & Optimistic Updates
  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/db-sync", { method: "POST" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Database sync failed");
      return json;
    },
    onMutate: async () => {
      // Optimistically update status banner
      await queryClient.cancelQueries({ queryKey: ["db-sync-status"] });
      const previousData = queryClient.getQueryData(["db-sync-status"]);

      queryClient.setQueryData(["db-sync-status"], (old) => ({
        ...old,
        isSynced: true,
        primaryStatus: { ...old?.primaryStatus, connected: true },
        secondaryStatus: { ...old?.secondaryStatus, connected: true },
      }));

      return { previousData };
    },
    onError: (err, newSync, context) => {
      // Rollback to previous state on error
      if (context?.previousData) {
        queryClient.setQueryData(["db-sync-status"], context.previousData);
      }
    },
    onSettled: (data) => {
      if (data?.status) {
        queryClient.setQueryData(["db-sync-status"], data.status);
      } else {
        queryClient.invalidateQueries({ queryKey: ["db-sync-status"] });
      }
    },
  });

  function handleTriggerSync() {
    toast.promise(syncMutation.mutateAsync(), {
      loading: "Synchronizing Primary (Aiven) and Secondary (Supabase) databases...",
      success: (data) => data.message || "Database synchronization completed!",
      error: (err) => `Sync failed: ${err.message}`,
    });
  }

  function formatTimeAgo(isoString) {
    if (!isoString) return "Just now";
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins === 1) return "1 minute ago";
    if (mins < 60) return `${mins} minutes ago`;
    const hours = Math.floor(mins / 60);
    if (hours === 1) return "1 hour ago";
    return `${hours} hours ago`;
  }

  const primary = data?.primaryStatus;
  const secondary = data?.secondaryStatus;
  const pCounts = data?.primaryCounts || {};
  const sCounts = data?.secondaryCounts || {};

  const tablesList = data?.tables || [
    { key: "organization", label: "Organizations" },
    { key: "user", label: "Users" },
    { key: "studentProfile", label: "Student Profiles" },
    { key: "teacherProfile", label: "Teacher Profiles" },
    { key: "subscriptionPlan", label: "Subscription Plans" },
    { key: "coachingSubscription", label: "Coaching Subscriptions" },
    { key: "batch", label: "Batches" },
    { key: "coachingBatch", label: "Coaching Batches" },
    { key: "batchMembership", label: "Batch Memberships" },
    { key: "subject", label: "Subjects" },
    { key: "chapter", label: "Chapters" },
    { key: "topic", label: "Topics" },
    { key: "question", label: "Questions" },
    { key: "questionOption", label: "Question Options" },
    { key: "questionTag", label: "Question Tags" },
    { key: "exam", label: "Exams" },
    { key: "examQuestion", label: "Exam Questions" },
    { key: "examBatch", label: "Exam Batches" },
    { key: "examAttempt", label: "Exam Attempts" },
    { key: "attemptQuestion", label: "Attempt Questions" },
    { key: "attemptAnswer", label: "Attempt Answers" },
    { key: "examResult", label: "Exam Results" },
    { key: "jobAlert", label: "Job Notifications & Alerts" },
    { key: "blogPost", label: "Blog Posts" },
    { key: "seoSetting", label: "SEO Settings" },
    { key: "auditLog", label: "Audit Logs" },
    { key: "notification", label: "Notifications" },
    { key: "payment", label: "Payments" },
    { key: "paymentOrder", label: "Payment Orders" },
    { key: "job", label: "Background Queue Jobs" },
    { key: "passkeyCredential", label: "Passkey Credentials" },
  ];

  const tableRows = tablesList.map(({ key, label }) => ({
    key,
    label,
    p: pCounts[key] ?? null,
    s: sCounts[key] ?? null,
  }));

  const syncing = syncMutation.isPending;

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:p-8">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 font-black text-white shadow-md shadow-blue-500/20">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
                  Database Sync & Live Health Monitor 🗄️
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  <Zap className="h-3 w-3 text-amber-500" />
                  Instant Cache (1h)
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Primary (Aiven) & Secondary Failover (Supabase Shadow DB) status •{" "}
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  Last Checked: {formatTimeAgo(data?.cachedAt || data?.timestamp)}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleForceRecheck}
            disabled={rechecking || isFetching}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/60"
          >
            <RefreshCw className={`h-4 w-4 ${rechecking || isFetching ? "animate-spin text-blue-600" : ""}`} />
            Re-check Status Now
          </button>

          <button
            onClick={handleTriggerSync}
            disabled={syncing}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
          >
            {syncing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowLeftRight className="h-4 w-4" />
            )}
            Sync Now
          </button>
        </div>
      </div>

      {/* Sync Status Alert */}
      {!data?.isSynced && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs font-bold text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-extrabold">Data Sync Required</p>
              <p className="font-medium text-amber-800 dark:text-amber-300">
                Some records in Secondary Shadow DB are out of sync. Click &apos;Sync Now&apos; above.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Primary & Secondary Health Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Primary DB Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Primary Database (Aiven PostgreSQL)
                </h3>
                <p className="text-[11px] font-semibold text-slate-400">Main Production DB</p>
              </div>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${
                primary?.connected
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                  : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
              }`}
            >
              {primary?.connected ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Active (Online)
                </>
              ) : (
                <>
                  <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                  Offline (Error)
                </>
              )}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400">Connection Host:</span>
              <p className="mt-0.5 truncate font-mono font-bold text-slate-700 dark:text-slate-300">
                {primary?.host || "exam-kids.i.aivencloud.com"}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Ping Latency:</span>
              <p className="mt-0.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {primary?.latencyMs ? `${primary.latencyMs} ms` : "N/A"}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Failover Role:</span>
              <p className="mt-0.5 font-bold text-blue-600 dark:text-blue-400">Primary Active Master</p>
            </div>
          </div>
        </div>

        {/* Secondary DB Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-950/80 dark:text-purple-400">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Secondary Shadow DB (Supabase IPv4 Pooler)
                </h3>
                <p className="text-[11px] font-semibold text-slate-400">Automatic Failover Target</p>
              </div>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${
                secondary?.connected
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                  : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
              }`}
            >
              {secondary?.connected ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Standby (Ready)
                </>
              ) : (
                <>
                  <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                  Offline
                </>
              )}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400">Connection Host:</span>
              <p className="mt-0.5 truncate font-mono font-bold text-slate-700 dark:text-slate-300">
                {secondary?.host || "aws-0-ap-south-1.pooler.supabase.com"}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Ping Latency:</span>
              <p className="mt-0.5 font-mono font-bold text-purple-600 dark:text-purple-400">
                {secondary?.latencyMs ? `${secondary.latencyMs} ms` : "N/A"}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Failover Role:</span>
              <p className="mt-0.5 font-bold text-purple-600 dark:text-purple-400">Shadow Mirror Backup</p>
            </div>
          </div>
        </div>
      </div>

      {/* Record Comparison Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Table Record Count Comparison
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3.5">Table Name</th>
                <th className="px-6 py-3.5">Primary Aiven DB Count</th>
                <th className="px-6 py-3.5">Secondary Supabase Count</th>
                <th className="px-6 py-3.5 text-right">Sync Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tableRows.map((row) => {
                const hasP = typeof row.p === "number";
                const hasS = typeof row.s === "number";
                const match = hasP && hasS && row.p === row.s;
                const isError = !hasP || !hasS;

                return (
                  <tr key={row.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-extrabold text-slate-900 dark:text-white">
                      {row.label}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {hasP ? row.p.toLocaleString() : "—"}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                      {hasS ? row.s.toLocaleString() : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isError ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-extrabold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          Connecting...
                        </span>
                      ) : match ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          In Sync
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-extrabold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Sync Needed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
