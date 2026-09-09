"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SeoDynamicEditRedirect({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const routeId = resolvedParams?.id;

  useEffect(() => {
    if (routeId) {
      const decoded = decodeURIComponent(routeId);
      const normalizedRoute = decoded.startsWith("/") ? decoded : `/${decoded}`;
      router.replace(`/admin/seo/edit?route=${encodeURIComponent(normalizedRoute)}`);
    } else {
      router.replace("/admin/seo");
    }
  }, [routeId, router]);

  return (
    <div className="flex h-96 flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      <p className="text-sm font-medium text-slate-500">Opening SEO editor...</p>
    </div>
  );
}
