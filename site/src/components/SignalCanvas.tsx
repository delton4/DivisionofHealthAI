"use client";

import { useEffect, useRef } from "react";

/**
 * Bioelectric signal canvas. Renders a continuous stream of synthesised
 * physiological-looking waveforms (a smoothed sine, a slow breathing envelope
 * and sparse QRS-style spikes) on a transparent canvas with a faint grid.
 *
 * The visual is intentionally evocative rather than literal — this isn't
 * patient data, it's a research lab signature.
 */

type Sample = { t: number; v: number };

function qrsSpike(phase: number): number {
  // Compact Gaussian-like pulse. Phase is normalised to [0, 1).
  if (phase < 0 || phase > 1) return 0;
  const x = (phase - 0.5) * 14;
  const env = Math.exp(-x * x);
  const fast = Math.sin(phase * Math.PI * 2 * 3) * 0.35;
  return env * (1 + fast);
}

export function SignalCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const samplesRef = useRef<Sample[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    mountedRef.current = true;

    let width = parent.clientWidth;
    let height = parent.clientHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

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

    const start = performance.now();
    const nextSpikeAt = { t: 900 };

    // Precompute grid path (cheap enough, but nicer to keep flat).
    const gridPath = new Path2D();
    const gridSpacing = 28;
    for (let x = 0; x <= 2000; x += gridSpacing) {
      gridPath.moveTo(x, 0);
      gridPath.lineTo(x, 2000);
    }
    for (let y = 0; y <= 2000; y += gridSpacing) {
      gridPath.moveTo(0, y);
      gridPath.lineTo(2000, y);
    }

    const draw = (now: number) => {
      if (!mountedRef.current) return;
      const t = (now - start) / 1000; // seconds

      // Clear and paint faint backdrop grid.
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      ctx.strokeStyle = "rgba(237, 234, 229, 0.035)";
      ctx.lineWidth = 1;
      ctx.stroke(gridPath);
      ctx.restore();

      // Baseline (centre of canvas) with a gentle breathing drift.
      const baseline = height * 0.56 + Math.sin(t * 0.45) * (height * 0.015);

      // Waveform sampling across the canvas.
      const samples: Sample[] = [];
      const step = 2.2;
      const freq1 = 0.018;
      const freq2 = 0.006;
      const freq3 = 0.042;
      const amp = height * 0.1;

      // Trigger a new spike every ~1.3s (heart rate ~46 bpm visual feel).
      if (t * 1000 > nextSpikeAt.t) {
        nextSpikeAt.t = t * 1000 + 1250 + Math.random() * 220;
      }
      const spikeLife = 1.25; // seconds
      const spikePhase = ((t * 1000 - (nextSpikeAt.t - 1250)) / 1000) / spikeLife;
      const spikeCentreX = width * 0.72;

      for (let x = 0; x <= width + step; x += step) {
        // Base composite wave.
        let v =
          Math.sin(x * freq1 + t * 1.1) * amp * 0.55 +
          Math.sin(x * freq2 - t * 0.7) * amp * 0.25 +
          Math.sin(x * freq3 + t * 2.2) * amp * 0.1;

        // Localised QRS-like pulse travelling near `spikeCentreX`.
        const dist = Math.abs(x - spikeCentreX);
        const spread = width * 0.09;
        if (dist < spread && spikePhase >= 0 && spikePhase <= 1) {
          const localPhase = 0.5 + (x - spikeCentreX) / (spread * 2);
          v -= qrsSpike(localPhase) * amp * 2.1 * (1 - Math.abs(spikePhase - 0.4));
        }

        samples.push({ t: x, v: baseline + v });
      }
      samplesRef.current = samples;

      // Main waveform — two passes for a glow feel.
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Outer glow.
      ctx.strokeStyle = "rgba(142, 227, 200, 0.18)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(samples[0].t, samples[0].v);
      for (let i = 1; i < samples.length; i++) {
        ctx.lineTo(samples[i].t, samples[i].v);
      }
      ctx.stroke();

      // Core line.
      ctx.strokeStyle = "rgba(237, 234, 229, 0.88)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(samples[0].t, samples[0].v);
      for (let i = 1; i < samples.length; i++) {
        ctx.lineTo(samples[i].t, samples[i].v);
      }
      ctx.stroke();
      ctx.restore();

      // Leading scanner dot.
      const leadIdx = samples.length - 3;
      const lead = samples[leadIdx];
      if (lead) {
        ctx.save();
        ctx.fillStyle = "rgba(240, 177, 90, 0.9)";
        ctx.beginPath();
        ctx.arc(lead.t, lead.v, 3.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(240, 177, 90, 0.14)";
        ctx.beginPath();
        ctx.arc(lead.t, lead.v, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Secondary slower trace below, sampled from a parallel rhythm.
      ctx.save();
      ctx.strokeStyle = "rgba(106, 173, 206, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      const baseline2 = height * 0.82;
      for (let x = 0; x <= width; x += 3) {
        const v2 =
          Math.sin(x * 0.01 - t * 0.55) * height * 0.04 +
          Math.sin(x * 0.025 + t * 1.5) * height * 0.012;
        if (x === 0) ctx.moveTo(x, baseline2 + v2);
        else ctx.lineTo(x, baseline2 + v2);
      }
      ctx.stroke();
      ctx.restore();

      if (!reduceMotion) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    if (reduceMotion) {
      // Render a single static frame and stop.
      draw(performance.now());
    } else {
      rafRef.current = requestAnimationFrame(draw);
    }

    return () => {
      mountedRef.current = false;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}
