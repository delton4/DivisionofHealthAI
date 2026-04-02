import Link from "next/link";
import type { Researcher } from "@/lib/types";

function getInitials(name: string): string {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function TeamCard({ researcher }: { researcher: Researcher }) {
  return (
    <Link
      href={`/team/${researcher.slug}`}
      className="block border border-border rounded-md p-5 hover:border-text-muted transition-colors duration-200 group"
    >
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
          <span className="text-xs font-medium text-text-muted">
            {getInitials(researcher.name)}
          </span>
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-base text-foreground group-hover:underline underline-offset-4 decoration-text-muted/40">
            {researcher.name}
          </h3>
          {researcher.title && (
            <p className="text-sm text-text-muted mt-0.5">{researcher.title}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
