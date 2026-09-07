"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Globe, Save, Search, Plus, CheckCircle2, AlertCircle, X } from "lucide-react";

export default function AdminSeoManagementPage() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [saving, setSaving] = useState(false);
  const [customRouteInput, setCustomRouteInput] = useState("");

  const [formData, setFormData] = useState({
    route: "",
    title: "",
    description: "",
    keywords: "",
    canonicalUrl: "",
    ogImage: "",
  });

  const defaultRoutes = [
    "/",
    "/exams",
    "/exams/police-bharti",
    "/exams/mpsc",
    "/jobs",
    "/pricing",
    "/faq",
    "/features",
    "/for-coaching",
  ];

  useEffect(() => {
    fetchSeoSettings();
  }, []);

  async function fetchSeoSettings() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seo");
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(data.settings || []);
      }
    } catch (err) {
      console.error("Error fetching SEO settings:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectRoute(item) {
    setSelectedRoute(item.route);
    setFormData({
      route: item.route,
      title: item.title || "",
      description: item.description || "",
      keywords: Array.isArray(item.keywords) ? item.keywords.join(", ") : item.keywords || "",
      canonicalUrl: item.canonicalUrl || "",
      ogImage: item.ogImage || "",
    });
  }

  function handleCreateNewRoute() {
    const routeInput = prompt("Enter new route path (e.g. /about):");
    if (!routeInput?.trim()) return;
    const cleanRoute = routeInput.trim().startsWith("/")
      ? routeInput.trim()
      : `/${routeInput.trim()}`;

    setSelectedRoute(cleanRoute);
    setFormData({
      route: cleanRoute,
      title: `Maharashtra Bharti & Exams 2026 | MahaExam`,
      description: `Prepare for all major competitive exams on MahaExam.`,
      keywords: "MahaExam, Maharashtra Bharti, Mock Tests",
      canonicalUrl: `https://mahaexam.com${cleanRoute}`,
      ogImage: "https://mahaexam.com/og-image.png",
    });
    toast.info(`Configuring new route '${cleanRoute}'`);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.route?.trim()) {
      toast.error("Route path is required (e.g. /exams/police-bharti).");
      return;
    }
    if (!formData.title?.trim()) {
      toast.error("SEO Meta Title is required.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        route: formData.route,
        title: formData.title,
        description: formData.description,
        keywords: formData.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        canonicalUrl: formData.canonicalUrl || null,
        ogImage: formData.ogImage || null,
      };

      const res = await fetch("/api/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`SEO settings saved for '${formData.route}'!`);
        fetchSeoSettings();
      } else {
        toast.error(data.error || "Failed to save SEO settings");
      }
    } catch (err) {
      toast.error("Network error: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  const existingRoutesMap = new Map(settings.map((s) => [s.route, s]));
  const allRoutesList = Array.from(new Set([...defaultRoutes, ...settings.map((s) => s.route)]));

  const filteredRoutes = allRoutesList.filter((r) =>
    r.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-full min-w-0 max-w-full space-y-6 overflow-x-hidden font-sans">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-sky-600 dark:text-sky-400">
            <Globe className="h-4 w-4 shrink-0" />
            <span>SEO Management & Overrides</span>
          </div>
          <h1 className="mt-1 break-words text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl md:text-3xl">
            Dynamic SEO Manager (Meta Tags & OpenGraph)
          </h1>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Manage page titles, meta descriptions, focus keywords, and OpenGraph tags across all
            platform routes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNewRoute}
          className="glass-btn-primary inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black text-white shadow-md transition active:scale-95 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>+ Add New Route</span>
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid w-full min-w-0 gap-6 lg:grid-cols-12">
        {/* Left Panel: Route List */}
        <div className="w-full min-w-0 space-y-4 lg:col-span-4">
          <div className="relative w-full min-w-0">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Route (e.g. /exams)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200/80 bg-white/90 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none dark:border-slate-800/80 dark:bg-slate-900/90 dark:text-slate-200"
            />
          </div>

          <div className="glass-card w-full min-w-0 space-y-2 p-3">
            <div className="px-3 py-2 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Available Routes ({filteredRoutes.length})
            </div>

            {loading ? (
              <div className="p-4 text-center text-xs font-semibold text-slate-400">
                Loading routes...
              </div>
            ) : (
              <div className="max-h-[500px] space-y-1 overflow-y-auto pr-1">
                {filteredRoutes.map((routePath) => {
                  const item = existingRoutesMap.get(routePath) || { route: routePath };
                  const isSelected = selectedRoute === routePath;
                  const hasCustomSeo = Boolean(existingRoutesMap.has(routePath));

                  return (
                    <button
                      key={routePath}
                      type="button"
                      onClick={() => handleSelectRoute(item)}
                      className={`flex w-full min-w-0 items-center justify-between rounded-2xl px-3.5 py-3 text-left transition ${
                        isSelected
                          ? "bg-gradient-to-r from-sky-500 to-blue-600 font-black text-white shadow-md shadow-sky-500/25"
                          : "hover:bg-slate-200/60 dark:hover:bg-slate-800/80"
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div
                          className={`truncate text-xs font-black ${isSelected ? "text-white" : "text-slate-900 dark:text-white"}`}
                        >
                          {routePath}
                        </div>
                        <div
                          className={`truncate text-[10px] font-semibold ${isSelected ? "text-sky-100" : "text-slate-500 dark:text-slate-400"}`}
                        >
                          {item.title || "Default SEO Applied"}
                        </div>
                      </div>
                      {hasCustomSeo && (
                        <span
                          className={`ml-1 shrink-0 rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "border border-emerald-300/80 bg-emerald-100/90 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                          }`}
                        >
                          Customized
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: SEO Form */}
        <div className="w-full min-w-0 lg:col-span-8">
          {selectedRoute ? (
            <form
              onSubmit={handleSubmit}
              className="glass-card w-full min-w-0 space-y-5 p-4 sm:p-6"
            >
              <div className="flex flex-col justify-between gap-3 border-b border-slate-200/70 pb-4 dark:border-slate-800/80 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-extrabold uppercase text-sky-600 dark:text-sky-400">
                    Editing Route Path
                  </span>
                  <h2 className="truncate break-all text-lg font-black text-slate-900 dark:text-white sm:text-xl">
                    {formData.route}
                  </h2>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="glass-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black text-white shadow-md transition active:scale-95 disabled:opacity-50 sm:w-auto"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? "Saving..." : "Save SEO Settings"}</span>
                </button>
              </div>

              {/* Form Fields */}
              <div className="w-full min-w-0 space-y-4">
                <div className="w-full min-w-0">
                  <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    Page Meta Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maharashtra Police Bharti Practice Papers 2026 | MahaExam"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200/80 bg-slate-100/70 px-4 py-3 text-xs font-semibold text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800/80 dark:bg-slate-950/70 dark:text-white"
                  />
                  <div className="mt-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    Recommended: 50-60 characters ({formData.title.length} chars)
                  </div>
                </div>

                <div className="w-full min-w-0">
                  <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    Meta Description
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Free practice papers and online CBT mock tests for Police Bharti, Talathi, and MPSC exams..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200/80 bg-slate-100/70 px-4 py-3 text-xs font-semibold text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800/80 dark:bg-slate-950/70 dark:text-white"
                  />
                  <div className="mt-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    Recommended: 120-160 characters ({formData.description.length} chars)
                  </div>
                </div>

                <div className="w-full min-w-0">
                  <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    Focus Keywords (Comma Separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Police Bharti 2026, MPSC Online Mock Test, Talathi Paper"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200/80 bg-slate-100/70 px-4 py-3 text-xs font-semibold text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800/80 dark:bg-slate-950/70 dark:text-white"
                  />
                </div>

                <div className="grid w-full min-w-0 gap-4 sm:grid-cols-2">
                  <div className="w-full min-w-0">
                    <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      Canonical URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://mahaexam.com/exams"
                      value={formData.canonicalUrl}
                      onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                      className="mt-1 w-full rounded-2xl border border-slate-200/80 bg-slate-100/70 px-4 py-3 text-xs font-semibold text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800/80 dark:bg-slate-950/70 dark:text-white"
                    />
                  </div>

                  <div className="w-full min-w-0">
                    <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      OG Image URL (Social Share Image)
                    </label>
                    <input
                      type="url"
                      placeholder="https://mahaexam.com/og-banner.png"
                      value={formData.ogImage}
                      onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                      className="mt-1 w-full rounded-2xl border border-slate-200/80 bg-slate-100/70 px-4 py-3 text-xs font-semibold text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800/80 dark:bg-slate-950/70 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Google Search Preview */}
              <div className="mt-6 w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100/70 p-4 dark:border-slate-800/80 dark:bg-slate-950/60">
                <div className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                  🔍 Google Search Preview
                </div>
                <div className="mt-2 w-full min-w-0 space-y-1 overflow-hidden font-sans">
                  <div className="break-all text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {formData.canonicalUrl || `https://mahaexam.com${formData.route}`}
                  </div>
                  <div className="line-clamp-2 break-words text-sm font-bold text-sky-600 dark:text-sky-400">
                    {formData.title || "Enter page title"}
                  </div>
                  <div className="line-clamp-3 break-words text-xs font-medium text-slate-700 dark:text-slate-300">
                    {formData.description || "Enter page meta description"}
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="glass-card flex min-h-[300px] w-full min-w-0 flex-col items-center justify-center p-8 text-center">
              <Globe className="h-10 w-10 text-slate-400 dark:text-slate-500" />
              <h3 className="mt-3 text-base font-black text-slate-800 dark:text-slate-200">
                Select a Route
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                Select a route from the list on the left to edit its SEO configuration or add a new
                route.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
