"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Users,
  Search,
  Filter,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  SlidersHorizontal,
  Plus,
  X,
  Building2,
} from "lucide-react";
import { getInitials } from "@/lib/avatar";
import { UserAvatar } from "@/components/user-avatar";
import ConfirmModal from "@/components/confirm-modal";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Custom Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add User Form State
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "STUDENT",
    organizationId: "",
    academyName: "",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

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

  // Load organizations for coaching/teacher assignment
  async function loadOrganizations() {
    try {
      const res = await fetch("/api/admin/organizations");
      const data = await res.json();
      setOrganizations(data.organizations || []);
    } catch (err) {
      console.error("Failed to load organizations:", err);
    }
  }

  useEffect(() => {
    loadUsers();
    loadOrganizations();
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
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: nextStatus } : u)));
        toast.success(`User status updated to ${nextStatus}`);
      }
    } catch (err) {
      toast.error("Failed to update status: " + err.message);
    }
  }

  // Safe delete modal trigger
  function handleDeleteClick(u) {
    if (u.email === "bhavishm009@gmail.com") {
      toast.error("⚠️ Primary Super Admin account cannot be deleted.");
      return;
    }
    setDeleteTarget(u);
  }

  async function confirmDeleteUser() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?id=${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("✅ " + data.message);
        setUsers((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        toast.error("❌ Error: " + (data.error || "Failed to delete"));
      }
    } catch (err) {
      toast.error("❌ " + err.message);
    } finally {
      setIsDeleting(false);
    }
  }

  // Handle Add User Form Submission
  async function handleAddUser(e) {
    e.preventDefault();
    setAddError("");

    if (!newUser.name?.trim()) {
      setAddError("⚠️ Full Name is required.");
      toast.error("Full Name is required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newUser.email?.trim() || !emailRegex.test(newUser.email.trim())) {
      setAddError("⚠️ Please enter a valid email address.");
      toast.error("Valid email address is required");
      return;
    }
    if (!newUser.password || newUser.password.length < 6) {
      setAddError("⚠️ Password must be at least 6 characters long.");
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setAddLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`✅ ${data.message || "User created successfully!"}`);
        setShowAddUserModal(false);
        setNewUser({
          name: "",
          email: "",
          password: "",
          phone: "",
          role: "STUDENT",
          organizationId: "",
          academyName: "",
        });
        loadUsers();
      } else {
        setAddError(data.error || "Failed to create user");
        toast.error(data.error || "Failed to create user");
      }
    } catch (err) {
      setAddError(err.message);
      toast.error(err.message);
    } finally {
      setAddLoading(false);
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

  return (
    <div className="space-y-6 font-sans">


      {/* Add User Modal */}
      {showAddUserModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddUserModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Add New Platform User
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {addError && (
              <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddUser} className="mt-4 space-y-3.5">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Full Name *
                </label>
                <input
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Rahul Patil / Prof. Rajesh Deshmukh"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="user@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password *
                  </label>
                  <input
                    required
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    User Role *
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="COACHING_ADMIN">Coaching Admin (Academy)</option>
                    <option value="TEACHER">Teacher / Faculty</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="98XXXXXXXX"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {newUser.role === "COACHING_ADMIN" && (
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    New Academy Name
                  </label>
                  <input
                    value={newUser.academyName}
                    onChange={(e) => setNewUser({ ...newUser, academyName: e.target.value })}
                    placeholder="e.g. Shivneri Career Academy"
                    className="w-full rounded-xl border border-blue-200 bg-blue-50/60 px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-blue-900 dark:bg-blue-950/40 dark:text-white"
                  />
                </div>
              )}

              {newUser.role === "TEACHER" && (
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Assign to Existing Academy
                  </label>
                  <select
                    value={newUser.organizationId}
                    onChange={(e) => setNewUser({ ...newUser, organizationId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">-- Select Academy (Optional) --</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-blue-500 active:scale-95 disabled:opacity-50"
                >
                  {addLoading ? "Creating..." : "Create User Account"}
                </button>
              </div>
            </form>
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
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Filter by Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="ALL">All Roles</option>
                  <option value="STUDENT">Students</option>
                  <option value="TEACHER">Teachers</option>
                  <option value="COACHING_ADMIN">Coaching Admins (Academy)</option>
                  <option value="SUPER_ADMIN">Super Admins</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Filter by Account Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Rows Per Page
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value={10}>10 Users per page</option>
                  <option value={25}>25 Users per page</option>
                  <option value={50}>50 Users per page</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRoleFilter("ALL");
                    setStatusFilter("ALL");
                    setCurrentPage(1);
                  }}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Reset Filters
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilterModal(false)}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-blue-500"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        {/* Header Row: 16px font title, Search, Filter & Add in SAME line */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2.5">
            <h1 className="text-base font-bold text-slate-900 dark:text-white">
              Platform Users
            </h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {filteredUsers.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Search */}
            <div className="relative min-w-[200px] flex-1 sm:w-64 sm:flex-none">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs font-medium text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Filter Button */}
            <button
              type="button"
              onClick={() => setShowFilterModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Filter Options</span>
              {(roleFilter !== "ALL" || statusFilter !== "ALL") && (
                <span className="h-2 w-2 rounded-full bg-blue-600" />
              )}
            </button>

            {/* Add User Button */}
            <button
              type="button"
              onClick={() => setShowAddUserModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New User</span>
            </button>
          </div>
        </div>

        {/* Role Filter Tabs */}
        <div className="flex flex-wrap gap-1 rounded-xl border border-slate-100 bg-slate-50/80 p-1 dark:border-slate-800/80 dark:bg-slate-950/60">
          {[
            { id: "ALL", label: "All Users" },
            { id: "STUDENT", label: "Students" },
            { id: "TEACHER", label: "Teachers" },
            { id: "COACHING_ADMIN", label: "Academies" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setRoleFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                roleFilter === tab.id
                  ? "bg-white text-blue-600 font-bold shadow-xs dark:bg-slate-800 dark:text-blue-400"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:border-slate-800">
                <th className="pb-3 pl-2">User</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Institute / Academy</th>
                <th className="pb-3">Account Status</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    <p className="mt-2 font-bold">Loading users...</p>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No platform users matched your criteria.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          src={u.studentProfile?.profilePhoto}
                          name={u.name}
                          size="sm"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5">
                      <span
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-black ${
                          u.role === "SUPER_ADMIN"
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                            : u.role === "COACHING_ADMIN"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                              : u.role === "TEACHER"
                                ? "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5">
                      {u.organization?.name ? (
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <Building2 className="h-3.5 w-3.5 text-blue-600" />
                          {u.organization.name}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          u.status === "ACTIVE"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {u.status === "ACTIVE" ? (
                          <UserCheck className="h-3 w-3" />
                        ) : (
                          <UserX className="h-3 w-3" />
                        )}
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3.5 pr-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => toggleStatus(u.id, u.status)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                            u.status === "ACTIVE"
                              ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                              : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                          }`}
                        >
                          {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteClick(u)}
                          className="rounded-lg p-1 text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-950/50"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Numbered Pagination Toolbar */}
        {!loading && filteredUsers.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length}{" "}
              users
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((pageNum, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && pageNum - prev > 1;
                  return (
                    <span key={pageNum} className="flex items-center">
                      {showEllipsis && <span className="px-1 text-xs text-slate-400">...</span>}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 w-8 rounded-xl text-xs font-bold transition ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white shadow-sm"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {pageNum}
                      </button>
                    </span>
                  );
                })}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete User Custom Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete User Account"
        description={`Are you sure you want to delete user "${deleteTarget?.name}" (${deleteTarget?.email})?`}
        safetyNote="All questions and exams created by this user will NOT be deleted. They are automatically preserved in the Question Bank!"
        confirmText="Delete User"
        isLoading={isDeleting}
        onConfirm={confirmDeleteUser}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
