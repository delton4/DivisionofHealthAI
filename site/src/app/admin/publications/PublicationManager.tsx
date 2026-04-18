"use client";

import { useState } from "react";
import { addPublication, deletePublication, restorePublication } from "@/lib/actions";
import { RestoreRow } from "@/components/RestoreRow";
import { ConfirmButton } from "@/components/ConfirmButton";
import type { Publication } from "@/lib/types";

interface HiddenPub {
  id: string;
  name: string;
  journal: string;
}

export function PublicationManager({
  publications,
  hiddenPubs,
}: {
  publications: Publication[];
  hiddenPubs: HiddenPub[];
}) {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="mt-8">
      {/* Add new */}
      <div className="mb-8">
        {!showAdd ? (
          <button
            onClick={() => setShowAdd(true)}
            className="text-sm px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity"
          >
            Add publication
          </button>
        ) : (
          <AddForm onCancel={() => setShowAdd(false)} />
        )}
      </div>

      {/* Hidden (removed) pubs that can be restored */}
      {hiddenPubs.length > 0 && (
        <div className="mb-8 border border-border rounded-md p-4">
          <h3 className="text-sm font-medium mb-3">Removed publications ({hiddenPubs.length})</h3>
          <div className="space-y-2">
            {hiddenPubs.map((pub) => (
              <RestoreRow
                key={pub.id}
                label={pub.name}
                onRestore={() => restorePublication(pub.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Active publications list */}
      <h3 className="text-sm font-medium mb-4">Active publications</h3>
      <div className="space-y-3">
        {publications.map((pub) => (
          <div key={pub.id} className="flex items-start justify-between gap-4 py-3 border-b border-border">
            <div className="min-w-0">
              <span className="text-xs italic text-text-muted">{pub.journal}</span>
              <p className="text-sm text-foreground mt-0.5 leading-snug">{pub.name}</p>
            </div>
            <ConfirmButton
              label="Remove"
              confirmLabel="Remove?"
              onConfirm={() => deletePublication(pub.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function AddForm({ onCancel }: { onCancel: () => void }) {
  return (
    <form action={addPublication} className="border border-border rounded-md p-4 space-y-3">
      <div>
        <label className="text-xs text-text-muted block mb-1">Title *</label>
        <input
          name="name"
          required
          className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-foreground focus:outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="text-xs text-text-muted block mb-1">Journal</label>
        <input
          name="journal"
          className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-foreground focus:outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="text-xs text-text-muted block mb-1">Abstract</label>
        <textarea
          name="abstract"
          rows={3}
          className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-foreground focus:outline-none focus:border-accent resize-y"
        />
      </div>
      <div>
        <label className="text-xs text-text-muted block mb-1">DOI / URL</label>
        <input
          name="publicationUrl"
          className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-foreground focus:outline-none focus:border-accent"
          placeholder="https://doi.org/..."
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="text-xs px-3 py-1.5 bg-foreground text-background rounded hover:opacity-90"
        >
          Add
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs px-3 py-1.5 text-text-muted hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
