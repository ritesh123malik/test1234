export default function RouteLoading() {
  return (
    <div className="p-8 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-10 w-48 bg-bg-surface/60 rounded-xl" />
      
      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 bg-bg-surface/40 rounded-[2rem] border border-border-subtle" />
        ))}
      </div>
    </div>
  );
}
