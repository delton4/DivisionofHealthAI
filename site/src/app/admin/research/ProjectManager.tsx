"use client";

import { useState, useTransition } from "react";
import { addProject, deleteProject, restoreProject } from "@/lib/actions";
import type { Project } from "@/lib/types";

export function ProjectManager({
  projects,
  hiddenProjects,
}: {
  projects: Project[];
  hiddenProjects: { id: string; name: string }[];
}) {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="mt-8">
      <div className="mb-8">
        {!showAdd ? (
          <button
            onClick={() => setShowAdd(true)}
            className="text-sm px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity"
          >
            Add project
          </button>
        ) : (
          <form action={addProject} className="border border-border rounded-md p-4 space-y-3">
            <div>
              <label className="text-xs text-text-muted block mb-1">Name *</label>
              <input name="name" required className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-foreground focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">Description</label>
              <textarea name="about" rows={3} className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-foreground focus:outline-none focus:border-accent resize-y" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="text-xs px-3 py-1.5 bg-foreground text-background rounded hover:opacity-90">Add</button>
              <button type="button" onClick={() => setShowAdd(false)} className="text-xs px-3 py-1.5 text-text-muted hover:text-foreground">Cancel</button>
            </div>
          </form>
        )}
      </div>

      {hiddenProjects.length > 0 && (
        <div className="mb-8 border border-border rounded-md p-4">
          <h3 className="text-sm font-medium mb-3">Removed projects ({hiddenProjects.length})</h3>
          <div className="space-y-2">
            {hiddenProjects.map((p) => (
              <RestoreRow key={p.id} item={p} />
            ))}
          </div>
        </div>
      )}

      <h3 className="text-sm font-medium mb-4">Active projects</h3>
      <div className="space-y-3">
        {projects.map((p) => (
          <ProjectRow key={p.id} project={p} />
        ))}
      </div>
    </div>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const [isPending, startTransition] = useTransition();
  const [removed, setRemoved] = useState(false);
  if (removed) return null;

  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border">
      <div className="min-w-0">
        <p className="text-sm text-foreground">{project.name}</p>
        {project.about && <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{project.about}</p>}
      </div>
      <button
        onClick={() => startTransition(async () => { await deleteProject(project.id); setRemoved(true); })}
        disabled={isPending}
        className="text-xs text-text-muted hover:text-accent-warm transition-colors shrink-0 disabled:opacity-50"
      >
        {isPending ? "Removing..." : "Remove"}
      </button>
    </div>
  );
}

function RestoreRow({ item }: { item: { id: string; name: string } }) {
  const [isPending, startTransition] = useTransition();
  const [restored, setRestored] = useState(false);
  if (restored) return null;

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-text-muted truncate">{item.name}</span>
      <button
        onClick={() => startTransition(async () => { await restoreProject(item.id); setRestored(true); })}
        disabled={isPending}
        className="text-xs text-accent hover:text-foreground transition-colors shrink-0 disabled:opacity-50"
      >
        {isPending ? "Restoring..." : "Restore"}
      </button>
    </div>
  );
}
