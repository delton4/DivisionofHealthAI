export default function Loading() {
  return (
    <div className="pt-36 pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="h-10 w-48 bg-surface rounded animate-pulse" />
        <div className="mt-6 space-y-3">
          <div className="h-4 w-full max-w-lg bg-surface rounded animate-pulse" />
          <div className="h-4 w-full max-w-md bg-surface rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
