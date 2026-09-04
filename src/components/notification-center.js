"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ExternalLink } from "lucide-react";
import { triggerSoundAndVibration } from "@/lib/notification-audio";

export default function NotificationCenter() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  async function load() {
    try {
      const r = await fetch("/api/notifications");
      if (r.ok) {
        const d = await r.json();
        const newNotifications = d.notifications || [];
        setItems((prev) => {
          const prevUnread = prev.filter((x) => !x.readAt).length;
          const newUnread = newNotifications.filter((x) => !x.readAt).length;
          if (newUnread > prevUnread && prev.length > 0) {
            triggerSoundAndVibration([300, 100, 300, 100, 300]);
          }
          return newNotifications;
        });
      }
    } catch {}
  }

  useEffect(() => {
    load();
  }, []);

  async function handleNotificationClick(n) {
    if (!n.readAt) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: n.id }),
      }).catch(() => {});

      setItems((x) =>
        x.map((item) => (item.id === n.id ? { ...item, readAt: new Date().toISOString() } : item)),
      );
    }

    setOpen(false);

    const targetUrl = n.link || n.data?.url || n.url;
    if (targetUrl) {
      router.push(targetUrl);
    }
  }

  const unread = items.filter((x) => !x.readAt).length;

  return (
    <div className="relative font-sans">
      <button
        type="button"
        onClick={() => setOpen((x) => !x)}
        className="relative flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:px-3 sm:py-2"
      >
        <Bell className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        <span className="hidden sm:inline">सूचना</span>
        {unread > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="w-84 absolute right-0 z-50 mt-2 max-w-[90vw] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  सूचना केंद्र
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-400">{unread} unread</span>
            </div>

            <div className="max-h-96 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
              {items.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400">नवीन सूचना नाहीत.</div>
              )}
              {items.map((n) => {
                const targetUrl = n.link || n.data?.url || n.url;
                return (
                  <button
                    type="button"
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`block w-full p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                      n.readAt ? "opacity-75" : "bg-blue-50/60 dark:bg-blue-950/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {n.title}
                      </div>
                      {targetUrl && <ExternalLink className="h-3 w-3 shrink-0 text-slate-400" />}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
                      {n.message}
                    </div>
                    <div className="mt-1 text-[10px] text-slate-400">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
