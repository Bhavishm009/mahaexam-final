export default function CoachingLoading() {
  return (
    <div className="space-y-6">
      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="space-y-2 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div className="animate-shimmer h-4 w-24 rounded-md" />
              <div className="animate-shimmer h-8 w-8 rounded-xl" />
            </div>
            <div className="animate-shimmer h-8 w-20 rounded-lg" />
            <div className="animate-shimmer h-3 w-32 rounded-md" />
          </div>
        ))}
      </div>

      {/* Main Table / Grid Skeleton */}
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="animate-shimmer h-6 w-48 rounded-xl" />
          <div className="animate-shimmer h-9 w-32 rounded-xl" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-shimmer h-14 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
