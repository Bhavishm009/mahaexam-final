export default function RootLoading() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent dark:border-indigo-400 dark:border-t-transparent" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
