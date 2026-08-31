"use client";
import { useEffect, useState } from "react";
export default function Users() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    load();
  }, []);
  async function load() {
    const d = await fetch("/api/admin/users").then((r) => r.json());
    setItems(d.users || []);
  }
  async function suspend(id) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "SUSPENDED" }),
    });
    load();
  }
  return (
    <Page title="Users">
      <table>
        <thead>
          <tr>
            <th className="p-4">User</th>
            <th>Role</th>
            <th>Institute</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-4">
                <b>{u.name}</b>
                <div className="text-xs text-slate-500">{u.email}</div>
              </td>
              <td>{u.role}</td>
              <td>{u.organization?.name || "—"}</td>
              <td>{u.status}</td>
              <td>
                {u.status !== "SUSPENDED" && (
                  <button
                    onClick={() => suspend(u.id)}
                    className="rounded-lg bg-red-50 px-3 py-2 text-red-600"
                  >
                    Suspend
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Page>
  );
}
function Page({ title, children }) {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <a href="/admin" className="text-sm font-semibold text-blue-600">
          ← Admin
        </a>
        <h1 className="mt-3 text-3xl font-black">{title}</h1>
        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="overflow-x-auto">{children}</div>
        </div>
      </div>
    </main>
  );
}
