"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EditableText } from "@/components/EditableText";
import { SignalCanvas } from "@/components/SignalCanvas";

export function Hero({ subtitle }: { subtitle: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const [time, setTime] = useState<string>(() => formatTime());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const int = setInterval(() => setTime(formatTime()), 1000);
    return () => clearInterval(int);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const onScroll = () => {
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const h = rect.height || 1;
      const p = Math.max(0, Math.min(1, -rect.top / h));
      setProgress(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden"
      style={{ minHeight: "100vh" }}
    >
      {/* Signal canvas — full-bleed behind everything */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="signal-halo" />
        <SignalCanvas className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-b from-transparent via-background/60 to-background" />
      </div>

      {/* Corner HUD — upper left */}
      <div
        className="absolute top-24 left-6 label-mono text-text-dim space-y-1 hero-meta"
      >
        <div className="flex items-center gap-2 text-text-secondary">
          <span className="status-pulse" />
          <span>Live · {time} ET</span>
        </div>
        <div>Manhasset, NY · 41.0325°N 73.7001°W</div>
        <div>Lab index — DHAI.01 / Rev 2026.04</div>
      </div>

      {/* Corner HUD — upper right */}
      <div
        className="hidden md:block absolute top-24 right-6 label-mono text-text-dim text-right space-y-1 hero-meta"
      >
        <div className="text-text-secondary">Feinstein Institutes</div>
        <div>Northwell Health</div>
        <div>Established 2018</div>
      </div>

      {/* Wordmark — massive, bleed */}
      <div
        ref={wordmarkRef}
        className="relative pt-48 md:pt-56 pb-10 px-6"
        style={{
          transform: `translate3d(0, ${progress * -60}px, 0)`,
          opacity: 1 - progress * 0.7,
        }}
      >
        <h1
          className="font-display tracking-[-0.035em] leading-[0.82] text-foreground"
          style={{ fontSize: "clamp(3.5rem, 17vw, 16rem)" }}
        >
          <span className="line-reveal block">
            <span>Division</span>
          </span>
          <span className="line-reveal block">
            <span>
              of <span className="italic text-text-secondary">Health</span>
            </span>
          </span>
          <span className="line-reveal block relative">
            <span>
              <span className="text-text-secondary">A</span>
              <span>I</span>
              <span className="text-text-secondary italic">.</span>
            </span>
          </span>
        </h1>

        {/* Diagonal meta-line underneath the wordmark */}
        <div className="hero-meta mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-border pt-4">
          <div className="label-mono text-text-muted">
            Clinical AI · Bioelectronic medicine · Imaging · Health systems
          </div>
          <div className="label-mono text-text-dim tabular-nums">
            04/19/2026 · DHAI.v2
          </div>
        </div>
      </div>

      {/* Foreground grid block — subtitle + nav */}
      <div className="relative px-6 pb-24 md:pb-32">
        <div className="mx-auto max-w-6xl grid grid-cols-12 gap-6 md:gap-10">
          <div className="col-span-12 md:col-span-7 hero-subtitle">
            <EditableText
              entity="page"
              entityId="home"
              field="subtitle"
              value={subtitle}
              multiline
              as="p"
              className="font-display text-2xl md:text-3xl leading-[1.3] tracking-[-0.005em] text-foreground/95 max-w-2xl"
            />
            <div className="mt-6 flex items-center gap-3 text-text-muted">
              <div className="h-px w-16 bg-accent-pulse" />
              <span className="label-mono">Scroll to explore</span>
              <span
                aria-hidden="true"
                className="label-mono text-accent-pulse"
                style={{
                  display: "inline-block",
                  animation: "bounce 1.4s ease-in-out infinite",
                }}
              >
                ↓
              </span>
            </div>
          </div>

          <nav className="col-span-12 md:col-span-5 md:col-start-8 hero-links grid grid-cols-2 gap-y-4 self-end">
            {[
              { href: "/research", label: "Research", code: "R" },
              { href: "/team", label: "Team", code: "T" },
              { href: "/publications", label: "Papers", code: "P" },
              { href: "/join", label: "Join us", code: "J" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                data-cursor="link"
                className="group flex items-baseline gap-3 text-foreground/90 hover:text-foreground transition-colors duration-200"
              >
                <span className="label-mono text-text-dim group-hover:text-accent-pulse transition-colors duration-200">
                  {l.code}
                </span>
                <span className="font-display text-2xl md:text-3xl link-underline pb-0.5">
                  {l.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Scroll-driven bottom scan line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-pulse/60 to-transparent"
        style={{
          transform: `translateY(${progress * window_height()}px)`,
          opacity: progress > 0 ? 0.6 : 0,
        }}
      />

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
      `}</style>
    </section>
  );
}

function formatTime(): string {
  const d = new Date();
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "America/New_York",
  });
}

function window_height(): number {
  if (typeof window === "undefined") return 0;
  return window.innerHeight;
}
