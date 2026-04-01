import Link from "next/link";
import type { Project } from "@/lib/types";

export function ProjectCard({
  project,
  index = 0,
}: {
  project: Project;
  index?: number;
}) {
  const numeral = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={`/research/${project.slug}`}
      className="flex gap-6 md:gap-8 border-l-2 border-accent-warm pl-6 md:pl-8 py-6 group hover:bg-surface/50 rounded-r-md transition-all duration-200"
    >
      <span className="font-display text-3xl md:text-4xl text-border shrink-0 leading-none">
        {numeral}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="text-xs uppercase tracking-[0.15em] text-text-muted">
              {project.title}
            </span>
            <h3 className="font-display text-xl md:text-2xl text-foreground mt-1 group-hover:text-accent transition-colors duration-200">
              {project.name}
            </h3>
          </div>
          <span className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-2 shrink-0">→</span>
        </div>
        <p className="text-sm text-text-secondary mt-2 line-clamp-2 leading-relaxed">
          {project.about}
        </p>
        <span className="inline-block text-sm text-text-muted mt-3 group-hover:text-accent transition-colors duration-200">
          {project.researcherIds.length} researchers · {project.publicationIds.length} publications
        </span>
      </div>
    </Link>
  );
}
