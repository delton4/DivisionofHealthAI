"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { useAdmin } from "./AdminProvider";
import { linkEntityToResearcher, unlinkEntityFromResearcher } from "@/lib/actions";

export interface AssociationItem {
  id: string;
  name: string;
  slug: string;
  journal?: string;
  publicationUrl?: string;
}

interface AssociationManagerProps {
  researcherId: string;
  entityType: "publication" | "project";
  sectionTitle: string;
  currentItems: AssociationItem[];
  allItems: AssociationItem[];
}

function ProjectItem({ item }: { item: AssociationItem }) {
  return (
    <Link
      href={`/research/${item.slug}`}
      className="text-sm text-foreground underline underline-offset-4 decoration-text-muted/40 hover:decoration-text-secondary transition-colors duration-200"
    >
      {item.name}
    </Link>
  );
}

function PublicationItem({ item }: { item: AssociationItem }) {
  return (
    <div className="border-b border-border pb-4">
      <span className="text-xs italic text-text-muted">{item.journal}</span>
      {item.publicationUrl ? (
        <a
          href={item.publicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm font-medium mt-0.5 text-foreground hover:underline underline-offset-4 decoration-text-muted/40"
        >
          {item.name}
        </a>
      ) : (
        <p className="text-sm font-medium mt-0.5">{item.name}</p>
      )}
    </div>
  );
}

function ItemRenderer({ item, entityType }: { item: AssociationItem; entityType: "publication" | "project" }) {
  if (entityType === "project") return <ProjectItem item={item} />;
  return <PublicationItem item={item} />;
}

export function AssociationManager({
  researcherId,
  entityType,
  sectionTitle,
  currentItems,
  allItems,
}: AssociationManagerProps) {
  const isAdmin = useAdmin();
  const [editing, setEditing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState(currentItems);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pickerOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [pickerOpen]);

  useEffect(() => {
    setItems(currentItems);
  }, [currentItems]);

  const currentIds = new Set(items.map((i) => i.id));
  const available = allItems.filter((item) => {
    if (currentIds.has(item.id)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.journal && item.journal.toLowerCase().includes(q))
    );
  });

  function handleAdd(item: AssociationItem) {
    setError(null);
    setItems((prev) => [...prev, item]);
    startTransition(async () => {
      const result = await linkEntityToResearcher(researcherId, entityType, item.id);
      if ("error" in result) {
        setError(result.error);
        setItems((prev) => prev.filter((i) => i.id !== item.id));
      }
    });
  }

  function handleRemove(itemId: string) {
    setError(null);
    const removed = items.find((i) => i.id === itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    startTransition(async () => {
      const result = await unlinkEntityFromResearcher(researcherId, entityType, itemId);
      if ("error" in result) {
        setError(result.error);
        if (removed) setItems((prev) => [...prev, removed]);
      }
    });
  }

  if (!isAdmin) {
    if (items.length === 0) return null;
    return (
      <section className="mt-12 pt-8 border-t border-border">
        <h2 className="font-display text-xl mb-4">
          {sectionTitle}
          {entityType === "publication" && ` (${items.length})`}
        </h2>
        <div className={entityType === "project" ? "space-y-3" : "space-y-4"}>
          {items.map((item) => (
            <div key={item.id}>
              <ItemRenderer item={item} entityType={entityType} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl">
          {sectionTitle}
          {entityType === "publication" && ` (${items.length})`}
        </h2>
        <button
          onClick={() => {
            setEditing((prev) => !prev);
            setPickerOpen(false);
            setSearch("");
            setError(null);
          }}
          className="text-xs px-2 py-1 border border-accent/30 rounded text-text-muted hover:text-foreground hover:border-accent/60 transition-colors duration-200"
        >
          {editing ? "Done" : "Edit"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400 mb-3">{error}</p>
      )}

      {items.length === 0 && !editing && (
        <p className="text-sm text-text-muted italic">
          No {entityType === "publication" ? "publications" : "projects"} linked yet.
        </p>
      )}

      <div className={entityType === "project" ? "space-y-3" : "space-y-4"}>
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-2">
            <div className="flex-1">
              <ItemRenderer item={item} entityType={entityType} />
            </div>
            {editing && (
              <button
                onClick={() => handleRemove(item.id)}
                disabled={isPending}
                className="shrink-0 mt-0.5 text-xs text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors duration-200"
                title="Remove from profile"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <div className="mt-4">
          {!pickerOpen ? (
            <button
              onClick={() => setPickerOpen(true)}
              className="text-xs px-3 py-1.5 border border-dashed border-accent/30 rounded text-text-muted hover:text-foreground hover:border-accent/60 transition-colors duration-200"
            >
              + Add {entityType === "publication" ? "publication" : "project"}
            </button>
          ) : (
            <div className="border border-accent/20 rounded p-3 bg-surface/50">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${entityType === "publication" ? "publications" : "projects"}...`}
                className="w-full bg-transparent border border-accent/30 rounded px-2 py-1.5 text-sm text-foreground placeholder:text-text-muted/60 focus:outline-none focus:border-accent"
              />
              <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                {available.length === 0 ? (
                  <p className="text-xs text-text-muted py-2">
                    {search ? "No matches found." : "All items are already linked."}
                  </p>
                ) : (
                  available.slice(0, 20).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 py-1.5 px-2 rounded hover:bg-accent/5"
                    >
                      <div className="flex-1 min-w-0">
                        {item.journal && (
                          <span className="text-xs italic text-text-muted block truncate">
                            {item.journal}
                          </span>
                        )}
                        <span className="text-sm text-foreground block truncate">
                          {item.name}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAdd(item)}
                        disabled={isPending}
                        className="shrink-0 text-xs px-2 py-0.5 text-accent hover:text-foreground disabled:opacity-50 transition-colors duration-200"
                      >
                        Add
                      </button>
                    </div>
                  ))
                )}
                {available.length > 20 && (
                  <p className="text-xs text-text-muted py-1 px-2">
                    Showing 20 of {available.length} results. Refine your search.
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setPickerOpen(false);
                  setSearch("");
                }}
                className="mt-2 text-xs text-text-muted hover:text-foreground"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
