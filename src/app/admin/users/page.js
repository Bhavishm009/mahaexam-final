"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, ShieldAlert, ArrowLeft } from "lucide-react";

export default function UsersPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const d = await res.json();
      setItems(d.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function suspend(id, currentStatus) {
    const nextStatus = currentStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: nextStatus }),
    });
    load();
  }

  async function handleDelete(u) {
    if (u.email === "bhavishm009@gmail.com") {
      alert("⚠️ Primary Super Admin account cannot be deleted.");
      return;
    }
    const confirmed = confirm(
      `Are you sure you want to delete user "${u.name}" (${u.email})?\n\n🛡️ SAFETY GUARANTEE: All questions and exams created by this user will be preserved and reassigned to the Super Admin Question Bank!`,
    );
    if (!confirmed) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?id=${u.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("✅ " + data.message);
        load();
      } else {
        alert("❌ Deletion error: " + (data.error || "Failed to delete"));
      }
    } catch (e) {
      alert("❌ " + e.message);
    }
  }

  const filtered = items.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Admin Overview</span>
          </Link>
          <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            User Directory & Access Control
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Manage student candidates, coaching teachers, and platform administrators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
            Total Users: <span className="text-blue-600 dark:text-blue-400">{items.length}</span>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="flex items-center gap-3 rounded-2xl border border-blue-500/20 bg-blue-50/70 p-4 text-xs text-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
        <ShieldAlert className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
        <div>
          <strong>Safe Deletion Enabled:</strong> Deleting a teacher or student automatically decouples and preserves all questions, global mock tests, and question bank assets into the platform archive.
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        />

        <div className="flex flex-wrap gap-1.5">
          {["ALL", "STUDENT", "TEACHER", "COACHING_ADMIN", "SUPER_ADMIN"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                roleFilter === r
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
              }`}
            >
              {r.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-xs font-bold text-slate-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mr-3" />
            Loading user list...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-slate-400">
            No users match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/70 font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                <tr>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Platform Role</th>
                  <th className="p-4">Organization</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((u) => (
                  <tr key={u.id} className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{u.email || "No email"}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-block rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                      {u.organization?.name || "—"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          u.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {u.email !== "bhavishm009@gmail.com" && (
                          <>
                            <button
                              onClick={() => suspend(u.id, u.status)}
                              className="rounded-xl border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                              {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                            </button>
                            <button
                              onClick={() => handleDelete(u)}
                              className="inline-flex items-center gap-1 rounded-xl border border-rose-500/20 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-600 transition hover:bg-rose-100 active:scale-95 dark:bg-rose-950/30 dark:text-rose-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
