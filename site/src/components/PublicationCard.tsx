"use client";

import type { Publication } from "@/lib/types";
import { EditableText } from "@/components/EditableText";

export function PublicationCard({
  publication,
}: {
  publication: Publication;
}) {
  const inner = (
    <div className="py-4 border-b border-border">
      <span className="text-xs italic text-text-muted">
        {publication.journal}
      </span>
      <h3 className="text-sm font-medium text-foreground mt-1 leading-snug">
        {publication.name}
      </h3>
      {publication.abstract && (
        <div className="mt-1.5">
          <EditableText
            entity="publication"
            entityId={publication.id}
            field="abstract"
            value={publication.abstract}
            multiline
            as="p"
            className="text-xs text-text-secondary leading-relaxed line-clamp-2"
          />
        </div>
      )}
    </div>
  );

  if (publication.publicationUrl) {
    return (
      <div>
        <a
          href={publication.publicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <div className="py-4 border-b border-border group">
            <span className="text-xs italic text-text-muted">
              {publication.journal}
            </span>
            <h3 className="text-sm font-medium text-foreground mt-1 leading-snug group-hover:underline underline-offset-4 decoration-text-muted/40">
              {publication.name}
            </h3>
          </div>
        </a>
        {publication.abstract && (
          <div className="-mt-4 pb-4 border-b border-border">
            <EditableText
              entity="publication"
              entityId={publication.id}
              field="abstract"
              value={publication.abstract}
              multiline
              as="p"
              className="text-xs text-text-secondary leading-relaxed line-clamp-2"
            />
          </div>
        )}
      </div>
    );
  }

  return <div>{inner}</div>;
}
