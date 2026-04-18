"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Researcher } from "@/lib/types";
import { staticPhotos } from "@/data/static-photos";

export const TeamCard = memo(function TeamCard({ researcher }: { researcher: Researcher }) {
  const photoUrl = researcher.photo || staticPhotos[researcher.slug];

  return (
    <div className="border border-border rounded-md p-5">
      <Link
        href={`/team/${researcher.slug}`}
        className="group"
      >
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-background border border-border overflow-hidden shrink-0">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={researcher.name}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-surface" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-base text-foreground group-hover:underline underline-offset-4 decoration-text-muted/40">
              {researcher.name}
            </h3>
            {researcher.title && (
              <p className="text-sm text-text-muted mt-0.5">{researcher.title}</p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
});
