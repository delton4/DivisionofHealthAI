"use client";

import { useState, useEffect } from "react";

const triangleCount = 15;
const browns = [
  "#3D2B1F", "#4A3228", "#5C3D2E", "#6B4C3B", "#7A5A45",
  "#8B6B4E", "#9B7B5E", "#A68B6B", "#B4714A", "#C4693B",
  "#D4683B", "#C8A870", "#B5A898", "#9B8B7A", "#8A7968",
];

export function HeroLogo({ size = 120, className = "" }: { size?: number; className?: string }) {
  const [phase, setPhase] = useState<"bloom" | "breathe">("bloom");

  useEffect(() => {
    // Bloom takes ~1.5s (15 triangles * 80ms stagger + 600ms animation)
    const timer = setTimeout(() => setPhase("breathe"), 2000);
    return () => clearTimeout(timer);
  }, []);

  const cx = 50;
  const cy = 50;
  const radius = 32;
  const triSize = 8;

  const triangles = Array.from({ length: triangleCount }, (_, i) => {
    const angle = (i / triangleCount) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    const rotation = (angle * 180) / Math.PI + 90;
    const points = [
      `${-triSize / 2},${triSize / 2}`,
      `${triSize / 2},${triSize / 2}`,
      `${triSize / 2},${-triSize / 2}`,
    ].join(" ");

    return (
      <g
        key={i}
        className={phase === "bloom" ? "hero-bloom-tri" : "hero-breathe-tri"}
        style={{ "--i": String(i), transformOrigin: `${x}px ${y}px` } as React.CSSProperties}
      >
        <polygon
          points={points}
          fill={browns[i]}
          transform={`translate(${x},${y}) rotate(${rotation})`}
        />
      </g>
    );
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {triangles}
    </svg>
  );
}
