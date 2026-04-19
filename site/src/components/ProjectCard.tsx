"use client";

import { memo } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";
import { EditableText } from "@/components/EditableText";

export const ProjectCard = memo(function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index?: number;
}) {
  const indexLabel = typeof index === "number" ? String(index + 1).padStart(2, "0") : project.id.padStart(2, "0");

  return (
    <Link
      href={`/research/${project.slug}`}
      data-cursor="card"
      data-cursor-label="Open →"
      className="group block py-7 border-t border-border transition-colors duration-300 hover:bg-surface/40"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-12 gap-6 items-start">
          <div className="col-span-12 md:col-span-1">
            <span className="index-num">{indexLabel}</span>
          </div>
          <div className="col-span-12 md:col-span-6">
            <h3 className="font-display text-2xl md:text-3xl tracking-[-0.01em] text-foreground leading-[1.1] transition-colors duration-200 group-hover:text-accent-pulse">
              {project.name}
            </h3>
          </div>
          <div className="col-span-12 md:col-span-4">
            <EditableText
              entity="project"
              entityId={project.id}
              field="about"
              value={project.about}
              multiline
              as="p"
              className="text-sm text-text-secondary leading-relaxed line-clamp-3"
            />
          </div>
          <div className="hidden md:flex col-span-1 justify-end pt-3">
            <span
              aria-hidden="true"
              className="label-mono text-text-dim group-hover:text-accent-pulse transition-colors duration-200 group-hover:translate-x-1 transform transition-transform"
            >
              →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
});
