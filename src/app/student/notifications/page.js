"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ExternalLink } from "lucide-react";

export default function Notifications() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const r = await fetch("/api/student/notifications");
      const d = await r.json();
      setItems(d.notifications || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleClick(x) {
    if (!x.readAt) {
      await fetch("/api/student/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: x.id }),
      }).catch(() => {});
    }

    const targetUrl = x.link || x.data?.url || x.url;
    if (targetUrl) {
      router.push(targetUrl);
    } else {
      load();
    }
  }

  return (
    <main className="min-h-screen space-y-6 font-sans text-slate-900 transition-colors dark:text-slate-100">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-blue-100 backdrop-blur-md">
                <Bell className="h-3.5 w-3.5 text-amber-300" />
                Live Notification Center
              </span>
              <h1 className="mt-3 text-2xl font-black sm:text-3xl">System & Exam Notifications</h1>
              <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                Exam alerts, result announcements, coaching updates, and reminders.
              </p>
            </div>
            <Link
              href="/student/dashboard"
              className="inline-flex items-center gap-1.5 self-start rounded-2xl bg-white/20 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/30 sm:self-auto"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="grid min-h-[30vh] place-items-center">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <span>Loading notifications...</span>
              </div>
            </div>
          ) : (
            <>
              {items.map((x) => {
                const targetUrl = x.link || x.data?.url || x.url;
                return (
                  <button
                    type="button"
                    key={x.id}
                    onClick={() => handleClick(x)}
                    className={`block w-full rounded-2xl border p-5 text-left shadow-sm transition-all hover:shadow-md ${
                      x.readAt
                        ? "border-slate-200 bg-white opacity-80 dark:border-slate-800 dark:bg-slate-900"
                        : "border-blue-200 bg-blue-50/70 dark:border-blue-900/50 dark:bg-blue-950/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <b className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">
                          {x.title}
                        </b>
                        {targetUrl && (
                          <ExternalLink className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                        {new Date(x.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
                      {x.message}
                    </p>
                  </button>
                );
              })}
              {!items.length && (
                <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 sm:text-sm">
                  You are all caught up! No unread notifications.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
