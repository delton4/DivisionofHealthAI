export function MonoTag({
  children,
  accent = "dim",
  className = "",
}: {
  children: React.ReactNode;
  accent?: "dim" | "muted" | "secondary" | "pulse" | "signal" | "accent";
  className?: string;
}) {
  const colorMap: Record<string, string> = {
    dim: "text-text-dim",
    muted: "text-text-muted",
    secondary: "text-text-secondary",
    pulse: "text-accent-pulse",
    signal: "text-accent-signal",
    accent: "text-accent",
  };
  return (
    <span className={`label-mono ${colorMap[accent]} ${className}`}>
      {children}
    </span>
  );
}
