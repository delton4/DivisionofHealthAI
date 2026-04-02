import Link from "next/link";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/research/${project.slug}`}
      className="block py-5 group"
    >
      <h3 className="font-display text-xl md:text-2xl text-foreground group-hover:underline underline-offset-4 decoration-text-muted/40">
        {project.name}
      </h3>
      <p className="text-sm text-text-secondary mt-2 line-clamp-2 leading-relaxed">
        {project.about}
      </p>
      <span className="text-xs text-text-muted mt-2 inline-block">
        {project.researcherIds.length} researchers · {project.publicationIds.length} publications
      </span>
    </Link>
  );
}
