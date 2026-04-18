export default function Loading() {
  return (
    <div className="pt-36 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        <div className="h-8 w-52 bg-surface rounded animate-pulse" />
        <div className="h-4 w-40 bg-surface rounded animate-pulse mt-2" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border">
              <div className="space-y-1">
                <div className="h-4 w-56 bg-surface rounded animate-pulse" />
                <div className="h-3 w-80 bg-surface rounded animate-pulse" />
              </div>
              <div className="h-4 w-20 bg-surface rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
