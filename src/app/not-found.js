import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <div className="text-center">
        <div className="text-6xl font-black">404</div>
        <p className="mt-2 text-slate-500">Page not found.</p>
        <Link href="/" className="mt-5 inline-block font-semibold text-blue-600">
          Go home
        </Link>
      </div>
    </main>
  );
}
