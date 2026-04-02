export function LogoMark({ size = 48, className = "" }: { size?: number; className?: string }) {
  // 15 right-angle triangles arranged in a circle, inspired by Northwell Health's
  // triangle emblem. Warm brown tones instead of the original blue/teal gradient.
  const triangleCount = 15;
  const browns = [
    "#3D2B1F", "#4A3228", "#5C3D2E", "#6B4C3B", "#7A5A45",
    "#8B6B4E", "#9B7B5E", "#A68B6B", "#B4714A", "#C4693B",
    "#D4683B", "#C8A870", "#B5A898", "#9B8B7A", "#8A7968",
  ];

  const cx = 50;
  const cy = 50;
  const radius = 32;
  const triSize = 8;

  const triangles = Array.from({ length: triangleCount }, (_, i) => {
    const angle = (i / triangleCount) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    const rotation = (angle * 180) / Math.PI + 90;

    // Right-angle triangle pointing outward
    const points = [
      `${-triSize / 2},${triSize / 2}`,
      `${triSize / 2},${triSize / 2}`,
      `${triSize / 2},${-triSize / 2}`,
    ].join(" ");

    return (
      <polygon
        key={i}
        points={points}
        fill={browns[i]}
        transform={`translate(${x},${y}) rotate(${rotation})`}
        opacity={0.85 + (i % 3) * 0.05}
      />
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
