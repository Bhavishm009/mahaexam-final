export function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border bg-white shadow-sm ${className}`}>{children}</div>;
}

export function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ${className}`}
    >
      {children}
    </span>
  );
}

export function Button({ children, className = "", variant = "primary", ...props }) {
  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200",
    outline: "border bg-white text-slate-800 hover:bg-slate-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
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
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
      {note && <div className="mt-2 text-xs text-slate-500">{note}</div>}
    </Card>
  );
}
