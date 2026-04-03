import Link from "next/link";

export default function NotFound() {
  return (
    <div className="pt-36 pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight">
          Page not found
        </h1>
        <p className="mt-4 text-text-secondary">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 text-sm text-text-muted hover:text-foreground underline underline-offset-4 decoration-text-muted/40 transition-colors duration-200"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
