"use client";
import { useEffect } from "react";
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Please try again. If the issue continues, contact support.
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-sm transition-colors hover:bg-blue-500"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
