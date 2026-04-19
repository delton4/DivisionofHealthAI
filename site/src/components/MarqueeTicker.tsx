"use client";

export function MarqueeTicker({ items }: { items: string[] }) {
  const content = items.concat(items); // duplicate for seamless loop
  return (
    <div className="relative border-y border-border overflow-hidden bg-background">
      <div className="marquee py-3 whitespace-nowrap">
        {content.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 shrink-0 label-mono text-text-muted"
          >
            <span className="text-accent-pulse" aria-hidden="true">◆</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
