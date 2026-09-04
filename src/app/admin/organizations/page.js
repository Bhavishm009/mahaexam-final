"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Building2,
  Plus,
  Mail,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Trash2,
  X,
} from "lucide-react";

const maharashtraDistricts = [
  "Pune",
  "Mumbai City",
  "Mumbai Suburban",
  "Thane",
  "Nagpur",
  "Nashik",
  "Chhatrapati Sambhajinagar (Aurangabad)",
  "Kolhapur",
  "Solapur",
  "Amravati",
  "Nanded",
  "Satara",
  "Sangli",
  "Ahmednagar",
  "Jalgaon",
  "Latur",
  "Dhule",
  "Parbhani",
  "Jalna",
  "Raigad",
  "Ratnagiri",
  "Sindhudurg",
  "Beed",
  "Buldhana",
  "Yavatmal",
  "Washim",
  "Akola",
  "Bhandara",
  "Gondia",
  "Chandrapur",
  "Gadchiroli",
  "Wardha",
  "Hingoli",
  "Osmanabad (Dharashiv)",
  "Nandurbar",
  "Palghar",
];

export default function OrganizationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [alert, setAlert] = useState({ type: "", text: "" });
  const [lastCreated, setLastCreated] = useState(null);

  const [form, setForm] = useState({
    name: "",
    adminName: "",
    email: "",
    phone: "",
    district: "Pune",
    subscriptionPlan: "PROFESSIONAL",
  });

  function load() {
    setLoading(true);
    fetch("/api/admin/organizations")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.organizations || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setAlert({ type: "", text: "" });
    setLastCreated(null);

    try {
      const res = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setAlert({ type: "error", text: data.error || "Failed to create academy" });
      } else {
        setAlert({
          type: "success",
          text: `Academy '${data.organization?.name}' onboarded successfully! Login details emailed to ${data.credentials?.email}`,
        });
        setLastCreated(data.credentials);
        setForm({
          name: "",
          adminName: "",
          email: "",
          phone: "",
          district: "Pune",
          subscriptionPlan: "PROFESSIONAL",
        });
        setShowModal(false);
        load();
      }
    } catch {
      setAlert({ type: "error", text: "Network error. Please try again." });
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(o) {
    const conf = confirm(
      `Are you sure you want to delete academy "${o.name}"?\n\n🛡️ SAFETY GUARANTEE: All questions and tests created by this institute will NOT be deleted. They will remain permanently accessible in the Question Bank & Platform Archives!`,
    );
    if (!conf) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/organizations?id=${o.id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) {
        alert("✅ " + d.message);
        load();
      } else {
        alert("❌ Delete error: " + (d.error || "Failed to delete"));
      }
    } catch (err) {
      alert("❌ " + err.message);
    }
  }

  const filtered = useMemo(() => {
    return items.filter((o) => {
      const s = search.toLowerCase();
      const matchesSearch =
        !search ||
        o.name?.toLowerCase().includes(s) ||
        o.district?.toLowerCase().includes(s) ||
        o.email?.toLowerCase().includes(s) ||
        o.users?.some(
          (u) => u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s),
        );

      const matchesDistrict = districtFilter === "ALL" || o.district === districtFilter;
      const matchesPlan =
        planFilter === "ALL" ||
        o.subscriptionPlan === planFilter ||
        o.subscriptionPlan?.toUpperCase() === planFilter?.toUpperCase();

      return matchesSearch && matchesDistrict && matchesPlan;
    });
  }, [items, search, districtFilter, planFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Building2 className="h-3.5 w-3.5" />
              Institutes Directory
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Coaching Institutes & Academies
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Onboard new academies, dispatch automated credentials, filter by district, and manage
            access.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowFilterModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <SlidersHorizontal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Filter Options</span>
          </button>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-500 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Academy</span>
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {alert.text && (
        <div
          className={`flex items-start gap-3 rounded-2xl p-4 text-xs font-bold sm:text-sm ${
            alert.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200"
              : "border border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/80 dark:text-rose-200"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <div className="flex-1">
            <div>{alert.text}</div>
            {lastCreated && (
              <div className="mt-2.5 rounded-xl bg-white/60 p-3 text-xs dark:bg-slate-900/80">
                <div className="font-bold text-slate-900 dark:text-white">Credentials Sent:</div>
                <div className="mt-1 font-mono text-slate-700 dark:text-slate-300">
                  Email: <strong>{lastCreated.email}</strong> | Temporary Password:{" "}
                  <strong className="text-amber-600 dark:text-amber-400">
                    {lastCreated.password}
                  </strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowFilterModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Filter Academies
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  District (जिल्हा)
                </label>
                <select
                  value={districtFilter}
                  onChange={(e) => {
                    setDistrictFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="ALL">All Districts (सर्व जिल्हे)</option>
                  {maharashtraDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Page Size (प्रति पृष्ठ संख्या)
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value={10}>10 Academies per page</option>
                  <option value={25}>25 Academies per page</option>
                  <option value={50}>50 Academies per page</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setDistrictFilter("ALL");
                  setPlanFilter("ALL");
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="rounded-xl px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-blue-500"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard Academy Modal */}
      {showModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Register New Coaching Academy
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Academy / Institute Name (संस्थेचे नाव) *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="उदा. सह्याद्री करिअर अकॅडेमी"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Director / Admin Name (संचालकांचे नाव) *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      required
                      value={form.adminName}
                      onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                      placeholder="उदा. प्रा. किरण माने"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    District (जिल्हा) *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <select
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      {maharashtraDistricts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Admin Email (अधिकृत ईमेल) *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="academy@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Mobile Number (मोबाईल क्र.)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="98XXXXXXXX"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-500 active:scale-95 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  <span>{creating ? "Creating & Emailing..." : "Onboard Academy"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search academy by name, district, or email..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex animate-pulse items-center justify-between rounded-2xl bg-slate-100 p-4 dark:bg-slate-800/60"
              >
                <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-6 w-20 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-slate-400">
            No coaching institutes match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <tr>
                  <th className="p-4 font-bold">Institute Name</th>
                  <th className="p-4 font-bold">Location</th>
                  <th className="p-4 font-bold">Users</th>
                  <th className="p-4 font-bold">Batches</th>
                  <th className="p-4 font-bold">Exams</th>
                  <th className="p-4 font-bold">Plan</th>
                  <th className="p-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginated.map((o) => (
                  <tr
                    key={o.id}
                    className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                  >
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-xs font-black text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                          {o.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div>{o.name}</div>
                          <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                            {o.users?.[0]?.name ? `${o.users[0].name} · ` : ""}
                            {o.email || o.users?.[0]?.email || o.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-rose-500" />
                        {o.district || "Maharashtra"}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                      {o._count?.users || o.users?.length || 0}
                    </td>
                    <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                      {o._count?.batches || 0}
                    </td>
                    <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                      {o._count?.exams || 0}
                    </td>
                    <td className="p-4">
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
                        {o.subscriptionPlan || "ACTIVE"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(o)}
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-500/20 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-600 transition hover:bg-rose-100 active:scale-95 dark:bg-rose-950/30 dark:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 p-4 dark:border-slate-800 sm:flex-row">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing{" "}
            <strong>
              {filtered.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{" "}
              {Math.min(currentPage * pageSize, filtered.length)}
            </strong>{" "}
            of <strong>{filtered.length}</strong> academies
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-8 w-8 rounded-xl text-xs font-bold transition ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
