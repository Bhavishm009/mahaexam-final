"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/shell";
import {
  Globe,
  Save,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function AdminSeoManagementPage() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

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
    setSuccessMsg("");
    setErrorMsg("");
  }

  function handleCreateNewRoute() {
    const newRouteName = prompt("नवीन Route मार्ग प्रविष्ट करा (उदा: /exams/mpsc/combine):", "/");
    if (!newRouteName || !newRouteName.trim()) return;
    const cleanRoute = newRouteName.trim();
    setSelectedRoute(cleanRoute);
    setFormData({
      route: cleanRoute,
      title: `महाराष्ट्र भरती व परीक्षा २०२६ | MahaExam`,
      description: `MahaExam वर सर्व महत्वाच्या परीक्षांची तयारी करा.`,
      keywords: "MahaExam, Maharashtra Bharti, Mock Tests",
      canonicalUrl: `https://mahaexam.com${cleanRoute}`,
      ogImage: "https://mahaexam.com/og-image.png",
    });
    setSuccessMsg("");
    setErrorMsg("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const payload = {
        route: formData.route,
        title: formData.title,
        description: formData.description,
        keywords: formData.keywords.split(",").map((k) => k.trim()).filter(Boolean),
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
        setSuccessMsg(`✅ '${formData.route}' चे SEO सेटिंग्ज यशस्वीरीत्या सेव्ह केले!`);
        fetchSeoSettings();
      } else {
        setErrorMsg(data.error || "सेटिंग्ज अपडेट करताना त्रुटी आली.");
      }
    } catch (err) {
      setErrorMsg("नेटवर्क त्रुटी: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  const existingRoutesMap = new Map(settings.map((s) => [s.route, s]));
  const allRoutesList = Array.from(
    new Set([...defaultRoutes, ...settings.map((s) => s.route)])
  );

  const filteredRoutes = allRoutesList.filter((r) =>
    r.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              <Globe className="h-4 w-4" />
              SEO Management & Overrides
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              डायनामिक SEO मॅनेजर (Meta Tags & OpenGraph)
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              वेबसाईटवरील सर्व मुख्य व डायनामिक पेजेसच्या Title, Meta Description व Keywords चे थेट व्यवस्थापन करा.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreateNewRoute}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:bg-blue-500 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>नवीन Route जोडा</span>
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Panel: Route List */}
          <div className="space-y-4 lg:col-span-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Route शोधा (उदा: /exams)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              />
            </div>

            <div className="space-y-2 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="px-3 py-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
                उपलब्ध पेजेस ({filteredRoutes.length})
              </div>

              {loading ? (
                <div className="p-4 text-center text-xs font-semibold text-slate-400">
                  लोड होत आहे...
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
                        className={`flex w-full items-center justify-between rounded-2xl px-3.5 py-3 text-left transition ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-sm"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className={`truncate text-xs font-black ${isSelected ? "text-white" : "text-slate-900 dark:text-white"}`}>
                            {routePath}
                          </div>
                          <div className={`truncate text-[10px] ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                            {item.title || "डिफॉल्ट SEO लागू"}
                          </div>
                        </div>
                        {hasCustomSeo && (
                          <span
                            className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                              isSelected ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
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
          <div className="lg:col-span-8">
            {selectedRoute ? (
              <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-blue-600 dark:text-blue-400">
                      संपादित करत असलेला मार्ग
                    </span>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      {formData.route}
                    </h2>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white shadow-md transition hover:bg-blue-500 active:scale-95 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? "सेव्ह करत आहे..." : "SEO सेव्ह करा"}</span>
                  </button>
                </div>

                {successMsg && (
                  <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      Page Meta Title (मराठी/English)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा: महाराष्ट्र पोलीस भरती सराव पेपर्स २०२६ | MahaExam"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                    <div className="mt-1 text-[10px] text-slate-400">
                      शिफारस: ५०-६० अक्षरे ({formData.title.length} अक्षरे)
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      Meta Description (गूगल शोध परिच्छेद)
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="उदा: पोलीस भरती, तलाठी व MPSC परीक्षांचे मोफत सराव पेपर्स व ऑनलाईन CBT चाचण्या..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                    <div className="mt-1 text-[10px] text-slate-400">
                      शिफारस: १२०-१६० अक्षरे ({formData.description.length} अक्षरे)
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      Focus Keywords (स्वल्पविरामाने वेगळे करा)
                    </label>
                    <input
                      type="text"
                      placeholder="Police Bharti 2026, MPSC Online Mock Test, Talathi Paper"
                      value={formData.keywords}
                      onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        Canonical URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://mahaexam.com/exams"
                        value={formData.canonicalUrl}
                        onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                        className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        OG Image URL (सोशल शेअरिंग इमेज)
                      </label>
                      <input
                        type="url"
                        placeholder="https://mahaexam.com/og-banner.png"
                        value={formData.ogImage}
                        onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                        className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Google Search Preview */}
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="text-[11px] font-black uppercase text-slate-400">
                    🔍 गूगल सर्च प्रिव्ह्यू (Google Search Preview)
                  </div>
                  <div className="mt-2 font-sans">
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      {formData.canonicalUrl || `https://mahaexam.com${formData.route}`}
                    </div>
                    <div className="text-sm font-bold text-blue-700 line-clamp-1 dark:text-blue-400">
                      {formData.title || "शीर्षक प्रविष्ट करा"}
                    </div>
                    <div className="text-xs text-slate-600 line-clamp-2 dark:text-slate-300">
                      {formData.description || "वर्णन प्रविष्ट करा"}
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                <Globe className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                <h3 className="mt-3 text-base font-bold text-slate-700 dark:text-slate-300">
                  Route निवडा
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  डाव्या बाजूच्या यादीतून SEO संपादित करण्यासाठी Route निवडा किंवा नवीन जोडा.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
