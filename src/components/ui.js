export function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 ${className}`}
    >
      {children}
    </span>
  );
}

export function Button({ children, className = "", variant = "primary", ...props }) {
  const styles = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 dark:bg-blue-600 dark:hover:bg-blue-500",
    secondary:
      "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
    outline:
      "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:scale-95 dark:bg-red-600 dark:hover:bg-red-500",
  };
  return (
    <button
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function StatCard({ label, value, note }) {
  return (
    <Card className="p-5">
      <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{value}</div>
      {note && (
        <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">{note}</div>
      )}
    </Card>
  );
}
