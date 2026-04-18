"use client";

import { useState } from "react";
import { addProject, deleteProject, restoreProject } from "@/lib/actions";
import { RestoreRow } from "@/components/RestoreRow";
import { ConfirmButton } from "@/components/ConfirmButton";
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
              <RestoreRow
                key={p.id}
                label={p.name}
                onRestore={() => restoreProject(p.id)}
              />
            ))}
          </div>
        </div>
      )}

      <h3 className="text-sm font-medium mb-4">Active projects</h3>
      <div className="space-y-3">
        {projects.map((p) => (
          <div key={p.id} className="flex items-start justify-between gap-4 py-3 border-b border-border">
            <div className="min-w-0">
              <p className="text-sm text-foreground">{p.name}</p>
              {p.about && <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{p.about}</p>}
            </div>
            <ConfirmButton
              label="Remove"
              confirmLabel="Remove?"
              onConfirm={() => deleteProject(p.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
