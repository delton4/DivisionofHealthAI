"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="pt-36 pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-4 text-text-secondary">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-block mt-6 text-sm text-text-muted hover:text-foreground underline underline-offset-4 decoration-text-muted/40 transition-colors duration-200"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
