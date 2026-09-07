export default function RootLoading() {
  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center p-6">
      <div className="relative flex flex-col items-center">
        {/* Ambient background glow */}
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-600/20 via-indigo-500/20 to-violet-600/20 blur-2xl dark:from-blue-500/15 dark:to-indigo-500/15" />

        {/* Glassmorphic Brand Card */}
        <div className="glass-card relative flex flex-col items-center rounded-3xl p-8 shadow-2xl shadow-sky-500/10 sm:px-10">
          {/* Animated Logo Container */}
          <div className="relative mb-5">
            <div className="absolute -inset-2 animate-ping rounded-2xl bg-sky-500/20 opacity-75" />
            <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-600 font-black text-white shadow-lg shadow-sky-500/30">
              <span className="text-2xl tracking-tighter">M</span>
            </div>
          </div>

          {/* Title & Portal Badge */}
          <div className="text-center">
            <div className="text-base font-black tracking-tight text-slate-900 dark:text-white">
              Maha<span className="text-sky-600 dark:text-sky-400">Exam</span>
            </div>
            <p className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-200">
              सुरक्षित सत्र लोड होत आहे...
            </p>
          </div>

          {/* Smooth Gradient Progress Bar */}
          <div className="mt-5 h-1.5 w-48 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
            <div className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600" />
          </div>

          <div className="mt-3.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            <span>MahaExam Live Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
