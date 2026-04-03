"use client";

import { memo } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";
import { EditableText } from "@/components/EditableText";

export const ProjectCard = memo(function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="py-5">
      <Link
        href={`/research/${project.slug}`}
        className="group"
      >
        <h3 className="font-display text-xl md:text-2xl text-foreground group-hover:underline underline-offset-4 decoration-text-muted/40 inline">
          {project.name}
        </h3>
      </Link>
      <div className="mt-2">
        <EditableText
          entity="project"
          entityId={project.id}
          field="about"
          value={project.about}
          multiline
          as="p"
          className="text-sm text-text-secondary leading-relaxed line-clamp-2"
        />
      </div>
    </div>
  );
});
