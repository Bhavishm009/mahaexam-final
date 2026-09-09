export default function RootLoading() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1 bg-transparent">
      <div className="h-full w-full animate-pulse bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600" />
    </div>
  );
}
