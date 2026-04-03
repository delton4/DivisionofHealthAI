"use client";

import { useState, useTransition } from "react";
import {
  addResearcher,
  moveResearcherToAlumni,
  deleteAlumni,
  restoreResearcher,
} from "@/lib/actions";
import type { Researcher } from "@/lib/types";

interface DbAlumni {
  id: number;
  name: string;
  credentials: string;
}

export function TeamManager({
  researchers,
  hiddenResearchers,
  dbAlumni,
}: {
  researchers: Researcher[];
  hiddenResearchers: { id: string; name: string; title: string }[];
  dbAlumni: DbAlumni[];
}) {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="mt-8">
      {/* Add new researcher */}
      <div className="mb-8">
        {!showAdd ? (
          <button
            onClick={() => setShowAdd(true)}
            className="text-sm px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity"
          >
            Add researcher
          </button>
        ) : (
          <form action={addResearcher} className="border border-border rounded-md p-4 space-y-3">
            <div>
              <label className="text-xs text-text-muted block mb-1">Name *</label>
              <input name="name" required className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-foreground focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">Title</label>
              <input name="title" className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-foreground focus:outline-none focus:border-accent" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="text-xs px-3 py-1.5 bg-foreground text-background rounded hover:opacity-90">Add</button>
              <button type="button" onClick={() => setShowAdd(false)} className="text-xs px-3 py-1.5 text-text-muted hover:text-foreground">Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* Hidden researchers that can be restored */}
      {hiddenResearchers.length > 0 && (
        <div className="mb-8 border border-border rounded-md p-4">
          <h3 className="text-sm font-medium mb-3">Moved to alumni ({hiddenResearchers.length})</h3>
          <div className="space-y-2">
            {hiddenResearchers.map((r) => (
              <RestoreRow key={r.id} item={r} />
            ))}
          </div>
        </div>
      )}

      {/* Active researchers */}
      <h3 className="text-sm font-medium mb-4">Active researchers</h3>
      <div className="space-y-3">
        {researchers.map((r) => (
          <ResearcherRow key={r.id} researcher={r} />
        ))}
      </div>

      {/* Database alumni (removable) */}
      {dbAlumni.length > 0 && (
        <div className="mt-8 pt-8 border-t border-border">
          <h3 className="text-sm font-medium mb-4">Alumni</h3>
          <div className="space-y-2">
            {dbAlumni.map((a) => (
              <AlumniRow key={a.id} alumni={a} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ResearcherRow({ researcher }: { researcher: Researcher }) {
  const [isPending, startTransition] = useTransition();
  const [removed, setRemoved] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState(researcher.title?.split(",")[0]?.trim() || "");

  if (removed) return null;

  const handleMoveToAlumni = () => {
    startTransition(async () => {
      await moveResearcherToAlumni(researcher.id, researcher.name, credentials);
      setRemoved(true);
    });
  };

  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border">
      <div className="min-w-0">
        <p className="text-sm text-foreground">{researcher.name}</p>
        {researcher.title && <p className="text-xs text-text-muted mt-0.5">{researcher.title}</p>}
      </div>
      {!showCredentials ? (
        <button
          onClick={() => setShowCredentials(true)}
          className="text-xs text-text-muted hover:text-accent-warm transition-colors shrink-0"
        >
          Move to alumni
        </button>
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          <input
            value={credentials}
            onChange={(e) => setCredentials(e.target.value)}
            placeholder="PhD, MD, etc."
            className="w-24 px-2 py-1 bg-surface border border-border rounded text-xs text-foreground"
          />
          <button
            onClick={handleMoveToAlumni}
            disabled={isPending}
            className="text-xs text-accent-warm hover:text-foreground transition-colors disabled:opacity-50"
          >
            {isPending ? "Moving..." : "Confirm"}
          </button>
          <button
            onClick={() => setShowCredentials(false)}
            className="text-xs text-text-muted"
          >
            Cancel
          </button>
        </div>
      )}
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
        onClick={() => startTransition(async () => { await restoreResearcher(item.id); setRestored(true); })}
        disabled={isPending}
        className="text-xs text-accent hover:text-foreground transition-colors shrink-0 disabled:opacity-50"
      >
        {isPending ? "Restoring..." : "Restore"}
      </button>
    </div>
  );
}

function AlumniRow({ alumni }: { alumni: DbAlumni }) {
  const [isPending, startTransition] = useTransition();
  const [removed, setRemoved] = useState(false);
  if (removed) return null;

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-text-muted">{alumni.name} {alumni.credentials}</span>
      <button
        onClick={() => startTransition(async () => { await deleteAlumni(alumni.id); setRemoved(true); })}
        disabled={isPending}
        className="text-xs text-text-muted hover:text-accent-warm transition-colors shrink-0 disabled:opacity-50"
      >
        {isPending ? "Removing..." : "Remove"}
      </button>
    </div>
  );
}
