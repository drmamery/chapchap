export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="card overflow-hidden animate-pulse" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="aspect-square skeleton" />
            <div className="p-4 space-y-2">
              <div className="skeleton h-3 w-1/2 rounded" />
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/3 rounded" />
              <div className="skeleton h-6 w-2/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
