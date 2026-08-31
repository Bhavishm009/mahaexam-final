export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="font-black text-blue-400">MahaExam Admin</div>
        <h1 className="mt-4 text-4xl font-black">Platform Dashboard</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            ["Students", "12,480"],
            ["Coaching Institutes", "184"],
            ["Active Exams", "62"],
            ["Revenue", "₹8.4L"],
          ].map(([a, b]) => (
            <div key={a} className="rounded-2xl bg-white/10 p-6">
              <div className="text-sm text-slate-400">{a}</div>
              <div className="mt-2 text-3xl font-black">{b}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
