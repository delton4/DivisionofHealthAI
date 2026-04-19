"use client";

import { useEffect, useRef } from "react";

/**
 * Bioelectric signal canvas. Multi-track: a fast composite (ECG-ish)
 * with a travelling QRS pulse, a slower brain-wave band, and a faint
 * respiration envelope. Cursor position perturbs the fast track — the
 * curve bulges toward the pointer like a held stethoscope.
 */

export function SignalCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = parent.clientWidth;
    let height = parent.clientHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999, active: false };

    const resize = () => {
      width = parent.clientWidth;
      height = parent.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);

    const start = performance.now();
    const spike = { next: 1200 };

    const qrs = (phase: number): number => {
      if (phase < 0 || phase > 1) return 0;
      const x = (phase - 0.5) * 14;
      const env = Math.exp(-x * x);
      const fast = Math.sin(phase * Math.PI * 2 * 3) * 0.35;
      return env * (1 + fast);
    };

    const draw = (now: number) => {
      const t = (now - start) / 1000;

      ctx.clearRect(0, 0, width, height);

      // Faint vertical gridlines (ECG paper-ish).
      ctx.save();
      ctx.strokeStyle = "rgba(237, 234, 229, 0.025)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      ctx.restore();

      // Main baseline.
      const base = height * 0.55 + Math.sin(t * 0.4) * height * 0.015;
      const amp = height * 0.1;

      if (t * 1000 > spike.next) {
        spike.next = t * 1000 + 1250 + Math.random() * 200;
      }
      const spikeLife = 1.25;
      const sp = ((t * 1000 - (spike.next - 1250)) / 1000) / spikeLife;
      const spikeX = width * 0.72;

      // Main track.
      const mainPath: [number, number][] = [];
      const step = 2.2;
      for (let x = 0; x <= width + step; x += step) {
        let v =
          Math.sin(x * 0.018 + t * 1.1) * amp * 0.55 +
          Math.sin(x * 0.006 - t * 0.7) * amp * 0.25 +
          Math.sin(x * 0.042 + t * 2.2) * amp * 0.1;

        // Cursor bulge.
        if (mouse.active) {
          const dx = x - mouse.x;
          const dy = base - mouse.y;
          const d2 = dx * dx + dy * dy;
          const bulge = Math.exp(-d2 / (120 * 120)) * 40;
          v -= bulge;
        }

        const dist = Math.abs(x - spikeX);
        const spread = width * 0.09;
        if (dist < spread && sp >= 0 && sp <= 1) {
          const local = 0.5 + (x - spikeX) / (spread * 2);
          v -= qrs(local) * amp * 2.1 * (1 - Math.abs(sp - 0.4));
        }

        mainPath.push([x, base + v]);
      }

      // Glow pass.
      ctx.save();
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(142, 227, 200, 0.18)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      mainPath.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();

      // Crisp line.
      ctx.strokeStyle = "rgba(237, 234, 229, 0.92)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      mainPath.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
      ctx.restore();

      // Leading scanner.
      const lead = mainPath[mainPath.length - 3];
      if (lead) {
        ctx.save();
        ctx.fillStyle = "rgba(240, 177, 90, 0.95)";
        ctx.beginPath();
        ctx.arc(lead[0], lead[1], 3.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(240, 177, 90, 0.13)";
        ctx.beginPath();
        ctx.arc(lead[0], lead[1], 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Brain-wave / alpha band — fast oscillation in a small band.
      ctx.save();
      ctx.strokeStyle = "rgba(106, 173, 206, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      const alphaBase = height * 0.83;
      for (let x = 0; x <= width; x += 2) {
        const v =
          Math.sin(x * 0.08 - t * 4.5) * height * 0.012 +
          Math.sin(x * 0.16 + t * 2.2) * height * 0.008;
        if (x === 0) ctx.moveTo(x, alphaBase + v);
        else ctx.lineTo(x, alphaBase + v);
      }
      ctx.stroke();
      ctx.restore();

      // Respiration — slow, transparent sine.
      ctx.save();
      ctx.strokeStyle = "rgba(240, 177, 90, 0.14)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      const respBase = height * 0.18;
      for (let x = 0; x <= width; x += 4) {
        const v = Math.sin(x * 0.008 + t * 0.7) * height * 0.035;
        if (x === 0) ctx.moveTo(x, respBase + v);
        else ctx.lineTo(x, respBase + v);
      }
      ctx.stroke();
      ctx.restore();

      // Tick marks.
      ctx.save();
      ctx.fillStyle = "rgba(167, 161, 153, 0.35)";
      ctx.font = "9px ui-monospace, monospace";
      ctx.textBaseline = "top";
      for (let x = 80; x < width; x += 160) {
        ctx.fillRect(x, 0, 1, 6);
        ctx.fillText(`${Math.round((x / width) * 100)}%`, x + 4, 3);
      }
      ctx.restore();

      if (!reduce) rafRef.current = requestAnimationFrame(draw);
    };

    if (reduce) draw(performance.now());
    else rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
