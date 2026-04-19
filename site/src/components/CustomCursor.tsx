"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A pointer-following cursor with contextual states. Pure DOM + rAF
 * smoothing — no animation library.
 *
 * States:
 *   - idle:       small dot
 *   - link:       grows, becomes a ring
 *   - card:       grows and shows "↗"
 *   - heading:    wide bar like a reticle
 *   - hidden:     when the pointer is a touch device or offscreen
 */

type Mode = "idle" | "link" | "card" | "heading";

const MODE_ATTR = "data-cursor";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [label, setLabel] = useState<string>("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't render on touch devices.
    const isTouch =
      window.matchMedia("(hover: none)").matches ||
      "ontouchstart" in window;
    if (isTouch) return;

    let targetX = 0;
    let targetY = 0;
    let dotX = 0;
    let dotY = 0;
    let ringX = 0;
    let ringY = 0;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visibleRef.current) setVisibleRef(true);

      // Walk up the DOM looking for interesting elements.
      const el = e.target as HTMLElement | null;
      if (!el) return;

      const closest = el.closest<HTMLElement>("[data-cursor]");
      if (closest) {
        const m = closest.getAttribute(MODE_ATTR) as Mode;
        const lbl = closest.getAttribute("data-cursor-label") || "";
        modeRef.current = m;
        setMode(m);
        setLabel(lbl);
        return;
      }

      if (el.closest("a, button, [role='button']")) {
        modeRef.current = "link";
        setMode("link");
        setLabel("");
        return;
      }

      if (el.closest("h1, h2, h3")) {
        modeRef.current = "heading";
        setMode("heading");
        setLabel("");
        return;
      }

      modeRef.current = "idle";
      setMode("idle");
      setLabel("");
    };

    const onLeave = () => setVisibleRef(false);
    const onEnter = () => setVisibleRef(true);

    // Use mutable refs to avoid re-subscribing inside rAF.
    const visibleRef = { current: false };
    const setVisibleRef = (v: boolean) => {
      if (visibleRef.current === v) return;
      visibleRef.current = v;
      setVisible(v);
    };
    const modeRef = { current: "idle" as Mode };

    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onEnter);

    const loop = () => {
      // Dot follows at ~90% easing (snappy).
      dotX += (targetX - dotX) * 0.5;
      dotY += (targetY - dotY) * 0.5;
      // Ring lags for a trailing feel.
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;

      const dot = dotRef.current;
      const ring = ringRef.current;
      if (dot) dot.style.transform = `translate3d(${dotX - 3}px, ${dotY - 3}px, 0)`;
      if (ring) ring.style.transform = `translate3d(${ringX - 20}px, ${ringY - 20}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9998]"
      style={{ visibility: visible ? "visible" : "hidden" }}
    >
      <div
        ref={dotRef}
        className="absolute left-0 top-0 w-1.5 h-1.5 rounded-full bg-accent-pulse"
        style={{ transition: "background-color 200ms ease" }}
      />
      <div
        ref={ringRef}
        className={`absolute left-0 top-0 flex items-center justify-center transition-[width,height,border-color,background-color,border-radius] duration-300 ease-out ${
          mode === "idle"
            ? "w-10 h-10 border border-foreground/15 rounded-full"
            : mode === "link"
              ? "w-12 h-12 border border-accent-pulse rounded-full bg-accent-pulse/5"
              : mode === "card"
                ? "w-14 h-14 border border-accent-pulse rounded-full bg-accent-pulse/10"
                : "w-16 h-4 border border-foreground/30 rounded-sm bg-transparent"
        }`}
      >
        {mode === "card" && (
          <span className="font-mono text-xs text-accent-pulse">
            {label || "↗"}
          </span>
        )}
      </div>
    </div>
  );
}
