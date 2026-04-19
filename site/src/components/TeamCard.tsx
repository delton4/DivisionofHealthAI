"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Researcher } from "@/lib/types";
import { staticPhotos } from "@/data/static-photos";
import { MonoTag } from "@/components/MonoTag";

export const TeamCard = memo(function TeamCard({
  researcher,
  index,
}: {
  researcher: Researcher;
  index?: number;
}) {
  const photoUrl = researcher.photo || staticPhotos[researcher.slug];
  const initials = researcher.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  const indexLabel =
    typeof index === "number" ? String(index + 1).padStart(3, "0") : "—";

  return (
    <Link
      href={`/team/${researcher.slug}`}
      className="panel group block p-0 rounded-sm"
    >
      <div className="flex items-stretch">
        <div className="relative w-24 h-28 sm:w-28 sm:h-32 shrink-0 overflow-hidden bg-background border-r border-border">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={researcher.name}
              fill
              sizes="112px"
              className="object-cover grayscale contrast-[1.05] group-hover:grayscale-0 transition-all duration-500"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-2xl text-text-dim">
              {initials}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-pulse/0 via-transparent to-accent/0 mix-blend-overlay opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
          <div className="absolute bottom-1 left-1">
            <MonoTag accent="dim">{indexLabel}</MonoTag>
          </div>
        </div>
        <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
          <h3 className="font-display text-lg md:text-xl leading-tight tracking-[-0.01em] text-foreground group-hover:text-accent-pulse transition-colors duration-200">
            {researcher.name}
          </h3>
          {researcher.title && (
            <p className="text-xs text-text-muted mt-1 leading-snug line-clamp-2">
              {researcher.title}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
});
