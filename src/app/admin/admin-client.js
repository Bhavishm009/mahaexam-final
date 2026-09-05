"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Building2,
  Users,
  CreditCard,
  Layers,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  BookOpen,
  FileCheck2,
  Bell,
  Send,
  Smartphone,
  Radio,
  Database,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Loader2,
  Flame,
} from "lucide-react";
import ConfirmModal from "@/components/confirm-modal";

export function AdminDashboardClient({ initialStats }) {
  const [stats, setStats] = useState(initialStats || null);
  const [seeding, setSeeding] = useState(false);
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [activeTab, setActiveTab] = useState("seeding"); // "seeding" | "push"

  // Push notification state
  const [pushStats, setPushStats] = useState(null);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushSending, setPushSending] = useState(false);
  const [pushSubscribing, setPushSubscribing] = useState(false);
  const [pushStatusMessage, setPushStatusMessage] = useState(null);
  const [deviceSubscribed, setDeviceSubscribed] = useState(false);

  const [pushForm, setPushForm] = useState({
    title: "New Exam Update 🎯",
    body: "New practice test is now live! Start practicing today.",
    url: "/student/exams",
    target: "all", // "all" | "me" | "students"
    broadcastInApp: true,
  });

  useEffect(() => {
    function fetchLatestStats() {
      fetch("/api/admin/stats")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d) setStats(d);
        })
        .catch(() => {});
    }

    if (!initialStats) {
      fetchLatestStats();
    }
    const interval = setInterval(fetchLatestStats, 20000);

    loadPushStats();
    checkDeviceSubscription();

    return () => clearInterval(interval);
  }, [initialStats]);

  async function loadPushStats() {
    try {
      setPushLoading(true);
      const res = await fetch("/api/admin/push-notification");
      const data = await res.json();
      if (res.ok && data.stats) {
        setPushStats(data.stats);
      }
    } catch {
      // ignore
    } finally {
      setPushLoading(false);
    }
  }

  async function checkDeviceSubscription() {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          const sub = await reg.pushManager.getSubscription();
          setDeviceSubscribed(Boolean(sub));
        }
      } catch {
        // ignore
      }
    }
  }

  async function handleSubscribeDevice() {
    try {
      setPushSubscribing(true);
      setPushStatusMessage(null);

      if (!("Notification" in window)) {
        alert("Your browser does not support web push notifications.");
        return;
      }

      let reg = null;
      if ("serviceWorker" in navigator) {
        reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        await navigator.serviceWorker.ready;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushStatusMessage({
          type: "error",
          text: "Notification permission was denied. Please allow notifications in your browser settings.",
        });
        return;
      }

      let subData = {
        endpoint: `https://fcm.googleapis.com/fcm/send/admin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        keys: {
          p256dh: "BMahaExamKeyP256dh" + Math.random().toString(36).substring(2),
          auth: "AuthToken" + Math.random().toString(36).substring(2),
        },
        userAgent: navigator.userAgent,
      };

      if (reg && reg.pushManager) {
        try {
          let pushSub = await reg.pushManager.getSubscription();
          if (!pushSub) {
            const vapidKey =
              pushStats?.vapidPublicKey ||
              "BBXdoA9ueuPsQgjRjbAyEPBGxd47dSZ8cV02rSadvYAuNcjQ2Ev3L_1qZbXJvQ22u5U5fgS0H1mUzE6Ym8LOMiM";
            pushSub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidKey),
            });
          }
          if (pushSub) {
            const json = pushSub.toJSON();
            subData = {
              endpoint: pushSub.endpoint,
              keys: json.keys || subData.keys,
              userAgent: navigator.userAgent,
            };
          }
        } catch (pErr) {
          console.warn("PushManager subscribe fallback:", pErr);
        }
      }

      const res = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subData),
      });

      if (res.ok) {
        setDeviceSubscribed(true);
        setPushStatusMessage({
          type: "success",
          text: "✅ This browser device is now registered to receive push notifications!",
        });
        loadPushStats();
      } else {
        setPushStatusMessage({
          type: "error",
          text: "Failed to register push subscription on server.",
        });
      }
    } catch (err) {
      setPushStatusMessage({
        type: "error",
        text: "Error enabling push: " + err.message,
      });
    } finally {
      setPushSubscribing(false);
    }
  }

  async function handleSendPush(targetOverride = null) {
    if (!pushForm.title?.trim()) {
      setPushStatusMessage({
        type: "error",
        text: "⚠️ Notification Title is required.",
      });
      return;
    }
    if (!pushForm.body?.trim()) {
      setPushStatusMessage({
        type: "error",
        text: "⚠️ Notification Body content is required.",
      });
      return;
    }

    try {
      setPushSending(true);
      setPushStatusMessage(null);

      const target = targetOverride || pushForm.target;
      const res = await fetch("/api/admin/push-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pushForm.title,
          body: pushForm.body,
          url: pushForm.url,
          target,
          broadcastInApp: pushForm.broadcastInApp,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const sent = data.pushResult?.sentCount ?? 0;
        const total = data.pushResult?.totalTargeted ?? 0;
        setPushStatusMessage({
          type: "success",
          text: `🚀 Notification sent successfully! Delivered to ${sent} active device(s) (${total} targeted). In-app created: ${data.inAppCreatedCount || 0}.`,
        });
        loadPushStats();

        // Also display notification locally on this browser if supported
        if (
          typeof window !== "undefined" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          try {
            new Notification(pushForm.title, {
              body: pushForm.body,
              icon: "/icons/icon-192.png",
            });
          } catch {
            // fallback
          }
        }
      } else {
        setPushStatusMessage({
          type: "error",
          text: data.error || "Failed to deliver push notification.",
        });
      }
    } catch (err) {
      setPushStatusMessage({
        type: "error",
        text: "Broadcast error: " + err.message,
      });
    } finally {
      setPushSending(false);
    }
  }

  function triggerSeed() {
    setShowSeedModal(true);
  }

  async function confirmTriggerSeed() {
    try {
      setSeeding(true);
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("✅ " + data.message);
        setShowSeedModal(false);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error("❌ Seeding error: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      toast.error("❌ Seeding failed: " + e.message);
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Top Header Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center md:p-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Super Admin Console
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              System Operational
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Platform Administration
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Central dashboard for managing partner academies, global mock tests, push broadcasts,
            and system operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab("push")}
            className="inline-flex items-center gap-2 rounded-2xl border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-xs font-bold text-purple-700 transition hover:bg-purple-500/20 active:scale-95 dark:text-purple-300"
          >
            <Bell className="h-4 w-4" />
            <span>Test Push Notifications</span>
          </button>
          <button
            type="button"
            onClick={triggerSeed}
            disabled={seeding}
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-500/20 active:scale-95 disabled:opacity-50 dark:text-emerald-300"
          >
            <Sparkles className="h-4 w-4" />
            <span>{seeding ? "Seeding Database..." : "Seed 27 Exams (1-Click)"}</span>
          </button>
          <Link
            href="/admin/organizations"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-500 active:scale-95"
          >
            <Building2 className="h-4 w-4" />
            <span>+ Add Academy</span>
          </Link>
          <Link
            href="/admin/logs"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Activity className="h-4 w-4 text-rose-500" />
            <span>Error Logs</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid with Loading Shimmer */}
      {!stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="animate-shimmer h-4 w-28 rounded-lg" />
                  <div className="animate-shimmer h-9 w-9 rounded-2xl" />
                </div>
                <div className="animate-shimmer mt-4 h-9 w-24 rounded-xl" />
              </div>
              <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="animate-shimmer h-3 w-40 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            {
              label: "Live Exam Takers",
              val: stats.activeExamAttempts ?? 0,
              desc: "Students taking exams right now",
              icon: Radio,
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-50 dark:bg-emerald-950/40",
              href: "/admin/analytics",
              isLive: true,
            },
            {
              label: "Currently Online",
              val: stats.onlineUsers ?? 0,
              desc: "Active users on platform",
              icon: Activity,
              color: "text-cyan-600 dark:text-cyan-400",
              bg: "bg-cyan-50 dark:bg-cyan-950/40",
              href: "/admin/users",
              isLive: true,
            },
            {
              label: "Partner Academies",
              val: stats.organizations,
              desc: "Registered coaching institutes",
              icon: Building2,
              color: "text-blue-600 dark:text-blue-400",
              bg: "bg-blue-50 dark:bg-blue-950/40",
              href: "/admin/organizations",
            },
            {
              label: "Total Platform Users",
              val: stats.users,
              desc: "Admins, teachers, students",
              icon: Users,
              color: "text-purple-600 dark:text-purple-400",
              bg: "bg-purple-50 dark:bg-purple-950/40",
              href: "/admin/users",
            },
            {
              label: "Active Students",
              val: stats.students,
              desc: "Registered test candidates",
              icon: FileCheck2,
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-50 dark:bg-emerald-950/40",
              href: "/admin/users",
            },
            {
              label: "Published Live Exams",
              val: stats.exams,
              desc: "Full 100-Q syllabus tests",
              icon: BookOpen,
              color: "text-amber-600 dark:text-amber-400",
              bg: "bg-amber-50 dark:bg-amber-950/40",
              href: "/admin/global-exams",
            },
            {
              label: "Completed Exam Attempts",
              val: stats.results,
              desc: "Evaluated student submissions",
              icon: Layers,
              color: "text-indigo-600 dark:text-indigo-400",
              bg: "bg-indigo-50 dark:bg-indigo-950/40",
              href: "/admin/analytics",
            },
            {
              label: "Paid Subscriptions",
              val: stats.paidPurchases,
              desc: "Completed transactions",
              icon: CreditCard,
              color: "text-teal-600 dark:text-teal-400",
              bg: "bg-teal-50 dark:bg-teal-950/40",
              href: "/admin/payments",
            },
            {
              label: "Total Gross Earnings",
              val: `₹${Number(stats.revenue || 0).toLocaleString("en-IN")}`,
              desc: "Platform processed revenue",
              icon: CreditCard,
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-50 dark:bg-emerald-950/40",
              href: "/admin/finance",
            },
            {
              label: "Push Notification Subscribers",
              val: pushStats ? pushStats.activeSubscriptions : "Active",
              desc: "Web push enabled devices",
              icon: Bell,
              color: "text-rose-600 dark:text-rose-400",
              bg: "bg-rose-50 dark:bg-rose-950/40",
              href: "#super-admin-tools",
              onClick: () => setActiveTab("push"),
            },
          ].map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {item.isLive && (
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                      )}
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {item.label}
                      </span>
                    </div>
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-2xl ${item.bg} ${item.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
                    {item.val}
                  </div>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  {item.desc}
                </div>
              </>
            );

            if (item.onClick) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-purple-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                {content}
              </Link>
            );
          })}
        </div>
      )}

      {/* Super Admin Operations Hub with Two Tabs */}
      <div
        id="super-admin-tools"
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Navigation Tabs Header */}
        <div className="border-b border-slate-200 bg-slate-50/70 px-6 pt-4 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm shadow-blue-500/20">
                <ShieldCheck className="h-3.5 w-3.5" />
                Super Admin Hub
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Operations &amp; Broadcasting
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("seeding")}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
                  activeTab === "seeding"
                    ? "border border-slate-200 bg-white text-blue-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Database className="h-4 w-4" />
                <span>1. Database Seeding &amp; Schema</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("push")}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
                  activeTab === "push"
                    ? "border border-slate-200 bg-white text-purple-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-purple-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Radio className="h-4 w-4 animate-pulse text-purple-500" />
                <span>2. Push Notification &amp; Test Broadcast</span>
                {pushStats?.activeSubscriptions > 0 && (
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-black text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
                    {pushStats.activeSubscriptions}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Database Seeding & Schema */}
        {activeTab === "seeding" && (
          <div>
            <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-transparent p-6 dark:border-slate-800 dark:from-emerald-950/20 dark:via-teal-950/10">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Safe Upsert Mode Active
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Database Seeding &amp; Schema Migration Center
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Safely seed 2,700+ verified questions across 10 topics, publish 10 live mock
                    exams, and manage Prisma database schema migrations without data loss.
                  </p>
                </div>

                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={triggerSeed}
                    disabled={seeding}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-emerald-500/25 transition hover:from-emerald-500 hover:to-teal-500 active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>
                      {seeding
                        ? "Seeding 2,700+ Qs & 10 Live Exams..."
                        : "Run Safe Database Seed (Super Admin)"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-2">
              {/* Left Column: What Seed Does */}
              <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-800/40">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  📦 What Database Seeding Performs Safely
                </h4>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    <span>
                      <strong>10 Syllabus Topics:</strong> History, Geography, Constitution, Marathi
                      Grammar, English, Maths, Reasoning, Science, Economics, GK.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    <span>
                      <strong>200+ Verified Questions Per Topic:</strong> Total 2,700+ distinct
                      questions with full Marathi &amp; English explanations.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    <span>
                      <strong>Randomized Answer Keys:</strong> Correct answers randomized evenly
                      across Options 1, 2, 3, and 4.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    <span>
                      <strong>10 LIVE + 17 DRAFT Exams:</strong> 100 unique questions each with 0
                      duplicates within any exam.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    <span>
                      <strong>Zero Data Loss:</strong> Preserves existing student accounts, test
                      attempts, results, and academy subscriptions.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Right Column: How to Migrate Schema Safely */}
              <div className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/40 p-5 dark:border-blue-900/30 dark:bg-blue-950/20">
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-900 dark:text-blue-300">
                  ⚡ How to Migrate Prisma Schema Changes (Safe Production Workflow)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Whenever you update <code>prisma/schema.prisma</code>, run these safe commands in
                  your terminal:
                </p>
                <div className="space-y-2 rounded-xl bg-slate-900 p-3 font-mono text-[11px] text-emerald-400 dark:bg-slate-950">
                  <p className="text-slate-400"># 1. Update Prisma Client types</p>
                  <p className="text-white">npx prisma generate</p>
                  <p className="mt-1 text-slate-400">
                    # 2. Push schema changes without dropping data
                  </p>
                  <p className="text-white">npx prisma db push</p>
                  <p className="mt-1 text-slate-400"># 3. Seed / sync question bank &amp; exams</p>
                  <p className="text-white">node prisma/seed.js</p>
                </div>
                <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                  ⚠️ Never run <code>prisma migrate reset</code> on production, as it drops all
                  tables!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Web Push Notification & Test Studio */}
        {activeTab === "push" && (
          <div className="space-y-6">
            {/* Tab Header Banner */}
            <div className="border-b border-slate-100 bg-gradient-to-r from-purple-50/60 via-indigo-50/40 to-transparent p-6 dark:border-slate-800 dark:from-purple-950/20 dark:via-indigo-950/10">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm shadow-purple-500/20">
                      <Radio className="h-3.5 w-3.5" />
                      Live Web Push Broadcaster
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      VAPID Secure Delivery
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Web Push Notification &amp; Test Broadcast Studio
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Send real-time push alerts to candidate browsers, test alerts on your device,
                    and broadcast exam announcements instantly.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadPushStats}
                    disabled={pushLoading}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${pushLoading ? "animate-spin" : ""}`} />
                    <span>Refresh Stats</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendPush("me")}
                    disabled={pushSending}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-500/20 transition hover:from-purple-500 hover:to-indigo-500 active:scale-95 disabled:opacity-50"
                  >
                    {pushSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Smartphone className="h-4 w-4" />
                    )}
                    <span>Test Push on My Device (1-Click)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Status Alert Banner */}
            {pushStatusMessage && (
              <div className="mx-6">
                <div
                  className={`flex items-start gap-3 rounded-2xl p-4 text-xs font-semibold ${
                    pushStatusMessage.type === "success"
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
                  }`}
                >
                  {pushStatusMessage.type === "success" ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  )}
                  <span>{pushStatusMessage.text}</span>
                </div>
              </div>
            )}

            {/* Quick Device Subscription Status & Live Metrics */}
            <div className="mx-6 grid gap-4 sm:grid-cols-3">
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Active Push Devices
                  </div>
                  <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                    {pushStats?.activeSubscriptions ?? 0}
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                  <Smartphone className="h-5 w-5" />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Student Subscriptions
                  </div>
                  <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {pushStats?.studentSubscriptions ?? 0}
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <Users className="h-5 w-5" />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    This Browser Device
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-bold">
                    {deviceSubscribed ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        ● Subscribed &amp; Ready
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400">○ Not Subscribed</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSubscribeDevice}
                  disabled={pushSubscribing}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {pushSubscribing
                    ? "Subscribing..."
                    : deviceSubscribed
                      ? "Re-Subscribe"
                      : "Enable Push"}
                </button>
              </div>
            </div>

            {/* Broadcast Composer Form */}
            <div className="mx-6 mb-6 grid gap-6 md:grid-cols-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:col-span-3">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    Compose &amp; Broadcast Push Alert
                  </h4>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Fill in the notification title, message, and target destination link.
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Notification Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={pushForm.title}
                      onChange={(e) => setPushForm({ ...pushForm, title: e.target.value })}
                      placeholder="e.g. New Practice Exam Live 🎯"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Message Body *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={pushForm.body}
                      onChange={(e) => setPushForm({ ...pushForm, body: e.target.value })}
                      placeholder="e.g. 100-Question full mock test #5 is now live. Test your skills now!"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-purple-500"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Target URL (On Click)
                      </label>
                      <input
                        type="text"
                        value={pushForm.url}
                        onChange={(e) => setPushForm({ ...pushForm, url: e.target.value })}
                        placeholder="/student/exams"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Audience Target
                      </label>
                      <select
                        value={pushForm.target}
                        onChange={(e) => setPushForm({ ...pushForm, target: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-purple-500"
                      >
                        <option value="all">🌐 All Subscribed Devices</option>
                        <option value="students">🎓 Students Only</option>
                        <option value="me">👤 Test on My Device Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="broadcastInApp"
                      checked={pushForm.broadcastInApp}
                      onChange={(e) =>
                        setPushForm({ ...pushForm, broadcastInApp: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label
                      htmlFor="broadcastInApp"
                      className="cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Also create in-app notification bell entry
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => handleSendPush("me")}
                      disabled={pushSending}
                      className="inline-flex items-center gap-2 rounded-2xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-xs font-bold text-purple-700 transition hover:bg-purple-100 dark:border-purple-900/50 dark:bg-purple-950/40 dark:text-purple-300"
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                      <span>Test to Me Only</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendPush()}
                      disabled={pushSending}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-500/25 transition hover:from-purple-500 hover:to-indigo-500 active:scale-95 disabled:opacity-50"
                    >
                      {pushSending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Sending Broadcast...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Broadcast to All Users</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview Card */}
              <div className="space-y-4 md:col-span-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-800/40">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    📱 Live Notification Preview
                  </h4>
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-md dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-sm font-bold text-white shadow-sm">
                        ME
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-black text-slate-900 dark:text-white">
                            {pushForm.title || "MahaExam Official Alert"}
                          </span>
                          <span className="text-[10px] text-slate-400">Just now</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300">
                          {pushForm.body || "Notification message content..."}
                        </p>
                        <div className="flex items-center gap-1 pt-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                          <span>{pushForm.url || "/student/exams"}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4 dark:border-purple-900/30 dark:bg-purple-950/20">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 dark:text-purple-300">
                    <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                    <span>Web Push PWA Features</span>
                  </div>
                  <ul className="mt-2 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                    <li>✓ Delivers alerts even when browser tab is closed via Service Worker.</li>
                    <li>✓ End-to-end encrypted with standard RFC 8291 VAPID keys.</li>
                    <li>✓ Deep links directly into exams, result pages, or coaching batches.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Administrative Navigation Panel */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-base font-black text-slate-900 dark:text-white">
          Quick Administrative Navigation
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Direct management links for platform modules
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Organizations & Academies",
              desc: "Onboard new coaching institutes with automated credentials email.",
              href: "/admin/organizations",
              icon: Building2,
            },
            {
              title: "User Management & Safe Deletion",
              desc: "Manage teachers, students, and admins. Safely remove users while preserving questions.",
              href: "/admin/users",
              icon: Users,
            },
            {
              title: "System & Error Diagnostics",
              desc: "Monitor live application errors, API issues, and stack traces.",
              href: "/admin/logs",
              icon: Activity,
            },
            {
              title: "Global 100-Question Mock Exams",
              desc: "Configure 27 Maharashtra Police Bharti, Talathi, and MPSC grand tests.",
              href: "/admin/global-exams",
              icon: BookOpen,
            },
            {
              title: "Subscription Plans & Pricing",
              desc: "Set pricing tiers and entitlements for partner academies.",
              href: "/admin/plans",
              icon: Layers,
            },
            {
              title: "Payments & Order Verification",
              desc: "Inspect transactions, student purchases, and Razorpay orders.",
              href: "/admin/payments",
              icon: CreditCard,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white sm:text-sm">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Database Seed Modal */}
      <ConfirmModal
        isOpen={showSeedModal}
        title="Populate Mock Exam Database"
        description="Do you want to populate and verify all 27 Mock Exams with 2,700 questions in the database?"
        confirmText="Start Seeding"
        variant="warning"
        isLoading={seeding}
        onConfirm={confirmTriggerSeed}
        onClose={() => setShowSeedModal(false)}
      />
    </div>
  );
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
