"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  Trash2,
  ShieldCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  SlidersHorizontal,
  X,
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Load users from API
  async function loadUsers() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // Suspend / Activate toggle
  async function toggleStatus(id, currentStatus) {
    const nextStatus = currentStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, status: nextStatus } : u)),
        );
      }
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  }

  // Safe delete
  async function deleteUser(u) {
    if (u.email === "bhavishm009@gmail.com") {
      alert("⚠️ Primary Super Admin account cannot be deleted.");
      return;
    }

    const conf = confirm(
      `Delete user "${u.name}" (${u.email})?\n\n🛡️ SAFETY GUARANTEE: All questions and exams created by this user will NOT be deleted. They are automatically preserved and reassigned to the Super Admin Question Bank!`,
    );
    if (!conf) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?id=${u.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("✅ " + data.message);
        setUsers((prev) => prev.filter((item) => item.id !== u.id));
      } else {
        alert("❌ Error: " + (data.error || "Failed to delete"));
      }
    } catch (err) {
      alert("❌ " + err.message);
    }
  }

  // Filtered & Paginated items
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const s = search.toLowerCase();
      const matchesSearch =
        !search ||
        u.name?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s) ||
        u.phone?.toLowerCase().includes(s) ||
        u.organization?.name?.toLowerCase().includes(s);

      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Quick stats
  const stats = useMemo(() => {
    const total = users.length;
    const students = users.filter((u) => u.role === "STUDENT").length;
    const teachers = users.filter((u) => u.role === "TEACHER").length;
    const coachingAdmins = users.filter((u) => u.role === "COACHING_ADMIN").length;
    const active = users.filter((u) => u.status === "ACTIVE").length;
    const suspended = users.filter((u) => u.status === "SUSPENDED").length;
    return { total, students, teachers, coachingAdmins, active, suspended };
  }, [users]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Users className="h-3.5 w-3.5" />
              User Access & Permissions
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Platform Users Management
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            View, search, filter, suspend, and safely remove students, teachers, and coaching admins.
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
            {(roleFilter !== "ALL" || statusFilter !== "ALL") && (
              <span className="flex h-2 w-2 rounded-full bg-blue-600" />
            )}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Total Users", val: stats.total, color: "text-blue-600 dark:text-blue-400" },
          { label: "Students", val: stats.students, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Teachers", val: stats.teachers, color: "text-purple-600 dark:text-purple-400" },
          { label: "Coaching Admins", val: stats.coachingAdmins, color: "text-amber-600 dark:text-amber-400" },
          { label: "Active", val: stats.active, color: "text-teal-600 dark:text-teal-400" },
          { label: "Suspended", val: stats.suspended, color: "text-rose-600 dark:text-rose-400" },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{m.label}</div>
            <div className={`mt-1 text-2xl font-black ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Filter Users
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
              {/* Role Selection */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  User Role (भूमिका)
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="ALL">All Roles (सर्व भूमिका)</option>
                  <option value="STUDENT">Students (विद्यार्थी)</option>
                  <option value="TEACHER">Teachers (शिक्षक)</option>
                  <option value="COACHING_ADMIN">Coaching Admins (अकॅडेमी ॲडमिन)</option>
                  <option value="SUPER_ADMIN">Super Admins (सुपर ॲडमिन)</option>
                </select>
              </div>

              {/* Status Selection */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Account Status (स्थिती)
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="ALL">All Statuses (सर्व)</option>
                  <option value="ACTIVE">Active (सक्रिय)</option>
                  <option value="SUSPENDED">Suspended (निलंबित)</option>
                </select>
              </div>

              {/* Page Size */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Users per Page (प्रति पृष्ठ संख्या)
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value={10}>10 Users per page</option>
                  <option value={25}>25 Users per page</option>
                  <option value={50}>50 Users per page</option>
                  <option value={100}>100 Users per page</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setRoleFilter("ALL");
                  setStatusFilter("ALL");
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="rounded-xl px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-blue-500"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user name, email, phone, or academy..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {["ALL", "STUDENT", "TEACHER", "COACHING_ADMIN"].map((r) => (
            <button
              key={r}
              onClick={() => {
                setRoleFilter(r);
                setCurrentPage(1);
              }}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                roleFilter === r
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {r === "ALL"
                ? "All"
                : r === "STUDENT"
                ? "Students"
                : r === "TEACHER"
                ? "Teachers"
                : "Academies"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex animate-pulse items-center justify-between rounded-2xl bg-slate-100 p-4 dark:bg-slate-800/60"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-3 w-48 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
                <div className="h-6 w-20 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Users className="h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
              No users found
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Try adjusting your search query or reset filter options.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Institute / Academy</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedUsers.map((u) => {
                  const isPrimaryAdmin = u.email === "bhavishm009@gmail.com";
                  const roleStyles = {
                    SUPER_ADMIN: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
                    COACHING_ADMIN: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
                    TEACHER: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
                    STUDENT: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
                  };

                  return (
                    <tr
                      key={u.id}
                      className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-xs font-black text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                            {u.name?.slice(0, 2).toUpperCase() || "US"}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {u.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-block rounded-xl px-2.5 py-1 text-[11px] font-bold ${
                            roleStyles[u.role] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                        {u.organization?.name ? (
                          <span className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-blue-500" />
                            <span>{u.organization.name}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            u.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                          }`}
                        >
                          {u.status === "ACTIVE" ? (
                            <UserCheck className="h-3 w-3" />
                          ) : (
                            <UserX className="h-3 w-3" />
                          )}
                          <span>{u.status}</span>
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        {!isPrimaryAdmin ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => toggleStatus(u.id, u.status)}
                              className={`rounded-xl border px-3 py-1.5 text-[11px] font-bold transition active:scale-95 ${
                                u.status === "ACTIVE"
                                  ? "border-amber-500/30 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300"
                                  : "border-emerald-500/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                              }`}
                            >
                              {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteUser(u)}
                              className="inline-flex items-center gap-1 rounded-xl border border-rose-500/20 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-600 transition hover:bg-rose-100 active:scale-95 dark:bg-rose-950/40 dark:text-rose-300"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Protected</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 p-4 dark:border-slate-800 sm:flex-row">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing{" "}
            <strong>
              {filteredUsers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{" "}
              {Math.min(currentPage * pageSize, filteredUsers.length)}
            </strong>{" "}
            of <strong>{filteredUsers.length}</strong> users
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
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i;
                  if (pageNum > totalPages) {
                    pageNum = totalPages - (4 - i);
                  }
                }
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
