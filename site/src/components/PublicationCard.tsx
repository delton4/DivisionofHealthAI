import type { Publication } from "@/lib/types";

export function PublicationCard({
  publication,
}: {
  publication: Publication;
}) {
  const hasLink = !!publication.publicationUrl;

  const inner = (
    <div className="py-4 border-b border-border group-hover:border-text-muted transition-colors duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="text-xs uppercase tracking-[0.12em] text-text-muted">
            {publication.journal}
          </span>
          <h3 className="text-sm font-medium text-foreground mt-1 leading-snug group-hover:text-accent transition-colors duration-200">
            {publication.name}
          </h3>
        </div>
        {hasLink && (
          <span className="text-xs text-text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0 mt-4">→</span>
        )}
      </div>
      {publication.abstract && (
        <p className="text-xs text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
          {publication.abstract}
        </p>
      )}
    </div>
  );

  if (publication.publicationUrl) {
    return (
      <a
        href={publication.publicationUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        {inner}
        <span className="sr-only">Open publication</span>
      </a>
    );
  }

  return <div className="group">{inner}</div>;
}
