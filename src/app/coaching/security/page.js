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
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Security & Audit</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Track important account and platform actions.</p>
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-600 dark:bg-slate-800/80 dark:text-slate-400">
              <tr>
                <th className="p-4">Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {logs.map((l) => (
                <tr key={l.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-4 text-slate-600 dark:text-slate-400">{new Date(l.createdAt).toLocaleString()}</td>
                  <td className="font-medium text-slate-900 dark:text-white">{l.user?.name || l.user?.email || "System"}</td>
                  <td className="font-semibold text-blue-600 dark:text-blue-400">{l.action}</td>
                  <td className="text-slate-700 dark:text-slate-300">
                    {l.resourceType} {l.resourceId || ""}
                  </td>
                  <td className="font-mono text-xs text-slate-500 dark:text-slate-400">{l.ipAddress || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
