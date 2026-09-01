// MahaExam Progressive Web App & Web Push Service Worker

const CACHE_NAME = "mahaexam-v1";
const STATIC_ASSETS = ["/", "/offline", "/manifest.json", "/icon-192.svg", "/icon-512.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
      );
    }),
  );
  self.clients.claim();
});

// Web Push Notification Listener
self.addEventListener("push", (event) => {
  let data = {
    title: "MahaExam Alert 🔔",
    body: "New Maharashtra Exam Mock Test Available! सराव सुरू करा.",
    url: "/student/exams",
    icon: "/icon-192.svg",
    badge: "/icon-192.svg",
    tag: `mahaexam-alert-${Date.now()}`,
    vibrate: [300, 100, 300, 100, 300],
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/icon-192.svg",
    badge: data.badge || "/icon-192.svg",
    tag: data.tag || `mahaexam-alert-${Date.now()}`,
    vibrate: data.vibrate || [300, 100, 300, 100, 300],
    renotify: true,
    silent: false,
    requireInteraction: true,
    data: {
      url: data.url || "/",
      timestamp: Date.now(),
    },
    actions: [
      { action: "open", title: "Open Exam (परीक्षा पहा)" },
      { action: "close", title: "Dismiss" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification Click Listener
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const rawUrl =
    event.notification.data?.url ||
    event.notification.data?.link ||
    "/student/notifications";
  const targetUrl = new URL(rawUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    }),
  );
});
