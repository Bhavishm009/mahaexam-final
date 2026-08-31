"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  Sparkles,
  ArrowLeft,
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
    fetch("/api/admin/organizations")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.organizations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
        load();
      }
    } catch {
      setAlert({ type: "error", text: "Network error. Please try again." });
    } finally {
      setCreating(false);
    }
  }

  const filtered = items.filter(
    (o) =>
      o.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.district?.toLowerCase().includes(search.toLowerCase()) ||
      o.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main className="min-h-screen space-y-6 font-sans text-slate-900 transition-colors dark:text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-blue-100 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Super Admin Organization Manager</span>
              </div>
              <h1 className="mt-3 text-2xl font-black sm:text-3xl">
                Coaching Institutes & Academies
              </h1>
              <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                Add coaching academies with automatic Nodemailer credential dispatch and manage test
                permissions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-2xl bg-white/15 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/25"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Admin Home</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md transition hover:bg-amber-400 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Add Academy</span>
              </button>
            </div>
          </div>
        </div>

        {/* Success Alert with Sent Credentials Info */}
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
                  <div className="font-bold text-slate-900 dark:text-white">
                    Credentials Sent to Admin:
                  </div>
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

        {/* Add Academy Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
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

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Creating an academy automatically provisions their portal account and dispatches
                credentials via Nodemailer.
              </p>

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

        {/* Directory & Stats */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Institutes Directory ({items.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All coaching institutes onboarded across Maharashtra.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search academy or district..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid min-h-[30vh] place-items-center">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <span>Loading institutes...</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                  <tr>
                    <th className="p-4 font-bold">Institute Name</th>
                    <th className="p-4 font-bold">Location</th>
                    <th className="p-4 font-bold">Users</th>
                    <th className="p-4 font-bold">Batches</th>
                    <th className="p-4 font-bold">Exams</th>
                    <th className="p-4 font-bold">Plan</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((o) => (
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
                            <div className="font-mono text-[11px] font-normal text-slate-400">
                              {o.email || o.slug}
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
                        {o._count?.users || 0}
                      </td>
                      <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                        {o._count?.batches || 0}
                      </td>
                      <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                        {o._count?.exams || 0}
                      </td>
                      <td className="p-4">
                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
                          {o.subscriptions?.[0]?.plan?.name || o.subscriptionPlan || "ACTIVE"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={async () => {
                            const conf = confirm(
                              `Are you sure you want to delete academy "${o.name}"?\n\n🛡️ SAFETY GUARANTEE: All questions and tests created by this institute will NOT be deleted. They will remain permanently accessible in the Question Bank & Platform Archives!`,
                            );
                            if (!conf) {
                              return;
                            }
                            try {
                              const res = await fetch(`/api/admin/organizations?id=${o.id}`, {
                                method: "DELETE",
                              });
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
                          }}
                          className="rounded-xl border border-rose-500/20 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-600 transition hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400"
                        >
                          Delete Academy
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!filtered.length && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                        No coaching institutes found. Click &quot;Add Academy&quot; above to onboard
                        your first coaching institute.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
