"use client";

import { useEffect, useRef } from "react";

/**
 * A tubular "nerve" visualization — a sequence of cross-sectional rings
 * projected onto 2D with pseudo-3D rotation, sinusoidal displacement and
 * a travelling pulse. Meant to evoke the lab's vagus-nerve digital-twin
 * work without pretending to be a real scan.
 *
 * Scroll progress morphs the tube; cursor rotates the camera a little.
 */
export function NerveScope({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = container.clientWidth;
    let height = container.clientHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Camera state.
    let yaw = -0.4;
    let pitch = 0.15;
    let yawT = yaw;
    let pitchT = pitch;
    let scrollProgress = 0;

    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      yawT = -0.4 + nx * 0.55;
      pitchT = 0.15 + ny * 0.35;
    };

    const onScroll = () => {
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when container bottom meets viewport top; 1 when top meets bottom.
      const total = vh + rect.height;
      const p = 1 - (rect.top + rect.height) / total;
      scrollProgress = Math.max(0, Math.min(1, p));
    };

    container.addEventListener("pointermove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const rings = 44;
    const segs = 28;
    const start = performance.now();
    let raf = 0;

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      // Smooth camera.
      yaw += (yawT - yaw) * 0.08;
      pitch += (pitchT - pitch) * 0.08;

      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);

      ctx.clearRect(0, 0, width, height);

      const cx2 = width / 2;
      const cy2 = height / 2;
      const baseR = Math.min(width, height) * 0.18;
      const length = Math.min(width, height) * 1.2;

      // Travelling pulse — position along the tube.
      const pulseZ = (t * 0.5 + scrollProgress) % 1;

      type Pt = { x: number; y: number; z: number; depth: number };

      // For each ring, compute its projected points.
      const ringPts: Pt[][] = [];
      for (let i = 0; i < rings; i++) {
        const u = i / (rings - 1); // 0..1 along the tube
        // Curvy centreline.
        const cxLine = Math.sin(u * Math.PI * 2 + t * 0.4) * baseR * 0.6;
        const cyLine = Math.cos(u * Math.PI * 1.5 + t * 0.3) * baseR * 0.3;
        // Radius modulated by position + a little breathing.
        const radius =
          baseR *
          (0.55 + 0.15 * Math.sin(u * Math.PI * 3 + t * 0.6)) *
          (0.92 + 0.08 * Math.sin(t + u * 10));
        // Pulse swell near pulseZ.
        const dist = Math.abs(u - pulseZ);
        const swell = Math.exp(-Math.pow(dist * 10, 2)) * baseR * 0.35;
        const rFinal = radius + swell;

        const points: Pt[] = [];
        for (let s = 0; s < segs; s++) {
          const theta = (s / segs) * Math.PI * 2;
          const cxR = Math.cos(theta);
          const syR = Math.sin(theta);
          // Ring plane is perpendicular to the z-axis.
          const lx = cxLine + cxR * rFinal;
          const ly = cyLine + syR * rFinal;
          const lz = (u - 0.5) * length;

          // Rotate (yaw then pitch).
          const x1 = lx * cy + lz * sy;
          const z1 = -lx * sy + lz * cy;
          const y2 = ly * cp - z1 * sp;
          const z2 = ly * sp + z1 * cp;

          // Project.
          const camDist = length;
          const f = camDist / (camDist + z2 + 400);
          const px = cx2 + x1 * f;
          const py = cy2 + y2 * f;

          points.push({ x: px, y: py, z: z2, depth: f });
        }
        ringPts.push(points);
      }

      // Render rings back-to-front by average z.
      const ringOrder = ringPts
        .map((pts, i) => ({
          i,
          avgZ: pts.reduce((a, p) => a + p.z, 0) / pts.length,
        }))
        .sort((a, b) => b.avgZ - a.avgZ);

      // Longitudinal strands — connect ring i to ring i+1 by segment.
      ctx.lineWidth = 0.7;
      for (let s = 0; s < segs; s++) {
        ctx.beginPath();
        for (let i = 0; i < rings; i++) {
          const p = ringPts[i][s];
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        const alpha = 0.15 + (s / segs) * 0.08;
        ctx.strokeStyle = `rgba(237, 234, 229, ${alpha})`;
        ctx.stroke();
      }

      // Cross-rings — back to front.
      for (const { i } of ringOrder) {
        const pts = ringPts[i];
        const u = i / (rings - 1);
        const dist = Math.abs(u - pulseZ);
        const isPulse = dist < 0.04;
        const depth = pts[0].depth;
        const alpha = Math.min(1, 0.08 + depth * 0.9);

        ctx.beginPath();
        for (let s = 0; s <= segs; s++) {
          const p = pts[s % segs];
          if (s === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.lineWidth = isPulse ? 1.6 : 0.8;
        ctx.strokeStyle = isPulse
          ? `rgba(240, 177, 90, ${0.9 * alpha})`
          : `rgba(142, 227, 200, ${0.28 * alpha})`;
        ctx.stroke();
      }

      // Axis line down the centre.
      ctx.beginPath();
      for (let i = 0; i < rings; i++) {
        const pts = ringPts[i];
        let ax = 0;
        let ay = 0;
        for (const p of pts) {
          ax += p.x;
          ay += p.y;
        }
        ax /= pts.length;
        ay /= pts.length;
        if (i === 0) ctx.moveTo(ax, ay);
        else ctx.lineTo(ax, ay);
      }
      ctx.strokeStyle = "rgba(240, 177, 90, 0.35)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      if (!reduce) raf = requestAnimationFrame(draw);
    };

    if (reduce) {
      draw(performance.now());
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ touchAction: "pan-y" }}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
