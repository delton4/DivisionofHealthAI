"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PublicationCard } from "@/components/PublicationCard";
import type { Publication } from "@/lib/types";

interface ProjectFilter {
  id: string;
  name: string;
  pubIds: string[];
}

function filterUrl(params: Record<string, string | null>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const qs = sp.toString();
  return `/publications${qs ? `?${qs}` : ""}`;
}

export function PublicationFilter({
  publications,
  journals,
  projectFilters,
  totalCount,
  currentPage,
  totalPages,
  activeJournal,
  activeProject,
}: {
  publications: Publication[];
  journals: string[];
  projectFilters: ProjectFilter[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  activeJournal: string | null;
  activeProject: string | null;
}) {
  const searchParams = useSearchParams();
  const currentJournal = activeJournal ?? searchParams.get("journal");
  const currentProject = activeProject ?? searchParams.get("project");

  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Project filter */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={filterUrl({ journal: currentJournal })}
            className={`text-xs px-3 py-1.5 rounded-md border transition-colors duration-200 ${
              !currentProject
                ? "border-accent text-accent"
                : "border-border text-text-muted hover:text-foreground hover:border-text-muted"
            }`}
          >
            All projects
          </Link>
          {projectFilters.map((p) => (
            <Link
              key={p.id}
              href={filterUrl({
                project: currentProject === p.id ? null : p.id,
                journal: currentJournal,
              })}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors duration-200 ${
                currentProject === p.id
                  ? "border-accent text-accent"
                  : "border-border text-text-muted hover:text-foreground hover:border-text-muted"
              }`}
            >
              {p.name}
            </Link>
          ))}
        </div>

        {/* Journal filter */}
        <div>
          <select
            value={currentJournal || ""}
            onChange={(e) => {
              const val = e.target.value || null;
              window.location.href = filterUrl({ project: currentProject, journal: val });
            }}
            className="text-xs bg-surface border border-border rounded-md px-3 py-1.5 text-text-secondary appearance-none pr-8 focus:outline-none focus:border-accent transition-colors duration-200"
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
        {totalCount} publication{totalCount !== 1 ? "s" : ""}
        {currentProject || currentJournal ? " matching filters" : ""}
        {totalPages > 1 && ` \u00b7 page ${currentPage} of ${totalPages}`}
      </p>

      <div className="max-w-3xl">
        {publications.map((pub) => (
          <PublicationCard key={pub.id} publication={pub} />
        ))}
        {publications.length === 0 && (
          <p className="text-sm text-text-muted py-8">No publications match the selected filters.</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-8 flex items-center gap-4 text-sm" aria-label="Pagination">
          {currentPage > 1 ? (
            <Link
              href={filterUrl({
                project: currentProject,
                journal: currentJournal,
                page: String(currentPage - 1),
              })}
              className="text-text-muted hover:text-foreground transition-colors duration-200"
            >
              Previous
            </Link>
          ) : (
            <span className="text-text-muted/40">Previous</span>
          )}
          <span className="text-text-muted">
            {currentPage} / {totalPages}
          </span>
          {currentPage < totalPages ? (
            <Link
              href={filterUrl({
                project: currentProject,
                journal: currentJournal,
                page: String(currentPage + 1),
              })}
              className="text-text-muted hover:text-foreground transition-colors duration-200"
            >
              Next
            </Link>
          ) : (
            <span className="text-text-muted/40">Next</span>
          )}
        </nav>
      )}
    </div>
  );
}
