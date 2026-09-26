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
  Building2,
  RotateCcw,
} from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import ConfirmModal from "@/components/confirm-modal";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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
  function handleDeleteClick(user) {
    setDeleteTarget(user);
  }

  // Confirm delete user execution
  async function confirmDeleteUser() {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/users?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
        toast.success(data.message || `User ${deleteTarget.name} deleted successfully`);
        setDeleteTarget(null);
      } else {
        toast.error(data.error || "Failed to delete user");
      }
    } catch (err) {
      toast.error(err.message || "Network error while deleting user");
    } finally {
      setIsDeleting(false);
    }
  }

  // Add new user
  async function handleAddUser(e) {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("User created successfully!");
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
      <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>Add New Platform User</span>
            </DialogTitle>
            <DialogDescription>
              Create an account for a student, coaching admin, or faculty member.
            </DialogDescription>
          </DialogHeader>

          {addError && (
            <div className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700 dark:bg-red-950/60 dark:text-red-300">
              {addError}
            </div>
          )}

          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="user-name">Full Name *</Label>
              <Input
                id="user-name"
                required
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="e.g. Rahul Patil / Prof. Rajesh Deshmukh"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="user-email">Email Address *</Label>
                <Input
                  id="user-email"
                  required
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="user-password">Password *</Label>
                <Input
                  id="user-password"
                  required
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="user-role">User Role *</Label>
                <select
                  id="user-role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="STUDENT">Student</option>
                  <option value="COACHING_ADMIN">Coaching Admin (Academy)</option>
                  <option value="TEACHER">Teacher / Faculty</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="user-phone">Phone (Optional)</Label>
                <Input
                  id="user-phone"
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="98XXXXXXXX"
                />
              </div>
            </div>

            {newUser.role === "COACHING_ADMIN" && (
              <div className="space-y-1.5">
                <Label htmlFor="academy-name">New Academy Name</Label>
                <Input
                  id="academy-name"
                  value={newUser.academyName}
                  onChange={(e) => setNewUser({ ...newUser, academyName: e.target.value })}
                  placeholder="e.g. Shivneri Career Academy"
                />
              </div>
            )}

            {newUser.role === "TEACHER" && (
              <div className="space-y-1.5">
                <Label htmlFor="academy-org">Assign to Existing Academy</Label>
                <select
                  id="academy-org"
                  value={newUser.organizationId}
                  onChange={(e) => setNewUser({ ...newUser, organizationId: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddUserModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addLoading}>
                {addLoading ? "Creating..." : "Create User Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Filter Modal */}
      <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>Filter Platform Users</span>
            </DialogTitle>
            <DialogDescription>
              Narrow down users by role, status, or pagination size.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Filter by Role</Label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Students</option>
                <option value="TEACHER">Teachers</option>
                <option value="COACHING_ADMIN">Coaching Admins (Academy)</option>
                <option value="SUPER_ADMIN">Super Admins</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Filter by Account Status</Label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Rows Per Page</Label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value={10}>10 Users per page</option>
                <option value={25}>25 Users per page</option>
                <option value={50}>50 Users per page</option>
              </select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRoleFilter("ALL");
                  setStatusFilter("ALL");
                  setCurrentPage(1);
                }}
              >
                <RotateCcw className="mr-1 h-3.5 w-3.5" />
                Reset
              </Button>
              <Button type="button" onClick={() => setShowFilterModal(false)}>
                Apply Filters
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2.5">
              <CardTitle className="text-xl">Platform Users</CardTitle>
              <Badge variant="secondary" className="px-2.5 py-0.5">
                {filteredUsers.length} records
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Quick Search */}
              <div className="relative min-w-[200px] flex-1 sm:w-64 sm:flex-none">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search name, email, phone..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9 pl-9 text-xs"
                />
              </div>

              {/* Filter Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowFilterModal(true)}
                className="h-9 gap-1.5 text-xs font-bold"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Filters</span>
                {(roleFilter !== "ALL" || statusFilter !== "ALL") && (
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                )}
              </Button>

              {/* Add User Button */}
              <Button
                type="button"
                size="sm"
                onClick={() => setShowAddUserModal(true)}
                className="h-9 gap-1.5 text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add User</span>
              </Button>
            </div>
          </div>

          {/* Role Filter Tabs */}
          <div className="mt-2 flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
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
                    ? "shadow-2xs bg-white font-bold text-blue-600 dark:bg-slate-800 dark:text-blue-400"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {/* Table Content */}
          <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Details</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Institute / Academy</TableHead>
                  <TableHead>Account Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      <p className="mt-2 text-xs font-bold">Loading users...</p>
                    </TableCell>
                  </TableRow>
                ) : paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-xs text-slate-400">
                      No platform users matched your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
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
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            u.role === "SUPER_ADMIN"
                              ? "destructive"
                              : u.role === "COACHING_ADMIN"
                                ? "warning"
                                : u.role === "TEACHER"
                                  ? "secondary"
                                  : "info"
                          }
                        >
                          {u.role}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {u.organization?.name ? (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            {u.organization.name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={u.status === "ACTIVE" ? "success" : "destructive"}
                          className="gap-1"
                        >
                          {u.status === "ACTIVE" ? (
                            <UserCheck className="h-3 w-3" />
                          ) : (
                            <UserX className="h-3 w-3" />
                          )}
                          <span>{u.status}</span>
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStatus(u.id, u.status)}
                            className={`h-7 text-xs font-bold ${
                              u.status === "ACTIVE"
                                ? "text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/50"
                                : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50"
                            }`}
                          >
                            {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(u)}
                            className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/50"
                            title="Delete User"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Numbered Pagination Toolbar */}
          {!loading && filteredUsers.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-3 pt-4 sm:flex-row">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length}{" "}
                users
              </span>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((pageNum, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && pageNum - prev > 1;
                    return (
                      <span key={pageNum} className="flex items-center">
                        {showEllipsis && <span className="px-1 text-xs text-slate-400">...</span>}
                        <Button
                          type="button"
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="h-8 w-8 p-0 text-xs"
                        >
                          {pageNum}
                        </Button>
                      </span>
                    );
                  })}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
