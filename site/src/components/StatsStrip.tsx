import { MonoTag } from "@/components/MonoTag";

type Stat = {
  label: string;
  value: string;
  suffix?: string;
};

export function StatsStrip({ stats }: { stats: Stat[] }) {
  return (
    <div className="border-y border-border bg-surface/40">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`py-8 px-4 md:px-6 ${
                i % 4 === 0 ? "md:pl-0" : ""
              } ${i === stats.length - 1 ? "md:pr-0" : ""}`}
            >
              <MonoTag accent="dim">{String(i + 1).padStart(2, "0")} · {s.label}</MonoTag>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-4xl md:text-5xl tracking-tight text-foreground tabular-nums">
                  {s.value}
                </span>
                {s.suffix && (
                  <span className="ticker-text text-sm text-text-muted">
                    {s.suffix}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
