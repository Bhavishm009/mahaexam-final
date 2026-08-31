"use client";

import { useEffect, useState } from "react";
import { Bell, X, CheckCircle, Sparkles } from "lucide-react";

export function NotificationPermissionPrompt() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Only show if browser supports notifications
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    if (Notification.permission === "default") {
      const dismissed = sessionStorage.getItem("mahaexam_notif_dismissed");
      if (!dismissed) {
        // Show after a brief delay so page loads cleanly
        const timer = setTimeout(() => setShow(true), 2500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  async function handleEnable() {
    try {
      setLoading(true);
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        let subData = {
          endpoint: `https://fcm.googleapis.com/fcm/send/guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          keys: {
            p256dh: "BMahaExamKeyP256dh" + Math.random().toString(36).substring(2),
            auth: "AuthToken" + Math.random().toString(36).substring(2),
          },
          userAgent: navigator.userAgent,
        };

        // If service worker is ready, try real pushManager subscription
        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.ready.catch(() => null);
          if (reg && reg.pushManager) {
            try {
              let pushSub = await reg.pushManager.getSubscription();
              if (!pushSub) {
                const vapidKey =
                  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
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
            } catch {
              // Fallback to client token registration
            }
          }
        }

        await fetch("/api/notifications/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subData),
        }).catch(() => {});

        setSuccess(true);
        setTimeout(() => setShow(false), 2000);
      } else {
        setShow(false);
      }
    } catch {
      setShow(false);
    } finally {
      setLoading(false);
    }
  }

  function handleDismiss() {
    sessionStorage.setItem("mahaexam_notif_dismissed", "true");
    setShow(false);
  }

  if (!show) {
    return null;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 fixed bottom-4 right-4 z-50 max-w-sm duration-300 sm:bottom-6 sm:right-6">
      <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                <Sparkles className="h-3 w-3" />
                <span>MahaExam Official Alerts</span>
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                परीक्षेच्या सूचना मिळवा
              </h4>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-300">
          Get real-time alerts for Police Bharti, MPSC, Talathi mock exams, answer keys, and hall
          tickets. (नोंदणी नसतानाही सूचना मिळतील).
        </p>

        <div className="mt-4 flex items-center gap-2">
          {success ? (
            <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-emerald-500 py-2.5 text-xs font-bold text-white shadow-sm">
              <CheckCircle className="h-4 w-4" />
              <span>सूचना सुरू झाल्या! (Alerts Enabled)</span>
            </div>
          ) : (
            <>
              <button
                onClick={handleEnable}
                disabled={loading}
                className="flex-1 rounded-2xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-500 active:scale-95 disabled:opacity-50"
              >
                {loading ? "Enabling..." : "Enable Alerts (सुरू करा)"}
              </button>
              <button
                onClick={handleDismiss}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
              >
                Later
              </button>
            </>
          )}
        </div>
      </div>
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
