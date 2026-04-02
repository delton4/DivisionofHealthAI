"use client";

import { useInView } from "@/hooks/useInView";

export function AccentLine({ delay = 300 }: { delay?: number }) {
  const { ref, inView } = useInView({ threshold: 0.5 });

  return (
    <div
      ref={ref}
      className="h-0.5 bg-accent-warm transition-all ease-out mt-3"
      style={{
        width: inView ? 48 : 0,
        transitionDuration: "600ms",
        transitionDelay: `${delay}ms`,
      }}
    />
  );
}
