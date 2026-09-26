"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            reg.onupdatefound = () => {
              const installing = reg.installing;
              if (installing) {
                installing.onstatechange = () => {
                  if (installing.state === "installed" && navigator.serviceWorker.controller) {
                    // New content available
                  }
                };
              }
            };
          })
          .catch(() => {});
      };

      if (document.readyState === "complete") {
        if ("requestIdleCallback" in window) {
          window.requestIdleCallback(registerSW, { timeout: 4000 });
        } else {
          setTimeout(registerSW, 3000);
        }
      } else {
        window.addEventListener(
          "load",
          () => {
            if ("requestIdleCallback" in window) {
              window.requestIdleCallback(registerSW, { timeout: 4000 });
            } else {
              setTimeout(registerSW, 3000);
            }
          },
          { once: true },
        );
      }
    }
  }, []);

  return null;
}
