"use client";
import { useEffect, useState } from "react";
export default function Security() {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    fetch("/api/admin/audit-logs")
      .then((r) => r.json())
      .then((d) => setLogs(d.logs || []));
  }, []);
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-black">Security & Audit</h1>
        <p className="mt-2 text-slate-500">Track important account and platform actions.</p>
        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-4">Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="p-4">{new Date(l.createdAt).toLocaleString()}</td>
                  <td>{l.user?.name || l.user?.email || "System"}</td>
                  <td className="font-semibold">{l.action}</td>
                  <td>
                    {l.resourceType} {l.resourceId || ""}
                  </td>
                  <td>{l.ipAddress || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
