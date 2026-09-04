export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-6xl">
        <div className="font-bold text-blue-600 dark:text-blue-400">MahaExam Admin</div>
        <h1 className="mt-2 text-4xl font-black text-slate-900 dark:text-white">Platform Dashboard</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            ["Students", "12,480"],
            ["Coaching Institutes", "184"],
            ["Active Exams", "62"],
            ["Revenue", "₹8.4L"],
          ].map(([a, b]) => (
            <div key={a} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{a}</div>
              <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{b}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
