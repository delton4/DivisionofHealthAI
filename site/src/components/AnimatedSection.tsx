"use client";

import { useSyncExternalStore } from "react";
import { useInView } from "@/hooks/useInView";

function subscribe(callback: () => void) {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerSnapshot() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView({ threshold: 0.08 });
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section
      ref={ref}
      className={`${className} ${
        reducedMotion
          ? ""
          : `transition-all duration-700 ease-out ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`
      }`}
      style={reducedMotion ? undefined : { transitionDelay: `${delay}ms` }}
    >
      {children}
    </section>
  );
}
