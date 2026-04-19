"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PublicationCard } from "@/components/PublicationCard";
import { MonoTag } from "@/components/MonoTag";
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

  const hasFilters = !!(currentProject || currentJournal);

  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* Filters */}
      <div className="mb-10 border border-border bg-surface/30 p-5 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <MonoTag accent="pulse">Filter · Query</MonoTag>
          <span className="label-mono text-text-dim">
            {totalCount} result{totalCount !== 1 ? "s" : ""}
            {hasFilters && " · filtered"}
            {totalPages > 1 && ` · page ${currentPage}/${totalPages}`}
          </span>
          {hasFilters && (
            <Link
              href="/publications"
              className="ml-auto label-mono text-accent-pulse hover:text-foreground transition-colors duration-200"
            >
              Clear
            </Link>
          )}
        </div>

        {/* Project filter chips */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={filterUrl({ journal: currentJournal })}
            className={`label-mono px-3 py-1.5 border transition-colors duration-200 ${
              !currentProject
                ? "border-accent-pulse text-accent-pulse"
                : "border-border text-text-muted hover:text-foreground hover:border-border-strong"
            }`}
          >
            All
          </Link>
          {projectFilters.map((p) => (
            <Link
              key={p.id}
              href={filterUrl({
                project: currentProject === p.id ? null : p.id,
                journal: currentJournal,
              })}
              className={`label-mono px-3 py-1.5 border transition-colors duration-200 ${
                currentProject === p.id
                  ? "border-accent-pulse text-accent-pulse"
                  : "border-border text-text-muted hover:text-foreground hover:border-border-strong"
              }`}
            >
              {p.name}
            </Link>
          ))}
        </div>

        {/* Journal filter */}
        <div className="mt-4 flex items-center gap-3">
          <MonoTag accent="dim">Journal</MonoTag>
          <select
            value={currentJournal || ""}
            onChange={(e) => {
              const val = e.target.value || null;
              window.location.href = filterUrl({ project: currentProject, journal: val });
            }}
            className="ticker-text text-xs bg-surface border border-border px-3 py-1.5 text-text-secondary appearance-none focus:outline-none focus:border-accent-pulse transition-colors duration-200 max-w-xs"
          >
            <option value="">Any journal</option>
            {journals.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <div>
        {publications.map((pub, i) => (
          <PublicationCard
            key={pub.id}
            publication={pub}
            index={(currentPage - 1) * 50 + i}
          />
        ))}
        {publications.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-display text-xl text-text-muted">
              No publications match the selected filters.
            </p>
            <Link
              href="/publications"
              className="mt-3 inline-block label-mono text-accent-pulse hover:text-foreground transition-colors duration-200"
            >
              Reset filters →
            </Link>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          className="mt-12 pt-8 border-t border-border flex items-center justify-between"
          aria-label="Pagination"
        >
          {currentPage > 1 ? (
            <Link
              href={filterUrl({
                project: currentProject,
                journal: currentJournal,
                page: String(currentPage - 1),
              })}
              className="group flex items-center gap-2 label-mono text-text-secondary hover:text-accent-pulse transition-colors duration-200"
            >
              <span
                aria-hidden="true"
                className="transform group-hover:-translate-x-1 transition-transform duration-200"
              >
                ←
              </span>
              Previous
            </Link>
          ) : (
            <span className="label-mono text-text-dim">← Previous</span>
          )}
          <span className="label-mono text-text-muted tabular-nums">
            {String(currentPage).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
          </span>
          {currentPage < totalPages ? (
            <Link
              href={filterUrl({
                project: currentProject,
                journal: currentJournal,
                page: String(currentPage + 1),
              })}
              className="group flex items-center gap-2 label-mono text-text-secondary hover:text-accent-pulse transition-colors duration-200"
            >
              Next
              <span
                aria-hidden="true"
                className="transform group-hover:translate-x-1 transition-transform duration-200"
              >
                →
              </span>
            </Link>
          ) : (
            <span className="label-mono text-text-dim">Next →</span>
          )}
        </nav>
      )}
    </div>
  );
}
