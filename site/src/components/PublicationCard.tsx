"use client";

import { memo } from "react";
import type { Publication } from "@/lib/types";
import { EditableText } from "@/components/EditableText";
import { MonoTag } from "@/components/MonoTag";

export const PublicationCard = memo(function PublicationCard({
  publication,
  index,
}: {
  publication: Publication;
  index?: number;
}) {
  const indexLabel =
    typeof index === "number" ? String(index + 1).padStart(3, "0") : "—";

  const journal = publication.journal || "Preprint";

  return (
    <div className="group py-6 border-t border-border first:border-t-0 transition-colors duration-300 hover:bg-surface/30">
      <div className="grid grid-cols-12 gap-4 items-start">
        <div className="col-span-3 sm:col-span-2">
          <MonoTag accent="dim">{indexLabel}</MonoTag>
        </div>
        <div className="col-span-9 sm:col-span-10">
          <MonoTag accent="secondary">{journal}</MonoTag>
          {publication.publicationUrl ? (
            <a
              href={publication.publicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <h3 className="font-display text-lg md:text-xl text-foreground mt-2 leading-snug tracking-[-0.005em] group-hover:text-accent-pulse transition-colors duration-200">
                {publication.name}
              </h3>
            </a>
          ) : (
            <h3 className="font-display text-lg md:text-xl text-foreground mt-2 leading-snug tracking-[-0.005em]">
              {publication.name}
            </h3>
          )}
          {publication.abstract && (
            <div className="mt-2 max-w-3xl">
              <EditableText
                entity="publication"
                entityId={publication.id}
                field="abstract"
                value={publication.abstract}
                multiline
                as="p"
                className="text-sm text-text-secondary leading-relaxed line-clamp-2"
              />
            </div>
          )}
          {publication.publicationUrl && (
            <a
              href={publication.publicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 label-mono text-text-muted hover:text-accent-pulse transition-colors duration-200"
            >
              Read paper
              <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
});
