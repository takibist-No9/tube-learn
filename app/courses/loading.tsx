export default function Loading() {
  return (
    <div className="container py-12">
      <div className="mb-8 h-12 w-64 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border">
            <div className="aspect-video animate-pulse bg-muted" />
            <div className="p-4">
              <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
