"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    // Navigation finished
    setNavigating(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    function handleClick(e) {
      const link = e.target.closest("a");
      if (!link) return;
      const href = link.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        link.target === "_blank" ||
        e.defaultPrevented
      ) {
        return;
      }
      if (href.startsWith("/") && href !== pathname) {
        setNavigating(true);
      }
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [pathname]);

  if (!navigating) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-1 overflow-hidden bg-transparent"
    >
      <div className="animate-nav-progress h-full w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-500 shadow-sm shadow-blue-500/50" />
    </div>
  );
}
