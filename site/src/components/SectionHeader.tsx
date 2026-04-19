import Link from "next/link";
import { MonoTag } from "@/components/MonoTag";

export function SectionHeader({
  index,
  kicker,
  title,
  href,
  action,
}: {
  index?: string;
  kicker?: string;
  title: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3">
        {index && <MonoTag accent="dim">{index}</MonoTag>}
        {kicker && <MonoTag accent="pulse">{kicker}</MonoTag>}
      </div>
      <div className="mt-3 flex items-end justify-between gap-4 flex-wrap">
        <h2 className="font-display text-4xl md:text-5xl tracking-[-0.015em] leading-[1.02]">
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="label-mono text-text-muted hover:text-accent-pulse transition-colors duration-200 flex items-center gap-1.5 pb-2"
          >
            {action ?? "View all"}
            <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
      <div className="mt-4 divider-ticked" />
    </div>
  );
}
