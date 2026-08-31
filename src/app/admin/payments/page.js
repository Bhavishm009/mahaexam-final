"use client";
import { useEffect, useState } from "react";
export default function Payments() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    fetch("/api/admin/payments")
      .then((r) => r.json())
      .then((d) => setItems(d.payments || []));
  }, []);
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <a href="/admin" className="text-sm font-semibold text-blue-600">
          ← Admin
        </a>
        <h1 className="mt-3 text-3xl font-black">Payments</h1>
        <div className="mt-8 overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4">Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Institute</th>
                <th>Razorpay</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-4">{new Date(p.createdAt).toLocaleString()}</td>
                  <td>₹{p.amount}</td>
                  <td>{p.status}</td>
                  <td>{p.organization?.name || p.user?.email || "—"}</td>
                  <td>{p.razorpayPaymentId || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
