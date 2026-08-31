export default function StudentLoading() {
  return (
    <div className="space-y-6">
      {/* Top Banner Skeleton */}
      <div className="animate-shimmer h-32 w-full rounded-3xl" />

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="space-y-2 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div className="animate-shimmer h-4 w-20 rounded-md" />
              <div className="animate-shimmer h-8 w-8 rounded-xl" />
            </div>
            <div className="animate-shimmer h-8 w-16 rounded-lg" />
            <div className="animate-shimmer h-3 w-28 rounded-md" />
          </div>
        ))}
      </div>

      {/* Exams Grid Skeleton */}
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="animate-shimmer h-6 w-48 rounded-xl" />
          <div className="animate-shimmer h-6 w-20 rounded-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40"
            >
              <div className="flex items-center justify-between">
                <div className="animate-shimmer h-5 w-24 rounded-full" />
                <div className="animate-shimmer h-5 w-16 rounded-full" />
              </div>
              <div className="animate-shimmer h-5 w-4/5 rounded-lg" />
              <div className="animate-shimmer h-4 w-2/5 rounded-md" />
              <div className="flex items-center gap-2 pt-2">
                <div className="animate-shimmer h-9 flex-1 rounded-xl" />
                <div className="animate-shimmer h-9 w-20 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
