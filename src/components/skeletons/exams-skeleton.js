export function ExamsSkeleton() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center space-y-3">
          <div className="h-8 w-64 mx-auto rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-4 w-96 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
        </div>

        {/* Category Pills Skeleton */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-9 w-28 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 animate-pulse"
            />
          ))}
        </div>

        {/* Exam Cards Grid Skeleton */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-5 w-24 rounded-lg bg-emerald-100/60 dark:bg-emerald-950/40 animate-pulse" />
                  <div className="h-4 w-16 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-5 w-full rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="h-5 w-3/4 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                </div>
                <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60">
                  <div className="h-8 rounded-xl bg-slate-200/60 dark:bg-slate-700/60 animate-pulse" />
                  <div className="h-8 rounded-xl bg-slate-200/60 dark:bg-slate-700/60 animate-pulse" />
                  <div className="h-8 rounded-xl bg-slate-200/60 dark:bg-slate-700/60 animate-pulse" />
                </div>
              </div>
              <div className="mt-6 flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="h-11 flex-1 rounded-2xl bg-blue-600/30 animate-pulse" />
                <div className="h-11 w-11 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
