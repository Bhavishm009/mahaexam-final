"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ExternalLink, CheckCheck, Sparkles, X } from "lucide-react";
import { triggerSoundAndVibration } from "@/lib/notification-audio";
import { useLanguage } from "@/components/language-provider";
import { toast } from "sonner";

export default function NotificationCenter() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const { language } = useLanguage();

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
            const latest = newNotifications[0];
            if (latest) {
              toast.info(latest.title, {
                description: latest.message,
              });
            }
          }
          return newNotifications;
        });
      }
    } catch {}
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);

    let eventSource;
    try {
      eventSource = new EventSource("/api/realtime");
      eventSource.addEventListener("notification", () => {
        load();
      });
    } catch (_) {}

    return () => {
      clearInterval(interval);
      eventSource?.close();
    };
  }, []);

  async function handleNotificationClick(n) {
    if (!n.readAt) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: n.id }),
      }).catch(() => {});

      setItems((x) =>
        x.map((item) => (item.id === n.id ? { ...item, readAt: new Date().toISOString() } : item))
      );
    }

    setOpen(false);

    const targetUrl = n.link || n.data?.url || n.url;
    if (targetUrl) {
      router.push(targetUrl);
    }
  }

  async function handleMarkAllRead() {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setItems((prev) => prev.map((x) => ({ ...x, readAt: new Date().toISOString() })));
      toast.success(language === "mr" ? "सर्व सूचना वाचून झाल्या म्हणून चिन्हांकित केल्या" : "All notifications marked as read!");
    } catch {}
  }

  const unread = items.filter((x) => !x.readAt).length;
  const isMr = language === "mr";

  return (
    <div className="relative font-sans">
      <button
        type="button"
        onClick={() => setOpen((x) => !x)}
        className="relative flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:px-3 sm:py-2"
        title={isMr ? "सूचना केंद्र" : "Notification Center"}
      >
        <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        {/* <span className="hidden sm:inline">{isMr ? "सूचना" : "Alerts"}</span> */}
        {unread > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white shadow-xs animate-pulse">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-xs sm:bg-transparent" onClick={() => setOpen(false)} />

          {/* Responsive Popover Container */}
          <div className="fixed left-3 right-3 top-16 z-50 max-h-[85vh] w-auto overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96">
            {/* Popover Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">
                    {isMr ? "सूचना केंद्र" : "Notifications"}
                  </h3>
                  <p className="text-[10px] font-semibold text-slate-400">
                    {unread > 0 ? `${unread} ${isMr ? "नवीन संदेश" : "unread alert(s)"}` : (isMr ? "सर्व वाचून झाले" : "All caught up")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 rounded-xl bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600 transition hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:hover:bg-blue-900/60"
                    title={isMr ? "सर्व वाचल्याचे चिन्हांकित करा" : "Mark all as read"}
                  >
                    <CheckCheck className="h-3 w-3" />
                    <span className="hidden sm:inline">{isMr ? "वाचले" : "Read all"}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notification Items Scrollable List */}
            <div className="max-h-[60vh] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800 sm:max-h-96">
              {items.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                    <Sparkles className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                    {isMr ? "नवीन सूचना उपलब्ध नाहीत." : "No new notifications yet."}
                  </p>
                </div>
              ) : (
                items.map((n) => {
                  const targetUrl = n.link || n.data?.url || n.url;
                  const isUnread = !n.readAt;
                  return (
                    <button
                      type="button"
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`group block w-full p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                        isUnread ? "bg-blue-50/50 dark:bg-blue-950/20" : "opacity-80"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {isUnread && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="truncate text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {n.title}
                            </h4>
                            {targetUrl && (
                              <ExternalLink className="h-3 w-3 shrink-0 text-slate-400 group-hover:text-blue-500" />
                            )}
                          </div>
                          <p className="mt-1 text-xs font-medium text-slate-600 line-clamp-2 dark:text-slate-300">
                            {n.message}
                          </p>
                          <span className="mt-1.5 block text-[10px] font-semibold text-slate-400">
                            {new Date(n.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
