export default function ExamLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-shimmer mb-6 h-5 w-48 rounded-md" />

        {/* Hero Card Skeleton */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="animate-shimmer h-6 w-32 rounded-full" />
                <div className="animate-shimmer h-6 w-24 rounded-full" />
              </div>
              <div className="animate-shimmer h-10 w-4/5 rounded-2xl" />
              <div className="animate-shimmer h-6 w-3/5 rounded-xl" />
              <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-shimmer h-24 rounded-2xl" />
                ))}
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
              <div className="animate-shimmer h-6 w-32 rounded-full" />
              <div className="space-y-2 pt-4">
                <div className="animate-shimmer h-4 w-full rounded-md" />
                <div className="animate-shimmer h-4 w-5/6 rounded-md" />
                <div className="animate-shimmer h-4 w-4/6 rounded-md" />
              </div>
              <div className="animate-shimmer h-12 w-full rounded-2xl pt-4" />
            </div>
          </div>
        </div>

        {/* Details Skeleton */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="animate-shimmer h-72 rounded-3xl lg:col-span-1" />
          <div className="animate-shimmer h-72 rounded-3xl lg:col-span-2" />
        </div>
      </div>
    </div>
  );
}
