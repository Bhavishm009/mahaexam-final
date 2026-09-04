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
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
          Practice Marketplace
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
          Free practice papers and premium papers from participating coaching institutes.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((x) => (
          <div
            key={x.id}
            className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white sm:text-lg">
                {x.exam?.title}
              </h2>
              <div className="mt-4 text-3xl font-black text-blue-600 dark:text-blue-400">
                ₹{x.price}
              </div>
            </div>
            <a
              href={`/student/checkout/${x.exam?.id}`}
              className="mt-6 block rounded-2xl bg-blue-600 py-3 text-center text-xs font-bold text-white shadow-sm transition hover:bg-blue-500 active:scale-95"
            >
              Unlock Paper
            </a>
          </div>
        ))}
        {!items.length && (
          <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 sm:text-sm">
            No marketplace papers available at this time.
          </div>
        )}
      </div>
    </main>
  );
}
