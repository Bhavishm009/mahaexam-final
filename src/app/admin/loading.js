export default function AdminLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="animate-shimmer h-8 w-48 rounded-xl" />
          <div className="animate-shimmer h-4 w-72 rounded-md" />
        </div>
        <div className="animate-shimmer h-10 w-36 rounded-2xl" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="animate-shimmer h-6 w-36 rounded-lg" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-shimmer h-10 w-full rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-shimmer h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
