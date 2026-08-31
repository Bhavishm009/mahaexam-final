export default function RootLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      {/* Topbar Skeleton */}
      <div className="h-16 w-full border-b border-slate-200 bg-white/80 px-6 py-3 dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="animate-shimmer h-9 w-9 rounded-xl" />
            <div className="animate-shimmer h-6 w-32 rounded-lg" />
          </div>
          <div className="flex items-center gap-3">
            <div className="animate-shimmer h-9 w-20 rounded-xl" />
            <div className="animate-shimmer h-9 w-28 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="animate-shimmer h-12 w-2/5 rounded-2xl" />
          <div className="animate-shimmer h-6 w-3/5 rounded-xl" />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <div className="animate-shimmer h-6 w-24 rounded-full" />
                  <div className="animate-shimmer h-6 w-16 rounded-full" />
                </div>
                <div className="animate-shimmer h-6 w-4/5 rounded-xl" />
                <div className="animate-shimmer h-4 w-3/5 rounded-lg" />
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="animate-shimmer h-12 rounded-xl" />
                  <div className="animate-shimmer h-12 rounded-xl" />
                  <div className="animate-shimmer h-12 rounded-xl" />
                </div>
                <div className="animate-shimmer h-10 w-full rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
