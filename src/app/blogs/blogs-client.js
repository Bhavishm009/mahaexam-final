"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Tag,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Search,
  Sparkles,
  X,
  Share2,
  Check,
  Radio,
} from "lucide-react";
import Breadcrumbs from "@/components/breadcrumbs";

export default function BlogsClient({
  initialBlogs = [],
  initialQuery = "",
  initialCategory = "ALL",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Read URL search params for deep linking and shared URLs
  const queryParam = searchParams.get("q") ?? initialQuery ?? "";
  const catParam = searchParams.get("category") ?? initialCategory ?? "ALL";

  const [search, setSearch] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(catParam);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync state if browser back/forward occurs
  useEffect(() => {
    const q = searchParams.get("q") || "";
    const c = searchParams.get("category") || "ALL";
    setSearch(q);
    setSelectedCategory(c);
  }, [searchParams]);

  // Push updates to URL query string for shareability & SEO deep linking
  const updateUrl = (newQuery, newCat) => {
    const params = new URLSearchParams();
    if (newQuery && newQuery.trim()) {
      params.set("q", newQuery.trim());
    }
    if (newCat && newCat !== "ALL") {
      params.set("category", newCat);
    }

    const queryString = params.toString();
    const targetUrl = queryString ? `/blogs?${queryString}` : "/blogs";
    startTransition(() => {
      router.replace(targetUrl, { scroll: false });
    });
  };

  // Debounced search sync
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentParamQuery = searchParams.get("q") || "";
      if (search !== currentParamQuery) {
        updateUrl(search, selectedCategory);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle category selection
  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    updateUrl(search, cat);
  };

  // Extract distinct categories with counts
  const categoryStats = useMemo(() => {
    const counts = {};
    initialBlogs.forEach((b) => {
      if (b.category) {
        counts[b.category] = (counts[b.category] || 0) + 1;
      }
    });

    const categoriesList = Object.keys(counts).map((name) => ({
      name,
      count: counts[name],
    }));

    return [
      { name: "ALL", label: "सर्व विषय (All)", count: initialBlogs.length },
      ...categoriesList,
    ];
  }, [initialBlogs]);

  // Filter blogs matching search and category
  const filteredBlogs = useMemo(() => {
    return initialBlogs.filter((b) => {
      const matchesSearch =
        !search ||
        b.title?.toLowerCase().includes(search.toLowerCase()) ||
        b.titleMr?.toLowerCase().includes(search.toLowerCase()) ||
        b.excerpt?.toLowerCase().includes(search.toLowerCase()) ||
        b.category?.toLowerCase().includes(search.toLowerCase()) ||
        b.content?.toLowerCase().includes(search.toLowerCase());

      const matchesCat =
        selectedCategory === "ALL" || b.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [initialBlogs, search, selectedCategory]);

  // Copy current filtered/searched page URL for easy sharing
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

  const featuredPost = filteredBlogs[0];
  const remainingPosts = filteredBlogs.slice(1);

  return (
    <div className="pb-12 pt-2 font-sans sm:pb-16 sm:pt-3">
      <div className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
        {/* Compact Breadcrumbs directly below navbar */}
        <div className="py-0.5">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Articles & Exam Guides" }]}
          />
        </div>

        {/* Hero Banner (Clean, NO search bar inside) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-800 p-6 text-white shadow-xl sm:p-10">
          <div className="pointer-events-none absolute -bottom-10 -right-10 opacity-15">
            <BookOpen className="h-80 w-80 sm:h-96 sm:w-96" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-0.5 text-xs font-bold text-white backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              MahaExam Knowledge Hub 📚
            </span>
            <h1 className="text-2xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              स्पर्धा परीक्षा मार्गदर्शन व अभ्यास लेख
            </h1>
            <p className="text-xs leading-relaxed text-sky-100 sm:text-sm">
              महाराष्ट्र पोलीस भरती, तलाठी, MPSC व जिल्हा परिषद परीक्षांच्या ताज्या घडामोडी, अधिकृत
              अभ्यासक्रम, टॉपर स्ट्रॅटेजी आणि परिपूर्ण तयारी मार्गदर्शक.
            </p>
          </div>
        </div>

        {/* Future Ad Slot: Responsive Top Banner */}
        <div
          data-ad-slot="blogs-header-leaderboard"
          className="w-full overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-2 text-center transition-all dark:border-slate-800 dark:bg-slate-900/30"
          aria-label="जाहिरात जागा (Advertisement Slot)"
        >
          <div className="flex h-16 w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-500/5 via-indigo-500/5 to-purple-500/5 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 sm:h-20">
            <span className="flex items-center gap-1.5 text-[11px] sm:text-xs">
              <Sparkles className="h-3.5 w-3.5 text-sky-500/70" />
              <span>जाहिरात जागा • MahaExam Verified Partners (Ad Slot Ready)</span>
            </span>
          </div>
        </div>

        {/* Search & Category Filter Toolbar (Outside Banner) */}
        <div className="space-y-3 pt-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Instant Search Bar synced with URL ?q= */}
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="लेख, विषय किंवा परीक्षा शोधा... (Search Articles)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200/80 bg-white py-2.5 pl-10 pr-9 text-xs font-semibold text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    updateUrl("", selectedCategory);
                  }}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="शोध रद्द करा (Clear Search)"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Share Search URL Button */}
            {(search || selectedCategory !== "ALL") && (
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="inline-flex items-center gap-1.5 self-start rounded-xl border border-sky-200 bg-sky-50/80 px-3 py-2 text-xs font-bold text-sky-700 shadow-sm transition hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950/80 dark:text-sky-300 sm:self-auto"
                title="या शोध निकालांची लिंक कॉपी करून मित्रांना पाठवा"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-300">लिंक कॉपी झाली!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                    <span>शोधाची लिंक शेअर करा (Share Search)</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
            {categoryStats.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                    isSelected
                      ? "bg-sky-600 text-white shadow-md shadow-sky-500/20"
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
          {(selectedCategory !== "ALL" || search) && (
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-slate-500 dark:text-slate-400">
              <span>सध्याचे निकष:</span>
              {selectedCategory !== "ALL" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 font-bold text-sky-700 dark:bg-sky-950/80 dark:text-sky-300">
                  श्रेणी: {selectedCategory}
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
                  setSelectedCategory("ALL");
                  updateUrl("", "ALL");
                }}
                className="ml-1 text-[11px] font-bold text-sky-600 hover:underline dark:text-sky-400"
              >
                रीसेट करा (Reset All)
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredBlogs.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <FileText className="mx-auto mb-3 h-12 w-12 text-slate-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              कोणतेही लेख आढळले नाहीत
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              कृपया दुसरा शब्द शोधून पहा किंवा श्रेणी बदला.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("ALL");
                updateUrl("", "ALL");
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-sky-700"
            >
              सर्व लेख पहा (View All Articles)
            </button>
          </div>
        ) : (
          <div className="space-y-6 pt-1">
            {/* Featured Lead Post - Entire card is directly clickable */}
            {featuredPost && (
              <Link
                href={`/blogs/${featuredPost.slug}`}
                prefetch={true}
                role="link"
                tabIndex={0}
                className="glass-card group block cursor-pointer overflow-hidden rounded-3xl p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/50 hover:shadow-xl sm:p-8"
              >
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
                  {featuredPost.imageUrl ? (
                    <div className="overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 lg:col-span-6">
                      <img
                        src={featuredPost.imageUrl}
                        alt={featuredPost.title}
                        className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-64"
                      />
                    </div>
                  ) : (
                    <div className="flex h-52 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/10 to-blue-600/10 text-sky-600 lg:col-span-6">
                      <BookOpen className="h-16 w-16" />
                    </div>
                  )}

                  <div
                    className={`space-y-3 ${
                      featuredPost.imageUrl ? "lg:col-span-6" : "lg:col-span-12"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                      <span className="rounded-full bg-sky-500/10 px-3 py-1 font-bold text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
                        {featuredPost.category}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {new Date(featuredPost.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <h2 className="text-xl font-black text-slate-900 transition-colors group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400 sm:text-2xl lg:text-3xl">
                      {featuredPost.title}
                    </h2>

                    {featuredPost.titleMr && featuredPost.titleMr !== featuredPost.title && (
                      <p className="line-clamp-1 text-sm font-bold text-sky-700 dark:text-sky-400">
                        {featuredPost.titleMr}
                      </p>
                    )}

                    {featuredPost.excerpt && (
                      <p className="line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
                        {featuredPost.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 pt-1 text-xs font-bold text-sky-600 transition group-hover:text-sky-700 dark:text-sky-400">
                      <span>संपूर्ण लेख वाचा (Read Full Article)</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Remaining Grid Cards - Each card is 100% clickable */}
            {remainingPosts.length > 0 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {remainingPosts.map((blog, idx) => (
                  <div key={blog.id} className="contents">
                    {/* Optional In-Feed Native Ad Card at position 2 */}
                    {idx === 2 && (
                      <div
                        data-ad-slot="blogs-infeed-ad"
                        className="glass-card flex flex-col justify-between rounded-3xl border border-dashed border-sky-300/60 bg-sky-50/20 p-5 shadow-sm transition hover:shadow-md dark:border-sky-800/40 dark:bg-sky-950/20"
                        aria-label="प्रायोजित जाहिरात (Sponsored Ad)"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                              प्रायोजित (Sponsored Ad)
                            </span>
                            <span className="text-[10px] text-slate-400">Ad Ready</span>
                          </div>
                          <div className="mt-3 flex h-36 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/10 to-indigo-500/10 text-sky-600 dark:text-sky-400">
                            <div className="p-3 text-center">
                              <Sparkles className="mx-auto mb-1 h-7 w-7 text-sky-500" />
                              <p className="text-xs font-bold">MahaExam Daily Test Series</p>
                              <p className="mt-1 line-clamp-2 text-[10px] text-slate-500 dark:text-slate-400">
                                मोफत चालू घडामोडी, TCS/IBPS पॅटर्न सराव प्रश्न व अधिकृत भरती
                                अपडेट्स.
                              </p>
                            </div>
                          </div>
                          <h3 className="mt-3 line-clamp-2 text-sm font-bold text-slate-900 dark:text-white">
                            पोलीस व तलाठी भरती २०२६ टेस्ट सिरीज जॉईन करा
                          </h3>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3 dark:border-slate-800/60">
                          <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                            जॉईन करा (Join Now)
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                        </div>
                      </div>
                    )}

                    <Link
                      href={`/blogs/${blog.slug}`}
                      prefetch={true}
                      role="link"
                      tabIndex={0}
                      className="glass-card group block flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-400/50 hover:shadow-xl"
                    >
                      <div>
                        {/* Image Thumbnail */}
                        {blog.imageUrl ? (
                          <div className="h-44 w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                            <img
                              src={blog.imageUrl}
                              alt={blog.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                        ) : (
                          <div className="flex h-40 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/10 to-blue-600/10 text-sky-600">
                            <BookOpen className="h-10 w-10" />
                          </div>
                        )}

                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            <span className="font-bold text-sky-600 dark:text-sky-400">
                              {blog.category}
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(blog.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>

                          <h3 className="line-clamp-2 text-base font-bold text-slate-900 transition-colors group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400">
                            {blog.title}
                          </h3>

                          {blog.excerpt && (
                            <p className="line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                              {blog.excerpt}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3 dark:border-slate-800/60">
                        <span className="text-xs font-bold text-sky-600 transition group-hover:text-sky-700 dark:text-sky-400">
                          लेख वाचा (Read Article)
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-sky-600 transition-transform group-hover:translate-x-1 dark:text-sky-400" />
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
