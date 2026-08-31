"use client";

import { useEffect, useState } from "react";

export default function Marketplace() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("/api/coaching/marketplace/products")
      .then((r) => r.json())
      .then((d) => setItems(d.products || []));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-black">Practice Marketplace</h1>
        <p className="mt-1 text-slate-500">
          Free practice papers and paid papers from participating coaching institutes.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {items.map((x) => (
            <div key={x.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="font-black">{x.exam?.title}</h2>
              <div className="mt-3 text-2xl font-black">₹{x.price}</div>
              <a
                href={`/student/checkout/${x.exam?.id}`}
                className="mt-4 block rounded-xl bg-blue-600 px-4 py-3 text-center font-bold text-white"
              >
                Buy Paper
              </a>
            </div>
          ))}
          {!items.length && (
            <div className="col-span-full rounded-2xl bg-white p-8 text-center text-slate-500">
              No marketplace papers available at this time.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
