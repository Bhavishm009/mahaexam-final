export default function BlogsLoading() {
  return (
    <div className="pb-10 pt-2 font-sans sm:pb-14 sm:pt-3">
      <div className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb skeleton */}
        <div className="h-4 w-44 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />

        {/* Hero banner skeleton */}
        <div className="h-48 w-full animate-pulse rounded-3xl bg-slate-200/70 dark:bg-slate-800/60 sm:h-56" />

        {/* Filter toolbar skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <div className="h-8 w-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-8 w-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-8 w-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-9 w-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Cards grid skeleton */}
        <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="glass-card flex flex-col justify-between space-y-4 rounded-3xl p-5 shadow-sm"
            >
              <div className="h-44 w-full animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800/80" />
              <div className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="h-5 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-3/4 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="h-4 w-16 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
