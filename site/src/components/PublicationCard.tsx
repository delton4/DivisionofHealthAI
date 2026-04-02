import type { Publication } from "@/lib/types";

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
      <h3 className="text-sm font-medium text-foreground mt-1 leading-snug group-hover:underline underline-offset-4 decoration-text-muted/40">
        {publication.name}
      </h3>
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
      </a>
    );
  }

  return <div>{inner}</div>;
}
