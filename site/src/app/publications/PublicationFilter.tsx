"use client";

import { useState } from "react";
import { PublicationCard } from "@/components/PublicationCard";
import type { Publication } from "@/lib/types";

interface ProjectFilter {
  id: string;
  name: string;
  pubIds: string[];
}

export function PublicationFilter({
  publications,
  journals,
  projectFilters,
}: {
  publications: Publication[];
  journals: string[];
  projectFilters: ProjectFilter[];
}) {
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [activeJournal, setActiveJournal] = useState<string | null>(null);

  let filtered = publications;

  if (activeProject) {
    const project = projectFilters.find((p) => p.id === activeProject);
    if (project) {
      filtered = filtered.filter((pub) => project.pubIds.includes(pub.id));
    }
  }

  if (activeJournal) {
    filtered = filtered.filter((pub) => pub.journal === activeJournal);
  }

  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Project filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveProject(null)}
            className={`text-xs px-3 py-1.5 rounded-md border transition-colors duration-200 ${
              activeProject === null
                ? "border-accent text-accent"
                : "border-border text-text-muted hover:text-foreground hover:border-text-muted"
            }`}
          >
            All projects
          </button>
          {projectFilters.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveProject(activeProject === p.id ? null : p.id)}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors duration-200 ${
                activeProject === p.id
                  ? "border-accent text-accent"
                  : "border-border text-text-muted hover:text-foreground hover:border-text-muted"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Journal filter */}
        <div>
          <select
            value={activeJournal || ""}
            onChange={(e) => setActiveJournal(e.target.value || null)}
            className="text-xs bg-surface border border-border rounded-md px-3 py-1.5 text-text-secondary focus:outline-none focus:border-accent transition-colors duration-200"
          >
            <option value="">All journals</option>
            {journals.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <p className="text-xs text-text-muted mb-6">
        {filtered.length} publication{filtered.length !== 1 ? "s" : ""}
        {activeProject || activeJournal ? " matching filters" : ""}
      </p>

      <div className="max-w-3xl">
        {filtered.map((pub) => (
          <PublicationCard key={pub.id} publication={pub} />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-text-muted py-8">No publications match the selected filters.</p>
        )}
      </div>
    </div>
  );
}
