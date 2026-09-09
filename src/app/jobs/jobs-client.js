"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  Calendar,
  Building2,
  GraduationCap,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  X,
  Share2,
  Check,
  Sparkles,
  Tag,
} from "lucide-react";
import Breadcrumbs from "@/components/breadcrumbs";

export default function JobsClient({
  initialJobs = [],
  initialQuery = "",
  initialCategory = "ALL",
  initialStatus = "ALL",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Read URL search params for deep linking and shared URLs
  const queryParam = searchParams.get("q") ?? initialQuery ?? "";
  const statusParam = searchParams.get("status") ?? initialStatus ?? "ALL";
  const catParam = searchParams.get("category") ?? initialCategory ?? "ALL";

  const [search, setSearch] = useState(queryParam);
  const [statusFilter, setStatusFilter] = useState(statusParam);
  const [categoryFilter, setCategoryFilter] = useState(catParam);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync state if browser back/forward occurs
  useEffect(() => {
    setSearch(searchParams.get("q") || "");
    setStatusFilter(searchParams.get("status") || "ALL");
    setCategoryFilter(searchParams.get("category") || "ALL");
  }, [searchParams]);

  // Push updates to URL query parameters for shareability & SEO
  const updateUrl = (newQuery, newStatus, newCat) => {
    const params = new URLSearchParams();
    if (newQuery && newQuery.trim()) {
      params.set("q", newQuery.trim());
    }
    if (newStatus && newStatus !== "ALL") {
      params.set("status", newStatus);
    }
    if (newCat && newCat !== "ALL") {
      params.set("category", newCat);
    }

    const queryString = params.toString();
    const targetUrl = queryString ? `/jobs?${queryString}` : "/jobs";
    startTransition(() => {
      router.replace(targetUrl, { scroll: false });
    });
  };

  // Debounced search sync
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentParamQuery = searchParams.get("q") || "";
      if (search !== currentParamQuery) {
        updateUrl(search, statusFilter, categoryFilter);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle status tab click
  const handleStatusChange = (status) => {
    setStatusFilter(status);
    updateUrl(search, status, categoryFilter);
  };

  // Handle category pill click
  const handleCategoryChange = (cat) => {
    setCategoryFilter(cat);
    updateUrl(search, statusFilter, cat);
  };

  // Extract distinct categories with counts
  const categoryStats = useMemo(() => {
    const counts = {};
    initialJobs.forEach((job) => {
      const cat = job.category || "General";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const list = Object.keys(counts).map((name) => ({
      name,
      count: counts[name],
    }));

    return [
      { name: "ALL", label: "सर्व विभाग (All Categories)", count: initialJobs.length },
      ...list,
    ];
  }, [initialJobs]);

  // Filter jobs based on search, status, and category
  const filteredJobs = useMemo(() => {
    return initialJobs.filter((job) => {
      const matchesSearch =
        !search ||
        job.title?.toLowerCase().includes(search.toLowerCase()) ||
        job.titleMr?.toLowerCase().includes(search.toLowerCase()) ||
        job.department?.toLowerCase().includes(search.toLowerCase()) ||
        job.departmentMr?.toLowerCase().includes(search.toLowerCase()) ||
        job.qualification?.toLowerCase().includes(search.toLowerCase()) ||
        job.qualificationMr?.toLowerCase().includes(search.toLowerCase()) ||
        job.category?.toLowerCase().includes(search.toLowerCase()) ||
        job.vacancies?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || job.status?.toUpperCase() === statusFilter.toUpperCase();

      const matchesCat =
        categoryFilter === "ALL" ||
        job.category?.toLowerCase() === categoryFilter.toLowerCase() ||
        job.department?.toLowerCase().includes(categoryFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesCat;
    });
  }, [initialJobs, search, statusFilter, categoryFilter]);

  // Copy current filtered URL for sharing
  const handleCopyShareLink = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const totalCount = initialJobs.length;
  const activeCount = initialJobs.filter((j) => j.status === "ACTIVE").length;
  const upcomingCount = initialJobs.filter((j) => j.status === "UPCOMING").length;

  return (
    <div className="pb-12 pt-2 font-sans sm:pb-16 sm:pt-3">
      <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
        {/* Compact Breadcrumbs directly below navbar */}
        <div className="py-0.5">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Government Job Alerts & Notifications" },
            ]}
          />
        </div>

        {/* Header Hero Banner (Clean, NO search inside) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-700 p-6 text-white shadow-xl sm:p-10">
          <div className="max-w-3xl space-y-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-0.5 text-xs font-bold text-blue-100 backdrop-blur-md">
              <Bell className="h-3.5 w-3.5 animate-bounce text-amber-300" />
              अधिकृत नोकरी व भरती जाहिराती २०२६
            </span>
            <h1 className="text-2xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              महाराष्ट्र सरकारी भरती जाहिराती व सूचना
            </h1>
            <p className="text-xs leading-relaxed text-blue-100 sm:text-sm">
              पोलीस भरती, MPSC, तलाठी, जिल्हा परिषद आणि वनरक्षक भरतीच्या अधिकृत जाहिराती, शैक्षणिक
              पात्रता, अंतिम तारीख आणि परिपूर्ण मोफत ऑनलाईन सराव चाचण्या.
            </p>
          </div>
        </div>

        {/* Future Ad Slot: Responsive Top Banner */}
        <div
          data-ad-slot="jobs-header-leaderboard"
          className="w-full overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-2 text-center transition-all dark:border-slate-800 dark:bg-slate-900/30"
          aria-label="जाहिरात जागा (Advertisement Slot)"
        >
          <div className="flex h-16 w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-sky-500/5 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 sm:h-20">
            <span className="flex items-center gap-1.5 text-[11px] sm:text-xs">
              <Sparkles className="h-3.5 w-3.5 text-blue-500/70" />
              <span>जाहिरात जागा • MahaExam Official Careers Partner (Ad Slot Ready)</span>
            </span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="space-y-3 pt-1">
          {/* Top row: Status Tabs & Instant Search Bar */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleStatusChange("ALL")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  statusFilter === "ALL"
                    ? "bg-sky-600 text-white shadow-md shadow-sky-500/20"
                    : "glass-card text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                सर्व जाहिराती ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("ACTIVE")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  statusFilter === "ACTIVE"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                    : "glass-card text-emerald-700 hover:bg-slate-100 dark:text-emerald-400 dark:hover:bg-slate-800"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>अर्ज सुरू ({activeCount})</span>
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("UPCOMING")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  statusFilter === "UPCOMING"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "glass-card text-blue-700 hover:bg-slate-100 dark:text-blue-400 dark:hover:bg-slate-800"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>आगामी ({upcomingCount})</span>
              </button>
            </div>

            {/* Instant Search Bar & Share Link */}
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="भरती, पद किंवा विभाग शोधा... (Search Jobs)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200/80 bg-white py-2.5 pl-10 pr-9 text-xs font-semibold text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      updateUrl("", statusFilter, categoryFilter);
                    }}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="शोध रद्द करा (Clear Search)"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {(search || statusFilter !== "ALL" || categoryFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50/80 px-3 py-2.5 text-xs font-bold text-sky-700 shadow-sm transition hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950/80 dark:text-sky-300"
                  title="या भरती शोधाची लिंक कॉपी करून मित्रांना पाठवा"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="hidden text-emerald-700 dark:text-emerald-300 sm:inline">
                        कॉपी झाली!
                      </span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                      <span className="hidden sm:inline">शेअर करा</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills for Recruitment Types */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
            {categoryStats.map((cat) => {
              const isSelected = categoryFilter === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleCategoryChange(cat.name)}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : "glass-card text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>{cat.label || cat.name}</span>
                  <span
                    className={`py-0.2 rounded-full px-1.5 text-[10px] font-black ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Filter Indicator */}
          {(statusFilter !== "ALL" || categoryFilter !== "ALL" || search) && (
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-slate-500 dark:text-slate-400">
              <span>सध्याचे निकष:</span>
              {statusFilter !== "ALL" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                  स्थिती: {statusFilter === "ACTIVE" ? "अर्ज सुरू" : "आगामी भरती"}
                </span>
              )}
              {categoryFilter !== "ALL" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 font-bold text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                  विभाग: {categoryFilter}
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  शोध: "{search}"
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                  setCategoryFilter("ALL");
                  updateUrl("", "ALL", "ALL");
                }}
                className="ml-1 text-[11px] font-bold text-sky-600 hover:underline dark:text-sky-400"
              >
                रीसेट करा (Reset All)
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <Bell className="mx-auto mb-3 h-12 w-12 text-slate-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              कोणतीही भरती जाहिरात आढळली नाही
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              कृपया दुसरा शब्द शोधून पहा किंवा स्थिती/विभाग बदला.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setCategoryFilter("ALL");
                updateUrl("", "ALL", "ALL");
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-sky-700"
            >
              सर्व भरती जाहिराती पहा (View All Jobs)
            </button>
          </div>
        ) : (
          /* Job Alerts Grid - Each card is 100% directly clickable */
          <div className="grid gap-6 pt-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job, idx) => (
              <div key={job.id} className="contents">
                {/* Optional In-Feed Native Ad Card at position 2 */}
                {idx === 2 && (
                  <div
                    data-ad-slot="jobs-infeed-ad"
                    className="glass-card flex flex-col justify-between rounded-3xl border border-dashed border-blue-300/60 bg-blue-50/20 p-6 shadow-sm transition hover:shadow-md dark:border-blue-800/40 dark:bg-blue-950/20"
                    aria-label="प्रायोजित भरती जाहिरात (Sponsored Job Ad)"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                          प्रायोजित (Sponsored Ad)
                        </span>
                        <span className="text-[10px] text-slate-400">Ad Ready</span>
                      </div>
                      <div className="mt-4 flex h-32 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400">
                        <div className="p-3 text-center">
                          <Sparkles className="mx-auto mb-1 h-7 w-7 text-blue-500" />
                          <p className="text-xs font-bold">MahaExam सराव परीक्षा केंद्र</p>
                          <p className="mt-1 line-clamp-2 text-[10px] text-slate-500 dark:text-slate-400">
                            हजारो विद्यार्थ्यांचा विश्वास • १०,०००+ मोफत सराव प्रश्नपत्रिका.
                          </p>
                        </div>
                      </div>
                      <h3 className="mt-3 line-clamp-2 text-sm font-bold text-slate-900 dark:text-white">
                        स्पर्धा परीक्षा मोफत मॉक टेस्ट व स्टडी पॅकेज
                      </h3>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-200/60 pt-3 dark:border-slate-800/60">
                      <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                        अधिक जाणून घ्या (Learn More)
                      </span>
                      <ArrowRight className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    </div>
                  </div>
                )}

                <Link
                  href={`/jobs/${job.slug || job.id}`}
                  prefetch={true}
                  role="link"
                  tabIndex={0}
                  className="glass-card group block flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-400/50 hover:shadow-xl"
                >
                  <div>
                    {/* Status & Vacancies Pill Header */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          job.status === "ACTIVE"
                            ? "border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                            : job.status === "UPCOMING"
                              ? "border border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/80 dark:text-blue-300"
                              : "border border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            job.status === "ACTIVE" ? "animate-pulse bg-emerald-500" : "bg-blue-500"
                          }`}
                        />
                        {job.status === "ACTIVE"
                          ? "अर्ज सुरू (Active)"
                          : job.status === "UPCOMING"
                            ? "आगामी (Upcoming)"
                            : "Expired"}
                      </span>

                      <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-black text-sky-700 dark:bg-sky-950/80 dark:text-sky-300">
                        {job.vacancies}
                      </span>
                    </div>

                    {/* Department & Category */}
                    <div className="mt-3 flex items-center justify-between gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                        <span className="truncate">{job.departmentMr || job.department}</span>
                      </div>
                      {job.category && (
                        <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {job.category}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="mt-2 text-base font-black leading-snug text-slate-900 transition-colors group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400 sm:text-lg">
                      {job.titleMr || job.title}
                    </h2>

                    {/* Description Snippet */}
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {job.descriptionMr || job.description}
                    </p>

                    {/* Clean Key Criteria Badges */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="inline-flex max-w-full items-center gap-1 truncate rounded-xl bg-slate-100 px-2.5 py-1 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <GraduationCap className="h-3 w-3 shrink-0 text-slate-400" />
                        <span className="truncate">{job.qualificationMr || job.qualification}</span>
                      </span>

                      {job.lastDate && (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          <Calendar className="h-3 w-3 shrink-0 text-slate-400" />
                          <span>{job.lastDate}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer - Direct CTA */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-200/60 pt-3 dark:border-slate-800/60">
                    <span className="text-xs font-bold text-sky-600 transition group-hover:text-sky-700 dark:text-sky-400">
                      सविस्तर माहिती व अर्ज पहा (View & Apply)
                    </span>
                    <ArrowRight className="h-4 w-4 text-sky-600 transition-transform group-hover:translate-x-1 dark:text-sky-400" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
