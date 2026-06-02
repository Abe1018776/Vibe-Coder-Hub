export default function Loading() {
  return (
    <div className="mx-auto max-w-[1120px] px-4 py-10 md:px-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-secondary" />
      <div className="mt-3 h-4 w-72 max-w-full animate-pulse rounded bg-secondary/70" />
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-56 animate-pulse rounded-card border border-border bg-secondary/40"
          />
        ))}
      </div>
    </div>
  );
}
