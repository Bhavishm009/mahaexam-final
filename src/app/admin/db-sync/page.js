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
  AlertOctagon,
  BellRing,
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

  // 2. Fetch Schema Alignment Status (PostgreSQL Information Schema)
  const { data: schemaData, refetch: refetchSchema } = useQuery({
    queryKey: ["db-schema-status"],
    queryFn: async () => {
      const res = await fetch("/api/admin/db-sync/schema");
      if (!res.ok) return null;
      return await res.json();
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const [aligningSchema, setAligningSchema] = useState(false);
  async function handleAlignSchema() {
    setAligningSchema(true);
    try {
      const res = await fetch("/api/admin/db-sync/schema", { method: "POST" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Alignment failed");
      toast.success(json.message);
      await refetchSchema();
      await handleForceRecheck();
    } catch (e) {
      toast.error("Schema alignment failed: " + e.message);
    } finally {
      setAligningSchema(false);
    }
  }

  // 3. Single-Table Data Sync Handler
  const [syncingTable, setSyncingTable] = useState(null);
  async function handleSyncTable(tableKey, label) {
    setSyncingTable(tableKey);
    try {
      const res = await fetch(`/api/admin/db-sync?table=${tableKey}`, { method: "POST" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Table sync failed");
      toast.success(json.message || `Table '${label}' synchronized successfully!`);
      await queryClient.invalidateQueries({ queryKey: ["db-sync-status"] });
      await handleForceRecheck();
    } catch (err) {
      toast.error(`Sync failed for ${label}: ${err.message}`);
    } finally {
      setSyncingTable(null);
    }
  }

  // 4. Single-Table Schema Migration Handler
  const [aligningTable, setAligningTable] = useState(null);
  async function handleAlignSingleTableSchema(tableName) {
    setAligningTable(tableName);
    try {
      const res = await fetch(`/api/admin/db-sync/schema?table=${tableName}`, { method: "POST" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Schema migration failed");
      toast.success(json.message || `Schema aligned for '${tableName}'!`);
      await refetchSchema();
      await handleForceRecheck();
    } catch (e) {
      toast.error("Schema migration failed: " + e.message);
    } finally {
      setAligningTable(null);
    }
  }

  // 5. Setup Realtime SSE Listener
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
  const failover = data?.failoverIncident;
  const isFailoverActive = failover?.isFailoverActive || (primary && !primary.connected);
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
  const isBusy = isLoading || isFetching || rechecking || syncing;

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
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
                  Database Sync & Live Health Monitor 🗄️
                </h1>
                {isFailoverActive ? (
                  <span className="inline-flex animate-pulse items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                    <Activity className="h-3 w-3 text-rose-600" />
                    Failover Active (Supabase)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                    <Zap className="h-3 w-3 text-amber-500" />
                    Instant Cache (1h)
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Primary (Aiven) & Secondary Failover (Supabase Shadow DB) status •{" "}
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {isBusy ? (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Checking database status...
                    </span>
                  ) : (
                    `Last Checked: ${formatTimeAgo(data?.cachedAt || data?.timestamp)}`
                  )}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleForceRecheck}
            disabled={isBusy}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/60"
          >
            <RefreshCw className={`h-4 w-4 ${isBusy ? "animate-spin text-blue-600" : ""}`} />
            Re-check Status Now
          </button>

          <button
            onClick={handleTriggerSync}
            disabled={isBusy || isFailoverActive}
            title={
              isFailoverActive ? "Cannot sync while Primary DB is offline" : "Synchronize databases"
            }
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
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

      {/* Critical Failover Incident Banner (Rendered when Primary DB is Down) */}
      {isFailoverActive && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-rose-500/80 bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-amber-500/10 p-6 shadow-xl shadow-rose-500/10 dark:from-rose-950/50 dark:via-slate-900 dark:to-amber-950/20">
          <div className="flex flex-col gap-4 border-b border-rose-200/80 pb-5 dark:border-rose-900/60 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="grid h-12 w-12 shrink-0 animate-pulse place-items-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/30">
                <AlertOctagon className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-base font-black text-rose-950 dark:text-rose-200 sm:text-lg">
                    🚨 CRITICAL INCIDENT: PRIMARY DATABASE OFFLINE
                  </h2>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-0.5 text-xs font-black text-white shadow-sm">
                    <Activity className="h-3.5 w-3.5 animate-spin" />
                    FAILOVER ACTIVE
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold text-rose-800 dark:text-rose-300">
                  Primary Aiven Database is unreachable. All read & write operations have seamlessly
                  failed over to Secondary Database (Supabase IPv4 Pooler) with zero downtime.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-xs font-bold text-rose-700 shadow-sm dark:border-rose-900 dark:bg-slate-900 dark:text-rose-300">
                <BellRing className="h-3.5 w-3.5 text-rose-600" />
                Super Admin Notified Instantly
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-rose-200/80 bg-white/80 p-3.5 backdrop-blur dark:border-rose-900/50 dark:bg-slate-900/80">
              <span className="text-[11px] font-bold text-slate-400">Incident Detected:</span>
              <p className="mt-1 font-mono font-bold text-slate-800 dark:text-slate-200">
                {failover?.startedAt
                  ? new Date(failover.startedAt).toLocaleTimeString()
                  : "Just now"}
                <span className="ml-1 text-[11px] font-normal text-slate-500">
                  ({formatTimeAgo(failover?.startedAt)})
                </span>
              </p>
            </div>

            <div className="rounded-2xl border border-rose-200/80 bg-white/80 p-3.5 backdrop-blur dark:border-rose-900/50 dark:bg-slate-900/80">
              <span className="text-[11px] font-bold text-slate-400">Active Serving Host:</span>
              <p className="mt-1 truncate font-mono font-bold text-purple-700 dark:text-purple-300">
                {failover?.targetHost || "aws-0-ap-south-1.pooler.supabase.com"}
              </p>
            </div>

            <div className="rounded-2xl border border-rose-200/80 bg-white/80 p-3.5 backdrop-blur dark:border-rose-900/50 dark:bg-slate-900/80">
              <span className="text-[11px] font-bold text-slate-400">Failover Strategy:</span>
              <p className="mt-1 font-bold text-emerald-600 dark:text-emerald-400">
                Zero-Downtime Smart Proxy
              </p>
            </div>

            <div className="rounded-2xl border border-rose-200/80 bg-white/80 p-3.5 backdrop-blur dark:border-rose-900/50 dark:bg-slate-900/80">
              <span className="text-[11px] font-bold text-slate-400">Super Admin Alert:</span>
              <p className="mt-1 truncate font-bold text-rose-600 dark:text-rose-400">
                bhavishm009@gmail.com
              </p>
            </div>
          </div>

          {failover?.reason && (
            <div className="mt-3 rounded-xl bg-rose-100/80 p-3 font-mono text-[11px] text-rose-900 dark:bg-rose-950/60 dark:text-rose-200">
              <span className="font-bold">Error Detail: </span>
              <span className="break-all">{failover.reason}</span>
            </div>
          )}
        </div>
      )}

      {/* Sync Status Alert */}
      {isBusy ? (
        <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50/80 p-4 text-xs font-bold text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200">
          <RefreshCw className="h-5 w-5 shrink-0 animate-spin text-blue-600 dark:text-blue-400" />
          <div>
            <p className="font-extrabold text-blue-950 dark:text-blue-200">
              {syncing ? "Synchronizing Databases..." : "Checking Database Health & Sync Status..."}
            </p>
            <p className="font-medium text-blue-800 dark:text-blue-300">
              {syncing
                ? "Mirroring records between Primary (Aiven) and Secondary (Supabase) databases..."
                : "Pinging hosts and computing live record counts..."}
            </p>
          </div>
        </div>
      ) : isFailoverActive ? (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-bold text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-extrabold">
                Failover Active: Secondary Database Preserving System Data 🛡️
              </p>
              <p className="font-medium text-rose-800 dark:text-rose-300">
                All mock tests, exams, student attempts, and user registrations are safely running
                on Supabase Shadow DB.
              </p>
            </div>
          </div>
        </div>
      ) : failover?.lastRecoveredAt ? (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-300 bg-emerald-50/90 p-4 text-xs font-bold text-emerald-950 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="font-extrabold">Primary Database Restored & Operational 🟢</p>
              <p className="font-medium text-emerald-800 dark:text-emerald-300">
                Primary Database (Aiven) connection recovered at{" "}
                {new Date(failover.lastRecoveredAt).toLocaleTimeString()} (
                {formatTimeAgo(failover.lastRecoveredAt)}). All queries have safely returned to
                Primary Master DB.
              </p>
            </div>
          </div>
        </div>
      ) : !data?.isSynced ? (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs font-bold text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-extrabold">Data Sync Required</p>
              <p className="font-medium text-amber-800 dark:text-amber-300">
                Some records in Secondary Shadow DB are out of sync. Click &apos;Sync Now&apos;
                above.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs font-bold text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="font-extrabold">Databases Fully Synchronized 🟢</p>
              <p className="font-medium text-emerald-800 dark:text-emerald-300">
                All primary and secondary shadow database records match perfectly.
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

            {isBusy ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-extrabold text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-600 dark:text-blue-400" />
                Checking...
              </span>
            ) : primary?.connected ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Active (Online)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-extrabold text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                Offline (Connection Failed)
              </span>
            )}
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
              <p
                className={`mt-0.5 font-mono font-bold ${primary?.connected ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
              >
                {isBusy
                  ? "Checking..."
                  : primary?.connected
                    ? `${primary.latencyMs} ms`
                    : "Unreachable"}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Failover Role:</span>
              <p
                className={`mt-0.5 font-bold ${primary?.connected ? "text-blue-600 dark:text-blue-400" : "text-rose-600 dark:text-rose-400"}`}
              >
                {primary?.connected ? "Primary Active Master" : "Master Offline (Failed)"}
              </p>
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
                <p className="text-[11px] font-semibold text-slate-400">
                  Automatic Failover Target
                </p>
              </div>
            </div>

            {isBusy ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-extrabold text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-600 dark:text-blue-400" />
                Checking...
              </span>
            ) : secondary?.connected ? (
              isFailoverActive ? (
                <span className="inline-flex animate-pulse items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-extrabold text-white shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  Active (Serving Live Traffic)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Standby (Ready)
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-extrabold text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                Offline
              </span>
            )}
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
                {isBusy
                  ? "Checking..."
                  : secondary?.latencyMs
                    ? `${secondary.latencyMs} ms`
                    : "N/A"}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Failover Role:</span>
              <p
                className={`mt-0.5 font-bold ${isFailoverActive ? "font-extrabold text-emerald-600 dark:text-emerald-400" : "text-purple-600 dark:text-purple-400"}`}
              >
                {isFailoverActive ? "Active Failover Primary ⚡" : "Shadow Mirror Backup"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schema & Migration Alignment Status Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`grid h-10 w-10 place-items-center rounded-2xl ${schemaData?.isSchemaAligned ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400" : "bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400"}`}
            >
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Database Schema & Migration Parity (DDL)
                </h3>
                {schemaData?.isSchemaAligned ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" /> 100% Aligned
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                    <AlertTriangle className="h-3 w-3" /> Alignment Required
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {schemaData?.message || "Inspecting PostgreSQL information_schema..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!schemaData?.isSchemaAligned && (
              <button
                onClick={handleAlignSchema}
                disabled={aligningSchema}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-amber-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${aligningSchema ? "animate-spin" : ""}`} />
                {aligningSchema ? "Aligning..." : "Align Schema Now"}
              </button>
            )}
            <button
              onClick={() => refetchSchema()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RefreshCw className="h-3 w-3" /> Re-Check Schema
            </button>
          </div>
        </div>

        {schemaData && !schemaData.isSchemaAligned && schemaData.missingColumns?.length > 0 && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            <p className="font-extrabold">Missing Columns on Secondary DB:</p>
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-[11px]">
              {schemaData.missingColumns.map((c, i) => (
                <li key={i}>
                  Table <strong className="font-mono">{c.table}</strong> missing column{" "}
                  <strong className="font-mono text-amber-700 dark:text-amber-400">
                    {c.column}
                  </strong>{" "}
                  ({c.dataType})
                </li>
              ))}
            </ul>
          </div>
        )}
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
                <th className="px-6 py-3.5">Sync Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tableRows.map((row) => {
                const hasP = typeof row.p === "number";
                const hasS = typeof row.s === "number";
                const countMatch = hasP && hasS && row.p === row.s;
                const countDiff = hasP && hasS ? row.p - row.s : 0;

                // Check for per-table schema divergence
                const tableKeyLower = row.key.toLowerCase();
                const schemaIssue =
                  schemaData?.byTable?.[tableKeyLower] ||
                  schemaData?.byTable?.[row.label.toLowerCase()] ||
                  null;
                const hasSchemaMismatch = !!schemaIssue && schemaIssue.missingColumns?.length > 0;
                const isRowOutdated = !countMatch || hasSchemaMismatch;

                return (
                  <tr
                    key={row.key}
                    className={
                      isRowOutdated
                        ? "border-l-4 border-l-amber-500 bg-amber-50/70 transition-colors hover:bg-amber-100/60 dark:bg-amber-950/25 dark:hover:bg-amber-950/40"
                        : "transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                    }
                  >
                    <td className="px-6 py-4 font-extrabold text-slate-900 dark:text-white">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span>{row.label}</span>
                          <span className="font-mono text-[10px] font-normal text-slate-400">
                            ({row.key})
                          </span>
                        </div>
                        {hasSchemaMismatch && (
                          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded bg-amber-200/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                              <AlertTriangle className="h-2.5 w-2.5" />
                              Missing {schemaIssue.missingColumns.length} column(s):{" "}
                              {schemaIssue.missingColumns.map((c) => c.column).join(", ")}
                            </span>
                            <button
                              onClick={() => handleAlignSingleTableSchema(schemaIssue.table)}
                              disabled={aligningTable === schemaIssue.table}
                              className="inline-flex items-center gap-1 rounded bg-amber-600 px-2 py-0.5 text-[10px] font-extrabold text-white hover:bg-amber-700 disabled:opacity-50"
                            >
                              <RefreshCw
                                className={`h-2.5 w-2.5 ${aligningTable === schemaIssue.table ? "animate-spin" : ""}`}
                              />
                              {aligningTable === schemaIssue.table
                                ? "Migrating..."
                                : "Migrate Schema"}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {isBusy ? (
                        <span className="animate-pulse font-medium text-slate-400">
                          Checking...
                        </span>
                      ) : hasP ? (
                        <div className="flex items-center gap-2">
                          <span>{row.p.toLocaleString()}</span>
                          {!countMatch && countDiff > 0 && (
                            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
                              +{countDiff.toLocaleString()}
                            </span>
                          )}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                      {isBusy ? (
                        <span className="animate-pulse font-medium text-slate-400">
                          Checking...
                        </span>
                      ) : hasS ? (
                        <div className="flex items-center gap-2">
                          <span>{row.s.toLocaleString()}</span>
                          {!countMatch && countDiff < 0 && (
                            <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-800 dark:bg-purple-950/80 dark:text-purple-300">
                              +{Math.abs(countDiff).toLocaleString()}
                            </span>
                          )}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isBusy ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                          <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                          Checking...
                        </span>
                      ) : countMatch && !hasSchemaMismatch ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          In Sync
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-extrabold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {!countMatch ? "Records Out of Sync" : "Schema Out of Sync"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleSyncTable(row.key, row.label)}
                        disabled={isBusy || syncingTable === row.key}
                        className={`shadow-xs inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                          isRowOutdated
                            ? "bg-amber-600 text-white shadow-sm hover:bg-amber-700"
                            : "border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        } disabled:opacity-50`}
                        title={`Sync records for ${row.label}`}
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${syncingTable === row.key ? "animate-spin" : ""}`}
                        />
                        {syncingTable === row.key
                          ? "Syncing..."
                          : isRowOutdated
                            ? "Retry Sync"
                            : "Sync Table"}
                      </button>
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
