import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { getBaseUrl } from "@/lib/base-url";

/**
 * Modern Breadcrumbs with Google JSON-LD BreadcrumbList Schema
 * @param {Array<{ label: string, href?: string }>} items
 */
export default function Breadcrumbs({ items = [], className = "" }) {
  if (!items || items.length === 0) return null;

  const siteUrl = getBaseUrl();

  // Build schema.org BreadcrumbList JSON-LD
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const isLast = index === items.length - 1;
      const fullHref = item.href
        ? item.href.startsWith("http")
          ? item.href
          : `${siteUrl}${item.href}`
        : siteUrl;

      return {
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        ...(!isLast && item.href ? { item: fullHref } : {}),
      };
    }),
  };

  return (
    <>
      {/* Schema.org BreadcrumbList for Search Engine Ranking */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Visual Navigation Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className={`flex flex-wrap items-center gap-1.5 py-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400 ${className}`}
      >
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;

          return (
            <div key={index} className="flex items-center gap-1.5">
              {!isFirst && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-600" />
              )}

              {isLast || !item.href ? (
                <span
                  className="max-w-[220px] truncate font-bold text-slate-900 dark:text-white sm:max-w-md"
                  aria-current="page"
                  title={item.label}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  prefetch={true}
                  className="inline-flex items-center gap-1 transition hover:text-sky-600 dark:hover:text-sky-400"
                >
                  {isFirst && <Home className="h-3 w-3" />}
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}
