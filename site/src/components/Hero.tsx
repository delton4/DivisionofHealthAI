import Link from "next/link";
import { EditableText } from "@/components/EditableText";
import { SignalCanvas } from "@/components/SignalCanvas";

export function Hero({ subtitle }: { subtitle: string }) {
  return (
    <section className="relative pt-32 pb-14 overflow-hidden">
      {/* Signal canvas layer — sits behind the hero text */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="signal-halo" />
        <div className="absolute inset-x-0 top-28 bottom-0">
          <SignalCanvas className="absolute inset-0 w-full h-full" />
        </div>
        {/* Bottom fade so the signal dissolves into the next section */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>

      {/* Ticker strip (metadata above the title) */}
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="hero-meta flex items-center gap-4 text-text-muted">
          <div className="flex items-center gap-2">
            <span className="status-pulse" />
            <span className="label-mono text-text-secondary">
              Live / Manhasset, NY
            </span>
          </div>
          <span className="label-mono text-text-dim hidden sm:inline">
            · 41.0325° N, 73.7001° W
          </span>
          <span className="ml-auto label-mono text-text-dim hidden sm:inline">
            Lab index — DHAI.01
          </span>
        </div>
      </div>

      {/* Title block */}
      <div className="relative mx-auto max-w-6xl px-6 pt-10">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-9">
            <h1 className="font-display tracking-[-0.02em] leading-[0.92] text-foreground text-[clamp(3.2rem,10vw,7.5rem)]">
              <span className="line-reveal"><span>Division of</span></span>
              <span className="line-reveal">
                <span className="italic text-text-secondary">Health</span>
              </span>
              <span className="line-reveal"><span>Artificial Intelligence</span></span>
            </h1>
          </div>
          <div className="col-span-12 lg:col-span-3 lg:pt-4 flex lg:justify-end">
            <div className="hero-meta flex flex-col gap-1 label-mono text-text-muted">
              <span>Northwell Health</span>
              <span className="text-text-dim">Feinstein Institutes</span>
              <span className="text-text-dim">Est. 2018</span>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-7">
            <div className="hero-subtitle">
              <EditableText
                entity="page"
                entityId="home"
                field="subtitle"
                value={subtitle}
                multiline
                as="p"
                className="text-lg md:text-xl text-foreground/90 leading-relaxed max-w-xl"
              />
            </div>
            <div className="mt-6 h-px w-16 bg-accent-pulse" />
          </div>
          <div className="col-span-12 md:col-span-5 md:pt-1">
            <nav className="hero-links grid grid-cols-2 gap-y-3 gap-x-6 max-w-sm">
              {[
                { href: "/research", label: "Research", code: "R" },
                { href: "/team", label: "Team", code: "T" },
                { href: "/publications", label: "Publications", code: "P" },
                { href: "/join", label: "Join us", code: "J" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group flex items-baseline gap-3 text-foreground/90 hover:text-foreground transition-colors duration-200"
                >
                  <span className="label-mono text-text-dim group-hover:text-accent-pulse transition-colors duration-200">
                    {l.code}
                  </span>
                  <span className="font-display text-xl link-underline pb-0.5">
                    {l.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
