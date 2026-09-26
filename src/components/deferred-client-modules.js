"use client";

import dynamic from "next/dynamic";

// These components are deferred with ssr:false because they are non-critical
// client-only utilities (service worker registration, notification prompt, analytics).
// They do not contribute to initial render or LCP.
const PWARegister = dynamic(
  () => import("@/components/pwa-register").then((mod) => mod.PWARegister),
  { ssr: false },
);
const NotificationPermissionPrompt = dynamic(
  () =>
    import("@/components/notification-permission-prompt").then(
      (mod) => mod.NotificationPermissionPrompt,
    ),
  { ssr: false },
);
const Analytics = dynamic(() => import("@vercel/analytics/next").then((mod) => mod.Analytics), {
  ssr: false,
});

/**
 * DeferredClientModules — wraps non-critical client-only modules so they
 * can use `ssr: false` with next/dynamic (which requires a client component).
 * This keeps layout.js as a server component for optimal performance.
 */
export function DeferredClientModules() {
  return (
    <>
      <PWARegister />
      <NotificationPermissionPrompt />
      <Analytics />
    </>
  );
}
