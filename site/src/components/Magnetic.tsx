"use client";

import { useEffect, useRef } from "react";

/**
 * Wraps its children in a magnetic-hover container. On pointer within a
 * certain radius the inner content translates toward the pointer.
 *
 * Disabled on touch devices and when prefers-reduced-motion is set.
 */
export function Magnetic({
  children,
  strength = 0.35,
  radius = 120,
  className = "",
}: {
  children: React.ReactNode;
  strength?: number;
  radius?: number;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    const isTouch =
      window.matchMedia("(hover: none)").matches || "ontouchstart" in window;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || reduce) return;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      const midY = rect.top + rect.height / 2;
      const dx = e.clientX - midX;
      const dy = e.clientY - midY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) {
        tx = 0;
        ty = 0;
      } else {
        tx = dx * strength;
        ty = dy * strength;
      }
    };

    const onLeave = () => {
      tx = 0;
      ty = 0;
    };

    const loop = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      inner.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [strength, radius]);

  return (
    <div ref={wrapRef} className={className}>
      <div ref={innerRef} style={{ willChange: "transform" }}>
        {children}
      </div>
    </div>
  );
}
