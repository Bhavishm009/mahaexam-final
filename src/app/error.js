"use client";
import { useEffect } from "react";
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow">
        <h1 className="text-2xl font-black">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-500">
          Please try again. If the issue continues, contact support.
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
